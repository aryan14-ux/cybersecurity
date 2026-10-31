import type { Difficulty, XSSCategory } from "@prisma/client";

export interface LabDefinition {
  slug: string;
  title: string;
  description: string;
  difficulty: Difficulty;
  category: XSSCategory;
  points: number;
  objective: string;
  hint1: string;
  hint2: string;
  solution: string;
  vulnCode: string;
  secureCode: string;
  vulnEndpoint: string;
  secureEndpoint: string;
  explanation: string;
  dataFlow: string;
  remediation: string;
  order: number;
}

export const LAB_DEFINITIONS: LabDefinition[] = [
  {
    slug: "reflected-xss-search",
    title: "Reflected XSS — Search Injection",
    description:
      "A search engine reflects user input directly into the HTML response without proper encoding. Your goal is to inject a script that executes in the victim's browser.",
    difficulty: "EASY",
    category: "REFLECTED",
    points: 100,
    objective:
      "Inject a payload into the search parameter that causes a JavaScript alert to execute, demonstrating reflected XSS.",
    hint1:
      "Look at the URL parameters. The 'q' parameter is reflected in the page. Try inserting HTML tags.",
    hint2:
      "The application does not encode the search term before inserting it into the HTML. Try: <script>alert('XSS')</script>",
    solution:
      "Navigate to /labs/reflected?q=<script>alert('XSS')</script>. The search term is reflected directly into the HTML without encoding, allowing script execution.",
    vulnCode: `// VULNERABLE: User input reflected without encoding
export default function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  return (
    <div>
      <h2>Search Results for: {query}</h2>
      {/* The query is inserted directly into HTML */}
      <div dangerouslySetInnerHTML={{ __html: \`
        <p>You searched for: \${query}</p>
        <p>No results found.</p>
      \` }} />
    </div>
  );
}`,
    secureCode: `// SECURE: User input properly encoded
import DOMPurify from 'dompurify';

export default function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  // Option 1: Use React's built-in encoding (preferred)
  return (
    <div>
      <h2>Search Results for: {query}</h2>
      <p>You searched for: {query}</p>
      <p>No results found.</p>
    </div>
  );
  // Option 2: If HTML is needed, sanitize it
  // const clean = DOMPurify.sanitize(query);
}`,
    vulnEndpoint: "/labs/reflected",
    secureEndpoint: "/labs/reflected/secure",
    explanation:
      "Reflected XSS occurs when user-supplied data in an HTTP request is included in the immediate response without proper validation or encoding. The server takes the user's input from the 'q' parameter and places it directly into the HTML response. When the browser receives this response, it interprets the injected script tags as legitimate JavaScript and executes them. This is dangerous because an attacker can craft a malicious URL containing JavaScript code and trick a victim into clicking it. The victim's browser would then execute the attacker's code in the context of the vulnerable website, potentially stealing cookies, session tokens, or performing actions on behalf of the victim.",
    dataFlow:
      "User Input (URL parameter 'q') → HTTP GET Request → Server receives query parameter → Server builds HTML response with unencoded input → HTML Response sent to browser → Browser parses HTML → Browser encounters <script> tag → JavaScript engine executes injected code → XSS achieved",
    remediation:
      "1. Use context-aware output encoding: HTML-encode user data before inserting into HTML context. 2. Use React's built-in JSX encoding (avoid dangerouslySetInnerHTML). 3. Implement Content-Security-Policy headers to prevent inline script execution. 4. Validate and sanitize input on the server side. 5. Use HTTPOnly and Secure flags on session cookies to limit the impact of XSS.",
    order: 1,
  },
  {
    slug: "stored-xss-comments",
    title: "Stored XSS — Comment Injection",
    description:
      "A comment system stores user input in the database and displays it to all users without proper sanitization. Your goal is to store a malicious payload that executes for every visitor.",
    difficulty: "MEDIUM",
    category: "STORED",
    points: 200,
    objective:
      "Submit a comment containing a JavaScript payload that executes whenever any user views the comments page.",
    hint1:
      "The comment form accepts user input and stores it in the database. Try submitting a comment with HTML tags to see if they render.",
    hint2:
      "The comments are rendered using dangerouslySetInnerHTML. Submit a comment like: <img src=x onerror=alert('XSS')>",
    solution:
      "Submit a comment with the payload: <img src=x onerror=alert('StoredXSS')>. The comment is stored in the database and rendered without sanitization, causing the script to execute for every visitor.",
    vulnCode: `// VULNERABLE: Stored user input rendered without sanitization
async function CommentsPage() {
  const comments = await db.labComment.findMany({
    where: { labId: 'stored-xss' },
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <strong>{comment.username}</strong>
          {/* DANGEROUS: Rendering raw HTML from user input */}
          <div dangerouslySetInnerHTML={{ 
            __html: comment.content 
          }} />
        </div>
      ))}
    </div>
  );
}`,
    secureCode: `// SECURE: Sanitized output with DOMPurify
import DOMPurify from 'dompurify';

async function CommentsPage() {
  const comments = await db.labComment.findMany({
    where: { labId: 'stored-xss' },
    orderBy: { createdAt: 'desc' }
  });
  
  return (
    <div>
      {comments.map(comment => (
        <div key={comment.id} className="comment">
          <strong>{comment.username}</strong>
          {/* SECURE: Use React's text encoding */}
          <p>{comment.content}</p>
          {/* Or sanitize if rich HTML needed: */}
          {/* <div dangerouslySetInnerHTML={{ 
            __html: DOMPurify.sanitize(comment.content) 
          }} /> */}
        </div>
      ))}
    </div>
  );
}`,
    vulnEndpoint: "/labs/stored",
    secureEndpoint: "/labs/stored/secure",
    explanation:
      "Stored XSS (also called Persistent XSS) is more dangerous than reflected XSS because the malicious payload is permanently stored on the target server (in this case, in the PostgreSQL database). Every user who views the affected page will have the malicious script executed in their browser. The attack flow is: Attacker submits malicious comment → Server stores it in the database → Victim visits the comments page → Server retrieves comment from database → Server includes raw comment in HTML response → Victim's browser executes the injected script. This can lead to session hijacking, account takeover, defacement, or malware distribution.",
    dataFlow:
      "Attacker Input (comment form) → HTTP POST Request → Server receives input → Input stored in PostgreSQL database → Victim requests page → Server queries database → Comment retrieved with malicious payload → Server builds HTML with raw comment → HTML Response → Victim's browser renders HTML → Script executes → XSS achieved for ALL visitors",
    remediation:
      "1. Sanitize user input before storing in the database (input validation). 2. Encode output when rendering stored data (output encoding). 3. Use React's default text rendering instead of dangerouslySetInnerHTML. 4. If rich text is needed, use a sanitization library like DOMPurify. 5. Implement CSP headers as defense-in-depth. 6. Set HTTPOnly flag on session cookies.",
    order: 2,
  },
  {
    slug: "dom-xss-client",
    title: "DOM-Based XSS — Client-Side Injection",
    description:
      "A client-side application reads data from the URL fragment and injects it into the DOM using innerHTML. The vulnerability exists entirely in the browser without server involvement.",
    difficulty: "MEDIUM",
    category: "DOM",
    points: 200,
    objective:
      "Craft a URL with a fragment identifier that, when visited, executes JavaScript code through DOM manipulation.",
    hint1:
      "Look at the JavaScript code running on the page. It reads from location.hash (the URL fragment after #) and writes it to the page.",
    hint2:
      "The code uses document.getElementById('output').innerHTML = decodeURIComponent(location.hash.slice(1)). Try: #<img src=x onerror=alert('DOM-XSS')>",
    solution:
      "Navigate to /labs/dom#<img src=x onerror=alert('DOM-XSS')>. The client-side JavaScript reads the URL fragment and writes it to innerHTML, causing script execution.",
    vulnCode: `// VULNERABLE: DOM-based XSS via innerHTML
'use client';
import { useEffect } from 'react';

export default function DOMLabPage() {
  useEffect(() => {
    // Source: location.hash
    const hash = decodeURIComponent(
      window.location.hash.slice(1)
    );
    
    // Sink: innerHTML
    const output = document.getElementById('output');
    if (output && hash) {
      output.innerHTML = hash; // DANGEROUS SINK
    }
  }, []);

  return <div id="output">Loading content...</div>;
}`,
    secureCode: `// SECURE: Use textContent instead of innerHTML
'use client';
import { useEffect, useState } from 'react';

export default function DOMLabPage() {
  const [content, setContent] = useState('Loading content...');

  useEffect(() => {
    const hash = decodeURIComponent(
      window.location.hash.slice(1)
    );
    // SAFE: textContent does not parse HTML
    setContent(hash || 'Loading content...');
    // Or use: element.textContent = hash;
  }, []);

  return <div>{content}</div>;
}`,
    vulnEndpoint: "/labs/dom",
    secureEndpoint: "/labs/dom/secure",
    explanation:
      "DOM-Based XSS is unique because the vulnerability exists entirely in client-side JavaScript. The server never sees or processes the malicious payload — the attack happens when JavaScript reads data from a 'source' (like location.hash, location.search, document.referrer) and writes it to a dangerous 'sink' (like innerHTML, document.write, eval). In this lab, the source is window.location.hash and the sink is element.innerHTML. The URL fragment (everything after #) is never sent to the server, making this attack invisible to server-side security measures. This is why client-side security is equally important.",
    dataFlow:
      "Attacker crafts URL with malicious fragment → Victim clicks URL → Browser loads page → JavaScript reads location.hash (SOURCE) → hash content decoded → Written to element.innerHTML (SINK) → Browser parses injected HTML → Script executes → XSS achieved (entirely client-side)",
    remediation:
      "1. Use textContent instead of innerHTML when inserting user-controlled data. 2. Use React's state management and JSX (which auto-encodes). 3. If HTML is needed, sanitize with DOMPurify before inserting. 4. Avoid dangerous sinks: innerHTML, outerHTML, document.write, eval. 5. Use CSP to block inline scripts as defense-in-depth. 6. Validate and sanitize data from all DOM sources.",
    order: 3,
  },
  {
    slug: "filter-bypass-xss",
    title: "XSS Filter Bypass — Evading Weak Defenses",
    description:
      "The application implements a basic XSS filter that blocks common patterns like <script>. However, the filter is incomplete and can be bypassed using alternative techniques.",
    difficulty: "HARD",
    category: "FILTER_BYPASS",
    points: 300,
    objective:
      "Bypass the input filter to execute JavaScript. The filter blocks <script> tags but has weaknesses.",
    hint1:
      "The filter only checks for the exact string '<script'. There are many other HTML elements that can execute JavaScript, such as event handlers.",
    hint2:
      "Try using an img tag with an onerror handler: <img src=x onerror=alert('Bypassed')> or try case variations like <ScRiPt>.",
    solution:
      "The filter can be bypassed with: <img src=x onerror=alert('Bypassed')>, <svg onload=alert('Bypassed')>, <body onload=alert('Bypassed')>, or case variations like <SCRIPT>alert('Bypassed')</SCRIPT>.",
    vulnCode: `// VULNERABLE: Weak filter that only blocks <script>
function sanitizeInput(input: string): string {
  // Naive filter — only removes <script> tags
  return input.replace(/<script[^>]*>/gi, '')
              .replace(/<\\/script>/gi, '');
}

export default function FilterPage({ searchParams }) {
  const input = searchParams.q || '';
  const filtered = sanitizeInput(input);
  
  return (
    <div>
      <div dangerouslySetInnerHTML={{ 
        __html: \`Result: \${filtered}\` 
      }} />
    </div>
  );
}`,
    secureCode: `// SECURE: Use proper output encoding, not filtering
import DOMPurify from 'dompurify';

export default function FilterPage({ searchParams }) {
  const input = searchParams.q || '';
  
  // Option 1: Don't use HTML at all (best)
  return <div><p>Result: {input}</p></div>;
  
  // Option 2: If HTML needed, use DOMPurify
  // const clean = DOMPurify.sanitize(input);
  // return <div dangerouslySetInnerHTML={{ __html: clean }} />;
  
  // NEVER rely on regex filters for XSS prevention
}`,
    vulnEndpoint: "/labs/filter-bypass",
    secureEndpoint: "/labs/filter-bypass/secure",
    explanation:
      "This lab demonstrates why blacklist-based XSS filtering is fundamentally flawed. The filter attempts to remove <script> tags, but there are hundreds of ways to execute JavaScript in HTML without using script tags. Event handlers (onerror, onload, onclick, onmouseover), SVG elements, iframe srcdoc, meta refresh, JavaScript URIs, and many more vectors can bypass simple filters. This is why the security community recommends output encoding (converting special characters to their HTML entities) rather than input filtering. A proper defense encodes < as &lt;, > as &gt;, etc., making it impossible for user input to be interpreted as HTML.",
    dataFlow:
      "User Input → Weak regex filter removes <script> → Other HTML preserved → dangerouslySetInnerHTML renders remaining HTML → Event handler triggers → JavaScript executes → Filter bypassed → XSS achieved",
    remediation:
      "1. NEVER rely on blacklist filtering for XSS prevention. 2. Use output encoding appropriate for the context (HTML, attribute, JavaScript, URL). 3. Use Content-Security-Policy to prevent inline script execution. 4. Use a well-tested sanitization library (DOMPurify) if HTML is required. 5. Prefer whitelisting allowed tags/attributes over blacklisting dangerous ones. 6. Use React's default encoding — avoid dangerouslySetInnerHTML.",
    order: 4,
  },
  {
    slug: "context-xss-attribute",
    title: "Context-Based XSS — Attribute Injection",
    description:
      "User input is placed inside an HTML attribute value. The application HTML-encodes some characters but fails to properly handle the attribute context, allowing attribute escape and event handler injection.",
    difficulty: "HARD",
    category: "CONTEXT",
    points: 300,
    objective:
      "Escape the HTML attribute context and inject an event handler that executes JavaScript.",
    hint1:
      "Your input is placed inside a value=\"...\" attribute. You need to break out of the attribute first. What character closes an attribute value?",
    hint2:
      'Try closing the attribute with a quote, then adding an event handler: " onfocus=alert("XSS") autofocus="',
    solution:
      'Input: " onfocus=alert("XSS") autofocus=" — This closes the value attribute, adds an onfocus event handler, and the autofocus attribute triggers it automatically.',
    vulnCode: `// VULNERABLE: Input placed in attribute without proper encoding
export default function ContextPage({ searchParams }) {
  const username = searchParams.user || 'guest';
  
  // The input is placed inside an HTML attribute
  return (
    <div dangerouslySetInnerHTML={{ __html: \`
      <input type="text" 
             value="\${username}" 
             placeholder="Username" />
      <p>Welcome, \${username}!</p>
    \` }} />
  );
}`,
    secureCode: `// SECURE: Use React's attribute encoding
export default function ContextPage({ searchParams }) {
  const username = searchParams.user || 'guest';
  
  // React automatically encodes attribute values
  return (
    <div>
      <input type="text" 
             value={username}
             placeholder="Username" 
             readOnly />
      <p>Welcome, {username}!</p>
    </div>
  );
  
  // If manual encoding needed:
  // Encode: & → &amp; < → &lt; > → &gt; 
  //         " → &quot; ' → &#x27;
}`,
    vulnEndpoint: "/labs/context",
    secureEndpoint: "/labs/context/secure",
    explanation:
      "Context-Based XSS demonstrates that the correct defense depends on WHERE user data is placed in the HTML. Data inside an HTML attribute requires different encoding than data in HTML body text. In this lab, user input is placed inside a value=\"...\" attribute. An attacker can break out of the attribute by injecting a double quote (\"), then add malicious attributes like event handlers. HTML body encoding (encoding < and >) is not sufficient here — the quote character must also be encoded. This is why context-aware encoding is essential: HTML context, attribute context, JavaScript context, URL context, and CSS context each require different encoding strategies.",
    dataFlow:
      'User Input (URL parameter) → Server places input in HTML attribute context → Input contains " (double quote) → Breaks out of attribute → New attribute injected (event handler) → Browser processes new attribute → Event fires → JavaScript executes → XSS achieved',
    remediation:
      "1. Use context-aware output encoding. 2. For HTML attributes: encode &, <, >, \", ', and /. 3. Use React's JSX which automatically encodes attribute values. 4. Never concatenate user input into HTML strings. 5. Use template literals with proper encoding functions. 6. Implement CSP as defense-in-depth.",
    order: 5,
  },
];
