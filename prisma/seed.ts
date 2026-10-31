import { PrismaClient } from "@prisma/client";
import bcrypt from "bcryptjs";

const prisma = new PrismaClient();

const LAB_DEFINITIONS = [
  {
    slug: "reflected-xss-search",
    title: "Reflected XSS — Search Injection",
    description:
      "A search engine reflects user input directly into the HTML response without proper encoding. Your goal is to inject a script that executes in the victim's browser.",
    difficulty: "EASY" as const,
    category: "REFLECTED" as const,
    points: 100,
    objective:
      "Inject a payload into the search parameter that causes a JavaScript alert to execute, demonstrating reflected XSS.",
    hint1:
      "Look at the URL parameters. The 'q' parameter is reflected in the page. Try inserting HTML tags.",
    hint2:
      "The application does not encode the search term before inserting it into the HTML. Try: <script>alert('XSS')</script>",
    solution:
      "Navigate to /labs/reflected?q=<script>alert('XSS')</script>. The search term is reflected directly into the HTML without encoding.",
    vulnCode: `// VULNERABLE: User input reflected without encoding
function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  return (
    <div dangerouslySetInnerHTML={{ __html: 
      \`<p>You searched for: \${query}</p>\`
    }} />
  );
}`,
    secureCode: `// SECURE: React auto-encodes output
function SearchPage({ searchParams }) {
  const query = searchParams.q || '';
  return <p>You searched for: {query}</p>;
}`,
    vulnEndpoint: "/labs/reflected",
    secureEndpoint: "/labs/reflected/secure",
    explanation:
      "Reflected XSS occurs when user-supplied data in an HTTP request is included in the immediate response without proper validation or encoding. The server takes the user's input from the 'q' parameter and places it directly into the HTML response. When the browser receives this response, it interprets the injected script tags as legitimate JavaScript and executes them.",
    dataFlow:
      "User Input (URL parameter 'q') → HTTP GET Request → Server receives query parameter → Server builds HTML response with unencoded input → HTML Response sent to browser → Browser parses HTML → Browser encounters <script> tag → JavaScript engine executes injected code → XSS achieved",
    remediation:
      "1. Use context-aware output encoding. 2. Use React's built-in JSX encoding. 3. Implement CSP headers. 4. Validate and sanitize input server-side. 5. Use HTTPOnly/Secure cookie flags.",
    order: 1,
  },
  {
    slug: "stored-xss-comments",
    title: "Stored XSS — Comment Injection",
    description:
      "A comment system stores user input in the database and displays it to all users without proper sanitization.",
    difficulty: "MEDIUM" as const,
    category: "STORED" as const,
    points: 200,
    objective:
      "Submit a comment containing a JavaScript payload that executes whenever any user views the comments page.",
    hint1:
      "The comment form accepts user input and stores it in the database. Try submitting a comment with HTML tags.",
    hint2:
      "The comments are rendered using dangerouslySetInnerHTML. Submit: <img src=x onerror=alert('XSS')>",
    solution:
      "Submit a comment with: <img src=x onerror=alert('StoredXSS')>. The comment is stored and rendered without sanitization.",
    vulnCode: `// VULNERABLE: Stored user input rendered unsanitized
{comments.map(c => (
  <div dangerouslySetInnerHTML={{ 
    __html: c.content 
  }} />
))}`,
    secureCode: `// SECURE: Use React text encoding
{comments.map(c => (
  <p>{c.content}</p>
))}`,
    vulnEndpoint: "/labs/stored",
    secureEndpoint: "/labs/stored/secure",
    explanation:
      "Stored XSS is more dangerous than reflected XSS because the malicious payload is permanently stored on the server. Every user who views the affected page will have the malicious script executed in their browser.",
    dataFlow:
      "Attacker Input → HTTP POST → Server stores in PostgreSQL → Victim requests page → Server queries DB → Comment with payload → HTML Response → Script executes for ALL visitors",
    remediation:
      "1. Sanitize input before storing. 2. Encode output when rendering. 3. Use React's default text rendering. 4. Use DOMPurify for rich text. 5. Implement CSP. 6. HTTPOnly cookies.",
    order: 2,
  },
  {
    slug: "dom-xss-client",
    title: "DOM-Based XSS — Client-Side Injection",
    description:
      "A client-side application reads data from the URL fragment and injects it into the DOM using innerHTML.",
    difficulty: "MEDIUM" as const,
    category: "DOM" as const,
    points: 200,
    objective:
      "Craft a URL with a fragment identifier that executes JavaScript through DOM manipulation.",
    hint1:
      "Look at the JavaScript code. It reads from location.hash and writes it to the page.",
    hint2:
      "The code uses innerHTML as the sink. Try: #<img src=x onerror=alert('DOM-XSS')>",
    solution:
      "Navigate to /labs/dom#<img src=x onerror=alert('DOM-XSS')>. Client-side JS reads the hash and writes to innerHTML.",
    vulnCode: `// VULNERABLE: DOM-based XSS
const hash = location.hash.slice(1);
element.innerHTML = hash; // DANGEROUS SINK`,
    secureCode: `// SECURE: Use textContent
const hash = location.hash.slice(1);
element.textContent = hash; // SAFE`,
    vulnEndpoint: "/labs/dom",
    secureEndpoint: "/labs/dom/secure",
    explanation:
      "DOM-Based XSS exists entirely in client-side JavaScript. The server never sees the payload. The attack happens when JS reads from a 'source' (location.hash) and writes to a 'sink' (innerHTML).",
    dataFlow:
      "Attacker crafts URL with malicious fragment → Victim clicks URL → Browser loads page → JS reads location.hash (SOURCE) → Written to innerHTML (SINK) → Browser parses injected HTML → XSS achieved (client-side only)",
    remediation:
      "1. Use textContent instead of innerHTML. 2. Use React state management. 3. Sanitize with DOMPurify. 4. Avoid dangerous sinks. 5. Use CSP.",
    order: 3,
  },
  {
    slug: "filter-bypass-xss",
    title: "XSS Filter Bypass — Evading Weak Defenses",
    description:
      "The application implements a basic XSS filter that blocks common patterns like <script>. The filter is incomplete and can be bypassed.",
    difficulty: "HARD" as const,
    category: "FILTER_BYPASS" as const,
    points: 300,
    objective:
      "Bypass the input filter to execute JavaScript. The filter blocks <script> tags but has weaknesses.",
    hint1:
      "The filter only checks for <script>. There are many other HTML elements that can execute JavaScript.",
    hint2:
      "Try: <img src=x onerror=alert('Bypassed')> or <svg onload=alert('Bypassed')>",
    solution:
      "Bypass with: <img src=x onerror=alert('Bypassed')>, <svg onload=alert('Bypassed')>, or case variations.",
    vulnCode: `// VULNERABLE: Weak regex filter
function sanitize(input) {
  return input
    .replace(/<script[^>]*>/gi, '')
    .replace(/<\\/script>/gi, '');
}`,
    secureCode: `// SECURE: Use proper encoding, not filtering
const safe = escapeHtml(input);
// Or use DOMPurify for rich HTML`,
    vulnEndpoint: "/labs/filter-bypass",
    secureEndpoint: "/labs/filter-bypass/secure",
    explanation:
      "Blacklist-based XSS filtering is fundamentally flawed. There are hundreds of ways to execute JavaScript without <script> tags: event handlers, SVG elements, iframe srcdoc, and more.",
    dataFlow:
      "User Input → Weak regex filter removes <script> → Other HTML preserved → dangerouslySetInnerHTML renders remaining HTML → Event handler triggers → JavaScript executes → Filter bypassed",
    remediation:
      "1. Never rely on blacklist filtering. 2. Use output encoding. 3. Use CSP. 4. Use DOMPurify for HTML. 5. Prefer whitelisting over blacklisting.",
    order: 4,
  },
  {
    slug: "context-xss-attribute",
    title: "Context-Based XSS — Attribute Injection",
    description:
      "User input is placed inside an HTML attribute value without proper encoding, allowing attribute escape and event handler injection.",
    difficulty: "HARD" as const,
    category: "CONTEXT" as const,
    points: 300,
    objective:
      "Escape the HTML attribute context and inject an event handler that executes JavaScript.",
    hint1:
      'Your input is inside a value="..." attribute. What character closes an attribute value?',
    hint2:
      'Try: " onfocus=alert("XSS") autofocus="',
    solution:
      'Input: " onfocus=alert("XSS") autofocus=" — This closes the attribute and adds an event handler.',
    vulnCode: `// VULNERABLE: Input in attribute without encoding
<input type="text" value="\${username}" />`,
    secureCode: `// SECURE: React auto-encodes attributes
<input type="text" value={username} />`,
    vulnEndpoint: "/labs/context",
    secureEndpoint: "/labs/context/secure",
    explanation:
      "Context-Based XSS shows that the correct defense depends on WHERE user data is placed. Attribute context requires encoding quote characters in addition to angle brackets.",
    dataFlow:
      'User Input → Server places in attribute context → Input contains " → Breaks out of attribute → New attribute injected → Event fires → JavaScript executes',
    remediation:
      '1. Use context-aware encoding. 2. For attributes: encode &, <, >, ", \'. 3. Use React JSX. 4. Never concatenate user input into HTML strings.',
    order: 5,
  },
];

async function main() {
  console.log("🌱 Seeding database...\n");

  // Create admin user
  const adminPassword = await bcrypt.hash("Admin@123", 12);
  const admin = await prisma.user.upsert({
    where: { email: "admin@xsslab.com" },
    update: {},
    create: {
      email: "admin@xsslab.com",
      name: "Admin",
      passwordHash: adminPassword,
      role: "ADMIN",
    },
  });
  console.log(`✅ Admin user created: ${admin.email}`);

  // Create demo user
  const demoPassword = await bcrypt.hash("Demo@1234", 12);
  const demo = await prisma.user.upsert({
    where: { email: "demo@xsslab.com" },
    update: {},
    create: {
      email: "demo@xsslab.com",
      name: "Demo User",
      passwordHash: demoPassword,
      role: "USER",
    },
  });
  console.log(`✅ Demo user created: ${demo.email}`);

  // Seed labs
  for (const labDef of LAB_DEFINITIONS) {
    const lab = await prisma.lab.upsert({
      where: { slug: labDef.slug },
      update: labDef,
      create: labDef,
    });
    console.log(`✅ Lab seeded: ${lab.title}`);
  }

  console.log("\n🎉 Database seeded successfully!");
  console.log("\n📋 Credentials:");
  console.log("   Admin: admin@xsslab.com / Admin@123");
  console.log("   Demo:  demo@xsslab.com / Demo@1234");
}

main()
  .catch((e) => {
    console.error("❌ Seed error:", e);
    process.exit(1);
  })
  .finally(async () => {
    await prisma.$disconnect();
  });
