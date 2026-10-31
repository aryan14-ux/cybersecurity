/**
 * XSS Detection Engine — Educational DAST-Style Scanner
 *
 * This scanner operates ONLY against authorized lab endpoints.
 * It is NOT a general-purpose vulnerability scanner.
 */

export interface ScanConfig {
  targetUrl: string;
  labId?: string;
}

export interface ScanFinding {
  type: "REFLECTED" | "STORED" | "DOM" | "FILTER_BYPASS" | "CONTEXT";
  severity: "LOW" | "MEDIUM" | "HIGH" | "CRITICAL";
  confidence: number;
  parameter: string;
  context: string;
  evidence: string;
  remediation: string;
}

// Canary tokens used for detection
const CANARY_PREFIX = "XSSLAB";
const CANARY_TOKENS = [
  `${CANARY_PREFIX}_REFLECT_TEST`,
  `<${CANARY_PREFIX}_TAG>`,
  `"${CANARY_PREFIX}_ATTR"`,
  `'${CANARY_PREFIX}_SQUOTE'`,
  `<img src=x onerror=${CANARY_PREFIX}_EVENT>`,
  `<script>${CANARY_PREFIX}_SCRIPT</script>`,
  `javascript:${CANARY_PREFIX}_PROTO`,
];

// Allowed scan targets (must match lab environment)
const ALLOWED_ORIGINS = (
  process.env.SCANNER_ALLOWED_ORIGINS || "http://localhost:3000"
)
  .split(",")
  .map((o) => o.trim());

export function isAllowedTarget(url: string): boolean {
  try {
    const parsed = new URL(url);
    return ALLOWED_ORIGINS.some(
      (origin) =>
        parsed.origin === origin ||
        parsed.hostname === "localhost" ||
        parsed.hostname === "127.0.0.1"
    );
  } catch {
    return false;
  }
}

export function isLabEndpoint(url: string): boolean {
  try {
    const parsed = new URL(url);
    return parsed.pathname.startsWith("/labs/");
  } catch {
    return false;
  }
}

export async function scanEndpoint(
  config: ScanConfig,
  baseUrl: string
): Promise<ScanFinding[]> {
  const findings: ScanFinding[] = [];
  const targetUrl = config.targetUrl;

  // Validate target is authorized
  const fullUrl = targetUrl.startsWith("http")
    ? targetUrl
    : `${baseUrl}${targetUrl}`;

  if (!isAllowedTarget(fullUrl)) {
    throw new Error(
      "Target is not in the allowed scan list. Scanner can only scan authorized lab endpoints."
    );
  }

  if (!isLabEndpoint(fullUrl)) {
    throw new Error(
      "Scanner can only scan lab environment endpoints (/labs/*)."
    );
  }

  // Discover parameters from the URL
  const url = new URL(fullUrl);
  const params = Array.from(url.searchParams.keys());

  // If no params, try common ones
  const testParams =
    params.length > 0 ? params : ["q", "search", "query", "user", "input"];

  for (const param of testParams) {
    const promises = CANARY_TOKENS.map(async (canary) => {
      try {
        const testUrl = new URL(fullUrl);
        testUrl.searchParams.set(param, canary);

        const response = await fetch(testUrl.toString(), {
          redirect: "follow",
          signal: AbortSignal.timeout(3000),
          headers: {
            "User-Agent": "XSSLab-Scanner/1.0 (Educational)",
          },
        });

        if (!response.ok) return null;

        const rawBody = await response.text();
        // Strip Next.js internal framework flight data scripts to prevent false-positives from JSON prop serialization
        const body = rawBody.replace(
          /<script[^>]*>(?:(?!<\/script>)[\s\S])*?self\.__next_f(?:(?!<\/script>)[\s\S])*?<\/script>/gi,
          ""
        );
        return analyzeResponse(body, canary, param);
      } catch {
        return null;
      }
    });

    const results = await Promise.allSettled(promises);
    for (const res of results) {
      if (res.status === "fulfilled" && res.value) {
        findings.push(res.value);
      }
    }
  }

  // Deduplicate findings by parameter
  const uniqueFindings = deduplicateFindings(findings);
  return uniqueFindings;
}

function analyzeResponse(
  body: string,
  canary: string,
  parameter: string
): ScanFinding | null {
  // Plain probe token only tests if parameter is reflected; not a vulnerability itself
  if (canary === `${CANARY_PREFIX}_REFLECT_TEST`) {
    return null;
  }

  // Check if canary is reflected in the response
  if (!body.includes(canary)) {
    return null;
  }

  // Check if dangerous characters were properly HTML entity encoded
  const isEncoded =
    body.includes(canary.replace(/</g, "&lt;").replace(/>/g, "&gt;")) ||
    body.includes(canary.replace(/"/g, "&quot;")) ||
    body.includes(canary.replace(/'/g, "&#39;")) ||
    body.includes(canary.replace(/'/g, "&#x27;"));

  if (isEncoded && !body.includes(canary)) {
    // Input is encoded — secure
    return null;
  }

  // Determine context
  const context = determineContext(body, canary);

  // If inside an attribute, verify that the canary can actually escape the enclosing quotes
  if (context === "Attribute") {
    const canaryIdx = body.indexOf(canary);
    const before = body.substring(Math.max(0, canaryIdx - 80), canaryIdx);
    const eqIdx = before.lastIndexOf("=");
    if (eqIdx !== -1) {
      const afterEq = before.substring(eqIdx + 1).trimStart();
      const quoteChar = afterEq[0];
      if (quoteChar === '"' && !canary.includes('"') && !canary.includes(">")) {
        // Enclosed in double quotes; single quote cannot escape
        return null;
      }
      if (quoteChar === "'" && !canary.includes("'") && !canary.includes(">")) {
        // Enclosed in single quotes; double quote cannot escape
        return null;
      }
    }
  }

  // Determine severity and confidence based on canary type
  let severity: ScanFinding["severity"] = "MEDIUM";
  let confidence = 60;
  let type: ScanFinding["type"] = "REFLECTED";

  if (canary.includes("<script>") || canary.includes("onerror=")) {
    severity = "CRITICAL";
    confidence = 95;
  } else if (canary.includes("<") && canary.includes(">")) {
    severity = "HIGH";
    confidence = 85;
  } else if (canary.includes('"') || canary.includes("'")) {
    severity = "HIGH";
    confidence = 75;
  } else if (canary.includes("javascript:")) {
    severity = "HIGH";
    confidence = 80;
  } else {
    severity = "MEDIUM";
    confidence = 60;
  }

  return {
    type,
    severity,
    confidence,
    parameter,
    context,
    evidence: `User-controlled input from parameter '${parameter}' reflected in ${context} context without appropriate encoding. Canary token: ${canary.substring(0, 40)}...`,
    remediation: getRemediation(context),
  };
}

function determineContext(body: string, canary: string): string {
  const idx = body.indexOf(canary);
  if (idx === -1) return "HTML";

  const before = body.substring(Math.max(0, idx - 100), idx);

  // Check if inside a script tag
  if (
    before.lastIndexOf("<script") > before.lastIndexOf("</script") ||
    before.lastIndexOf("<script") > before.lastIndexOf("</script>")
  ) {
    return "JavaScript";
  }

  // Check if inside an attribute
  const lastQuote = Math.max(
    before.lastIndexOf('"'),
    before.lastIndexOf("'"),
    before.lastIndexOf("=")
  );
  const lastClose = before.lastIndexOf(">");
  if (lastQuote > lastClose) {
    return "Attribute";
  }

  return "HTML";
}

function getRemediation(context: string): string {
  const remediations: Record<string, string> = {
    HTML: "Use context-aware output encoding. In HTML context, encode <, >, &, \", and '. Use React's built-in JSX encoding. Avoid dangerouslySetInnerHTML.",
    Attribute:
      "Encode all special characters when placing user input in HTML attributes. Encode &, <, >, \", ', and /. Use React's JSX attribute binding.",
    JavaScript:
      "Avoid placing user input inside JavaScript code blocks. If unavoidable, use JSON.stringify() and validate the data type. Use CSP to prevent inline script execution.",
    DOM: "Use textContent instead of innerHTML. Use React state management. Sanitize with DOMPurify if HTML is required.",
  };
  return remediations[context] || remediations.HTML;
}

function deduplicateFindings(findings: ScanFinding[]): ScanFinding[] {
  const seen = new Set<string>();
  return findings.filter((f) => {
    const key = `${f.parameter}:${f.context}:${f.severity}`;
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
}
