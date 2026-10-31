import {
  BookOpen,
  Shield,
  Code,
  AlertTriangle,
  Lock,
  Layers,
  FileCode,
  Globe,
  Terminal,
} from "lucide-react";

const concepts = [
  {
    title: "What is XSS?",
    icon: AlertTriangle,
    color: "neon-red",
    content:
      "Cross-Site Scripting (XSS) is a vulnerability that allows attackers to inject malicious scripts into web pages viewed by other users. XSS exploits the trust a user has in a website. When a user visits a page containing injected scripts, the browser executes them because it believes the scripts are part of the legitimate website.",
  },
  {
    title: "Reflected XSS",
    icon: Globe,
    color: "neon-orange",
    content:
      "Reflected XSS occurs when user input is immediately returned by a web application without being stored. The malicious script is part of the victim's request (usually in a URL parameter). The server includes this unvalidated input in the response. An attacker must trick the victim into clicking a crafted link.",
  },
  {
    title: "Stored XSS",
    icon: Layers,
    color: "neon-red",
    content:
      "Stored (Persistent) XSS occurs when malicious input is saved on the target server (database, message board, etc.) and later displayed to users. This is more dangerous than reflected XSS because every user who views the affected page is impacted — no social engineering is needed after the initial injection.",
  },
  {
    title: "DOM-Based XSS",
    icon: Code,
    color: "neon-blue",
    content:
      "DOM-Based XSS occurs entirely on the client side. The vulnerability exists in the JavaScript code that processes data from an attacker-controllable source (like location.hash) and passes it to a dangerous sink (like innerHTML or eval). The server never sees the malicious payload.",
  },
  {
    title: "Output Encoding",
    icon: Shield,
    color: "neon-green",
    content:
      "Output encoding is the primary defense against XSS. It converts special characters into their safe HTML entity equivalents: < becomes &lt;, > becomes &gt;, \" becomes &quot;, ' becomes &#x27;, & becomes &amp;. This ensures the browser treats user data as text, not code. Context matters — HTML, attribute, JavaScript, and URL contexts require different encoding.",
  },
  {
    title: "Content Security Policy",
    icon: Lock,
    color: "neon-purple",
    content:
      "CSP is an HTTP header that tells the browser which sources of content are allowed. A well-configured CSP can prevent inline script execution, restrict script sources to trusted domains, and mitigate the impact of XSS even if a vulnerability exists. Example: Content-Security-Policy: default-src 'self'; script-src 'self'",
  },
  {
    title: "Safe DOM APIs",
    icon: FileCode,
    color: "neon-yellow",
    content:
      "Use textContent instead of innerHTML to insert user data. textContent treats everything as plain text and never parses HTML. In React, use JSX which auto-encodes output. Avoid dangerouslySetInnerHTML, document.write(), and eval(). When rich HTML is needed, use a sanitizer like DOMPurify.",
  },
  {
    title: "Security Headers",
    icon: Terminal,
    color: "neon-blue",
    content:
      "HTTP security headers provide defense-in-depth: X-Content-Type-Options: nosniff prevents MIME-type sniffing. Referrer-Policy controls information leakage. X-Frame-Options prevents clickjacking. Strict-Transport-Security enforces HTTPS. These headers won't fix XSS directly but reduce the attack surface.",
  },
];

export default function LearnPage() {
  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <BookOpen className="w-8 h-8 text-neon-blue" />
          Learning Center
        </h1>
        <p className="text-cyber-400">
          Master the fundamentals of Cross-Site Scripting and web security
        </p>
      </div>

      <div className="space-y-6">
        {concepts.map((concept, i) => (
          <div key={i} className="glass rounded-xl p-6 glass-hover transition-all">
            <div className="flex items-start gap-4">
              <concept.icon
                className={`w-8 h-8 text-${concept.color} flex-shrink-0 mt-1`}
              />
              <div>
                <h2 className="text-xl font-bold text-white mb-3">
                  {concept.title}
                </h2>
                <p className="text-cyber-300 leading-relaxed">
                  {concept.content}
                </p>
              </div>
            </div>
          </div>
        ))}
      </div>

      {/* OWASP Reference */}
      <div className="mt-8 glass rounded-xl p-6 glow-blue">
        <h2 className="text-xl font-bold text-white mb-4">
          📚 Additional Resources
        </h2>
        <ul className="space-y-2 text-cyber-300">
          <li>
            • OWASP XSS Prevention Cheat Sheet
          </li>
          <li>
            • OWASP Testing Guide — Cross-Site Scripting
          </li>
          <li>
            • PortSwigger Web Security Academy — XSS
          </li>
          <li>
            • MDN Web Docs — Content Security Policy
          </li>
          <li>
            • HackerOne Hacktivity — Real XSS Reports
          </li>
        </ul>
      </div>
    </div>
  );
}
