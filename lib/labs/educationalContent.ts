/**
 * Real-World Educational Intel for XSS Labs
 *
 * Explains what each vulnerability is, how it works in the real world,
 * real-world attack scenarios, famous historical exploits, and enterprise defenses.
 */

export interface RealWorldIntel {
  categoryName: string;
  shortSummary: string;
  whatIsIt: string;
  sourceSinkExplanation: {
    source: string;
    flow: string;
    sink: string;
  };
  whyItMatters: string;
  realWorldScenarios: {
    title: string;
    description: string;
    impact: "CRITICAL" | "HIGH" | "MEDIUM";
  }[];
  famousBreach: {
    target: string;
    year: string;
    details: string;
  };
  whySpecificPayloadWorks: string;
  enterpriseDefense: {
    title: string;
    rule: string;
    codeExample: string;
  }[];
}

export const LAB_EDUCATIONAL_INTEL: Record<string, RealWorldIntel> = {
  DOM: {
    categoryName: "DOM-Based Cross-Site Scripting (DOM XSS)",
    shortSummary: "A client-side vulnerability where browser JavaScript executes untrusted data without server involvement.",
    whatIsIt:
      "DOM XSS happens entirely inside the victim's web browser. Unlike traditional XSS, the malicious payload never touches the backend web server! Instead, client-side JavaScript reads user-controlled data from a 'source' (like location.hash, location.search, or document.referrer) and writes it into a dangerous 'sink' (like innerHTML, document.write, or eval).",
    sourceSinkExplanation: {
      source: "window.location.hash (The URL fragment after the # symbol)",
      flow: "Client-side JavaScript reads the hash on page load or hashchange without validation",
      sink: "element.innerHTML = hash (Directly hands untrusted markup to the browser HTML parser)",
    },
    whyItMatters:
      "Because the fragment identifier (#payload) is never transmitted in HTTP requests to the backend server, traditional Web Application Firewalls (WAFs) and server-side log analyzers cannot see or block this attack. It operates completely below the server's radar.",
    realWorldScenarios: [
      {
        title: "Silent Account Takeover via Phishing Links",
        description:
          "An attacker sends an innocent-looking link on WhatsApp or Slack: https://legit-service.com/app#<img src=x onerror=steal()>. Because the link points to a trusted domain, the victim clicks it without hesitation. The client-side script parses the hash and executes the attacker's script in the context of the user's logged-in session.",
        impact: "CRITICAL",
      },
      {
        title: "Single Page Application (SPA) Routing Exploits",
        description:
          "Modern React, Vue, and Angular applications heavily rely on client-side routing. If a router decodes parameters from the URL path or hash and renders them into modal titles or tabs using raw HTML, attackers can trigger unauthorized API transactions on behalf of the user.",
        impact: "HIGH",
      },
      {
        title: "Client-Side Form & Password Harvesting",
        description:
          "The injected script dynamically creates an authentic-looking 'Your session has timed out. Please enter your password' overlay. When the user enters their password, it is dispatched to the attacker's remote logging server.",
        impact: "CRITICAL",
      },
    ],
    famousBreach: {
      target: "Yahoo Mail & Microsoft Teams DOM XSS",
      year: "Historical Impact",
      details:
        "Security researchers discovered DOM XSS in major webmail and collaboration clients where rich text draft viewers and URL fragment handlers parsed user inputs directly into innerHTML sinks, allowing attackers to access private inbox messages.",
    },
    whySpecificPayloadWorks:
      "The HTML5 specification blocks <script> tags from executing when inserted via innerHTML. Therefore, real-world attackers use HTML elements with inline event handlers like <img src=x onerror=alert(1)> or <svg onload=alert(1)>, which the browser executes immediately upon DOM creation.",
    enterpriseDefense: [
      {
        title: "Use Safe DOM Properties (textContent)",
        rule: "Never use innerHTML for dynamic user text. Use textContent or React JSX string interpolation.",
        codeExample: "// Safe: Treats input as harmless literal text\nelement.textContent = userInput;\n// In React:\n<span>{userInput}</span>",
      },
      {
        title: "Sanitize with DOMPurify",
        rule: "If rich HTML is genuinely required, strip dangerous tags and event handlers with DOMPurify.",
        codeExample: "import DOMPurify from 'dompurify';\nelement.innerHTML = DOMPurify.sanitize(userInput);",
      },
      {
        title: "Enforce Trusted Types in CSP",
        rule: "Configure Content Security Policy to reject non-type-checked strings from entering dangerous sinks.",
        codeExample: "Content-Security-Policy: require-trusted-types-for 'script';",
      },
    ],
  },

  REFLECTED: {
    categoryName: "Reflected Cross-Site Scripting (Type I)",
    shortSummary: "Server receives malicious input in an HTTP request and immediately bounces it back unencoded in the response.",
    whatIsIt:
      "Reflected XSS occurs when an application takes user input from an HTTP request (such as a search query, URL parameter, or form submission) and embeds it directly into the HTML response without proper sanitization or context-aware encoding.",
    sourceSinkExplanation: {
      source: "HTTP GET parameter 'q' (e.g., /labs/reflected?q=...)",
      flow: "Server reads request parameter and concatenates it into the HTML response string",
      sink: "Browser receives HTML containing raw unencoded script tags and executes them as valid code",
    },
    whyItMatters:
      "Reflected XSS is frequently delivered via phishing emails, social media links, or URL shorteners. It allows attackers to execute arbitrary JavaScript within the security context of the vulnerable domain, bypassing Same-Origin Policy (SOP).",
    realWorldScenarios: [
      {
        title: "Session Token & Cookie Exfiltration",
        description:
          "The injected script accesses document.cookie or window.localStorage (if JWTs are stored there) and sends them to attacker.com via fetch() or Image beacon. With the victim's session token, the attacker logs in as the victim.",
        impact: "CRITICAL",
      },
      {
        title: "Credential Harvesting via Overlay Phishing",
        description:
          "The script alters the webpage DOM to display a realistic 'Security Alert: Verify Your Password' dialog. Unsuspecting users enter their credentials directly into the attacker's trap.",
        impact: "HIGH",
      },
      {
        title: "Forced Actions & CSRF Elevation",
        description:
          "The script makes authenticated POST requests to change the victim's email address, transfer money, or add an unauthorized secondary administrator to the account.",
        impact: "CRITICAL",
      },
    ],
    famousBreach: {
      target: "eBay & PayPal Subdomains Reflected XSS",
      year: "Historical Impact",
      details:
        "Attackers used reflected XSS on high-trust e-commerce search portals to inject fake payment collection iframes, redirecting users to external clone pages to steal credit card details.",
    },
    whySpecificPayloadWorks:
      "Because the server template directly renders the search string into the raw HTML stream, standard <script>alert(1)</script> tags are parsed by the browser's initial HTML token parser and executed immediately upon page load.",
    enterpriseDefense: [
      {
        title: "Context-Aware HTML Entity Encoding",
        rule: "Convert special HTML characters (&, <, >, \", ') into their respective HTML entities before rendering.",
        codeExample: "// Replace dangerous characters:\nconst encoded = input\n  .replace(/&/g, '&amp;')\n  .replace(/</g, '&lt;')\n  .replace(/>/g, '&gt;')\n  .replace(/\"/g, '&quot;');",
      },
      {
        title: "Modern Framework Templating",
        rule: "Use React, Angular, or Vue templating which auto-encodes variable interpolations by default.",
        codeExample: "// Safe: React automatically escapes content\n<h2>Search results for: {query}</h2>",
      },
      {
        title: "HttpOnly Flag on Authentication Cookies",
        rule: "Set HttpOnly flag on session cookies so JavaScript document.cookie cannot read them.",
        codeExample: "Set-Cookie: session_id=xyz; Secure; HttpOnly; SameSite=Strict",
      },
    ],
  },

  STORED: {
    categoryName: "Stored / Persistent Cross-Site Scripting (Type II)",
    shortSummary: "Malicious payload is permanently saved in the application database and executes for all users who view the content.",
    whatIsIt:
      "Stored XSS is the most damaging class of XSS. Instead of requiring a victim to click a specialized link, the attacker submits malicious code into a database (e.g., in a blog comment, user profile bio, forum post, or customer support ticket). Whenever any visitor or administrator views the page, the script executes automatically.",
    sourceSinkExplanation: {
      source: "User input submitted via POST request (comment text, profile name, review)",
      flow: "Server stores the payload into PostgreSQL / SQLite database without sanitization",
      sink: "When any user views the feed, database record is fetched and rendered raw into HTML",
    },
    whyItMatters:
      "A single stored payload can compromise thousands of users automatically. It can target high-privilege administrators viewing customer feedback dashboards, leading to total server or platform compromise.",
    realWorldScenarios: [
      {
        title: "Self-Propagating XSS Worms",
        description:
          "When a user views an infected profile or comment, the script automatically copies itself to the viewer's own profile and sends infected messages to all their contacts, spreading exponentially.",
        impact: "CRITICAL",
      },
      {
        title: "Backdoor Administrative Account Creation",
        description:
          "An attacker submits a support ticket containing a payload. When a customer support administrator views the ticket in their portal, the script executes with admin privileges and creates a new superuser account for the attacker.",
        impact: "CRITICAL",
      },
      {
        title: "Silent Keyloggers on Community Portals",
        description:
          "The script attaches an event listener to the document window (document.addEventListener('keydown', ...)) and captures all passwords and private messages typed on the page.",
        impact: "HIGH",
      },
    ],
    famousBreach: {
      target: "The Samy Worm (MySpace)",
      year: "2005",
      details:
        "Samy Kamkar used a stored XSS payload in his MySpace profile. Viewing his profile added Samy as a hero and replicated the code to the viewer's profile. In under 20 hours, it infected over 1,000,000 users, crashing MySpace servers.",
    },
    whySpecificPayloadWorks:
      "When stored comments are rendered inside an element using dangerouslySetInnerHTML, HTML tags like <img src=x onerror=alert('StoredXSS')> parse immediately when the DOM tree is constructed.",
    enterpriseDefense: [
      {
        title: "Never Store Raw HTML from Users",
        rule: "Store input as plain text in the database; apply contextual output encoding upon presentation.",
        codeExample: "// Store raw text safely; render as text node:\n<p>{comment.content}</p>",
      },
      {
        title: "Server-Side & Client-Side Sanitization",
        rule: "For applications requiring rich text (Markdown/HTML), sanitize with an established library.",
        codeExample: "import DOMPurify from 'isomorphic-dompurify';\nconst cleanHtml = DOMPurify.sanitize(comment.content);",
      },
      {
        title: "Strict Content Security Policy (CSP)",
        rule: "Disable unsafe-inline script execution across the entire platform.",
        codeExample: "Content-Security-Policy: default-src 'self'; script-src 'self';",
      },
    ],
  },

  FILTER_BYPASS: {
    categoryName: "Filter Bypass & Web Application Firewall (WAF) Evasion",
    shortSummary: "Circumventing naive regex filters and blacklists that attempt to strip dangerous tags.",
    whatIsIt:
      "Many developers attempt to prevent XSS by writing custom string filters that search for '<script>' and delete it. This blacklist approach is fundamentally flawed because modern browsers support over 100 different execution contexts and HTML tags that do not require '<script>'.",
    sourceSinkExplanation: {
      source: "Query string or form input passed into a naive string replacement function",
      flow: "Filter removes '<script>' and assumes the remaining text is harmless",
      sink: "Remaining HTML tags and event handlers pass through and execute in the browser",
    },
    whyItMatters:
      "Blacklisting creates a false sense of security. Attackers simply switch from <script> to event handlers (<img onerror=>, <svg onload=>, <body onload=>), pseudo-protocols (javascript:), or case variations (<sCrIpt>).",
    realWorldScenarios: [
      {
        title: "WAF Rule Circumvention",
        description:
          "Enterprise WAFs often look for standard signatures like '<script>alert()'. Attackers evade detection using alternative event handlers (onfocus, onerror, ontoggle), SVG elements, or nested tags (<scr<script>ipt>).",
        impact: "HIGH",
      },
      {
        title: "Markdown & BBCode Parser Flaws",
        description:
          "Applications converting custom Markdown to HTML may sanitize [url] tags but fail to validate href schemes, allowing javascript:alert(1) or data: URLs.",
        impact: "HIGH",
      },
    ],
    famousBreach: {
      target: "Cloudflare & Imperva WAF Bypasses",
      year: "Recurring Industry Topic",
      details:
        "Security researchers regularly publish zero-day WAF bypasses demonstrating how novel HTML5 tags and Unicode encoding quirks circumvent signature-based inspection engines.",
    },
    whySpecificPayloadWorks:
      "The vulnerable lab filter executes input.replace(/<script[^>]*>/gi, ''). By using <img src=x onerror=alert(1)>, the payload completely avoids the word 'script', passing through the filter untouched and executing in the browser.",
    enterpriseDefense: [
      {
        title: "Adopt Allow-Listing (Whitelisting), Not Blacklisting",
        rule: "Never attempt to enumerate all 'bad' words. Either encode everything or explicitly allow only a strict whitelist.",
        codeExample: "// Discard blacklist regexes. Encode all output:\nconst safe = text.replace(/[&<>'\"/]/g, c => ({'&':'&amp;','<':'&lt;','>':'&gt;','\"':'&quot;',\"'\":'&#x27;','/':'&#x2F;'}[c]));",
      },
      {
        title: "Use Industry-Standard Parsers (DOMPurify)",
        rule: "Do not write home-grown regex sanitizers. Rely on actively maintained parsers.",
        codeExample: "import DOMPurify from 'dompurify';\nDOMPurify.sanitize(input, { ALLOWED_TAGS: ['b', 'i', 'em', 'strong'] });",
      },
    ],
  },

  CONTEXT: {
    categoryName: "Context-Based XSS & Attribute Breakouts",
    shortSummary: "Escaping HTML attribute delimiters or JavaScript variable assignments to trigger code execution.",
    whatIsIt:
      "Context XSS occurs when user data is reflected inside HTML attributes (e.g., <input value=\"USER_INPUT\">), inside inline JavaScript blocks (e.g., var user = 'USER_INPUT';), or inside URLs. Standard HTML entity encoding for '<' and '>' is insufficient here—the attacker breaks out using quotation marks (\", ').",
    sourceSinkExplanation: {
      source: "User input placed inside an HTML attribute value",
      flow: "Developer quotes or leaves unquoted an attribute tag: <input value=\"...\" name=\"username\">",
      sink: "Attacker injects a matching quote to close the attribute, followed by a new event handler",
    },
    whyItMatters:
      "Many developers believe that putting user input inside an <input> tag's value is safe because 'it's not a script tag'. However, if quotes are not escaped, an attacker can append event handlers like onfocus or autofocus that execute automatically without user clicks.",
    realWorldScenarios: [
      {
        title: "Zero-Click Attribute Execution via Autofocus",
        description:
          "By injecting \" onfocus=\"alert(1)\" autofocus=\", the browser automatically shifts keyboard focus to the input on page load, firing the onfocus handler instantly without requiring the victim to click anything.",
        impact: "CRITICAL",
      },
      {
        title: "Hidden Field Exfiltration",
        description:
          "Injected event handlers in hidden CSRF token inputs can read the secret tokens and send them to the attacker.",
        impact: "HIGH",
      },
    ],
    famousBreach: {
      target: "AngularJS & Template Injection Breakouts",
      year: "Historical Impact",
      details:
        "Client-side template engines parsing attributes like ng-app or data-* attributes allowed attackers to break out of string literals and evaluate arbitrary JavaScript expressions.",
    },
    whySpecificPayloadWorks:
      "The input is placed inside value=\"{user}\". By inputting \" onfocus=\"alert(1)\" autofocus=\", the opening double quote closes value=\"\", and onfocus=\"alert(1)\" autofocus=\" is added as a legitimate attribute that triggers instantly.",
    enterpriseDefense: [
      {
        title: "Always Quote Attributes & Encode Quotes",
        rule: "Always wrap attribute values in double quotes, and encode both double quotes (\") and single quotes (').",
        codeExample: "// In JSX, attribute binding is automatically safe:\n<input type=\"text\" defaultValue={userInput} />",
      },
      {
        title: "Context-Aware Encoding",
        rule: "Use OWASP Java Encoder or modern framework bindings that apply context-specific encoding.",
        codeExample: "// Attribute context requires encoding \", ', &, and `/`:\nconst safeAttr = attr.replace(/\"/g, '&quot;').replace(/'/g, '&#x27;');",
      },
    ],
  },
};
