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

export function isAllowedTarget(url: string, baseUrl?: string): boolean {
  try {
    const parsed = new URL(url);
    if (baseUrl) {
      try {
        const baseParsed = new URL(baseUrl);
        if (parsed.origin === baseParsed.origin || parsed.host === baseParsed.host) {
          return true;
        }
      } catch {
        // ignore
      }
    }
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
  let targetUrl = config.targetUrl;

  // Resolve lab slugs (e.g. /labs/reflected-xss-search -> /labs/reflected?q=test)
  const SLUG_MAP: Record<string, string> = {
    "reflected-xss-search": "/labs/reflected?q=test",
    "stored-xss-comments": "/labs/stored",
    "dom-xss-client": "/labs/dom",
    "filter-bypass-xss": "/labs/filter-bypass?q=test",
    "context-xss-attribute": "/labs/context?user=test",
  };

  for (const [slug, mappedEndpoint] of Object.entries(SLUG_MAP)) {
    if (targetUrl.includes(slug)) {
      targetUrl = mappedEndpoint;
      break;
    }
  }

  // Validate target is authorized
  const fullUrl = targetUrl.startsWith("http")
    ? targetUrl
    : `${baseUrl}${targetUrl}`;

  if (!isAllowedTarget(fullUrl, baseUrl)) {
    throw new Error(
      "Target is not in the allowed scan list. Scanner can only scan authorized lab endpoints."
    );
  }

  if (!isLabEndpoint(fullUrl)) {
    throw new Error(
      "Scanner can only scan lab environment endpoints (/labs/*)."
    );
  }

  const url = new URL(fullUrl);

  // If target is DOM XSS Lab or endpoint contains DOM sinks
  if (url.pathname.includes("/labs/dom")) {
    try {
      const response = await fetch(fullUrl, {
        headers: { "User-Agent": "XSSLab-Scanner/1.0 (Educational)" },
      });
      if (response.ok) {
        const body = await response.text();
        if (body.includes("location.hash") && body.includes("innerHTML")) {
          findings.push({
            type: "DOM",
            severity: "HIGH",
            confidence: 90,
            parameter: "location.hash (URL Fragment)",
            context: "DOM Sink (element.innerHTML)",
            evidence: "Client-side DOM XSS identified: Page reads unsanitized user data from 'location.hash' and assigns it directly to 'element.innerHTML'.",
            remediation: "Never assign unsanitized URL fragments (location.hash) directly to element.innerHTML. Use element.textContent or sanitize using DOMPurify before rendering.",
          });
        }
      }
    } catch {
      // Ignore
    }
  }

  // If target is Stored XSS Lab, run active stored probe against comments API
  if (url.pathname.includes("/labs/stored")) {
    try {
      const storedCanary = `<img src=x onerror=${CANARY_PREFIX}_STORED_ALERT>`;
      await fetch(`${baseUrl}/api/labs/comments`, {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({
          labId: "stored-xss-comments",
          username: "DAST_Canary",
          content: storedCanary,
        }),
      });

      const response = await fetch(fullUrl, {
        headers: { "User-Agent": "XSSLab-Scanner/1.0 (Educational)" },
      });

      if (response.ok) {
        const rawBody = await response.text();
        const body = rawBody.replace(
          /<script[^>]*>(?:(?!<\/script>)[\s\S])*?self\.__next_f(?:(?!<\/script>)[\s\S])*?<\/script>/gi,
          ""
        );

        if (body.includes(storedCanary)) {
          findings.push({
            type: "STORED",
            severity: "CRITICAL",
            confidence: 98,
            parameter: "content (comment review body)",
            context: "HTML",
            evidence: `Stored XSS confirmed: Payload '${storedCanary}' was persisted to the database and reflected unencoded in the HTML page via dangerouslySetInnerHTML.`,
            remediation: "Never render stored database records using dangerouslySetInnerHTML. Always sanitize HTML on the server or render using React's default JSX text encoding.",
          });
        }
      }
    } catch {
      // Ignore network errors in stored probe
    }
  }

  // Discover parameters from the URL or pick best default for the specific lab
  let testParams = Array.from(url.searchParams.keys());
  if (testParams.length === 0) {
    if (url.pathname.includes("/labs/context")) {
      testParams = ["user"];
    } else if (url.pathname.includes("/labs/reflected") || url.pathname.includes("/labs/filter-bypass")) {
      testParams = ["q"];
    } else {
      testParams = ["q", "search", "query", "user", "input"];
    }
  }

  for (const param of testParams) {
    const promises = CANARY_TOKENS.map(async (canary) => {
      try {
        const testUrl = new URL(fullUrl);
        testUrl.searchParams.set(param, canary);

        const response = await fetch(testUrl.toString(), {
          redirect: "follow",
          signal: AbortSignal.timeout(8000),
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
        return analyzeResponse(body, canary, param, fullUrl);
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
  parameter: string,
  targetUrl: string = ""
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

  if (targetUrl.includes("/labs/filter-bypass")) {
    type = "FILTER_BYPASS";
  } else if (targetUrl.includes("/labs/context") || context === "Attribute") {
    type = "CONTEXT";
  } else if (targetUrl.includes("/labs/dom")) {
    type = "DOM";
  } else if (targetUrl.includes("/labs/stored")) {
    type = "STORED";
  }

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
