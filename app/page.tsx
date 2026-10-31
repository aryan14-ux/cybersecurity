"use client";

import Link from "next/link";
import {
  Shield,
  Terminal,
  Bug,
  Lock,
  Code,
  Zap,
  ChevronRight,
  AlertTriangle,
  Search,
  BookOpen,
  Trophy,
  Target,
  ArrowRight,
  Layers,
  Eye,
  FileCode,
} from "lucide-react";
import { useState, useEffect } from "react";

const stats = [
  { label: "Labs Available", value: "5+", icon: Target },
  { label: "XSS Categories", value: "5", icon: Layers },
  { label: "Difficulty Levels", value: "4", icon: Zap },
  { label: "Detection Methods", value: "6+", icon: Eye },
];

const categories = [
  {
    title: "Reflected XSS",
    description:
      "User input reflected in the server response without encoding",
    severity: "HIGH",
    icon: Zap,
    color: "neon-orange",
  },
  {
    title: "Stored XSS",
    description: "Malicious payload persisted in the database",
    severity: "CRITICAL",
    icon: Bug,
    color: "neon-red",
  },
  {
    title: "DOM-Based XSS",
    description: "Client-side JavaScript sinks process untrusted data",
    severity: "HIGH",
    icon: Code,
    color: "neon-blue",
  },
  {
    title: "Filter Bypass",
    description: "Techniques to evade weak input validation filters",
    severity: "CRITICAL",
    icon: AlertTriangle,
    color: "neon-purple",
  },
  {
    title: "Context-Based",
    description: "XSS in different HTML contexts: attribute, JS, URL",
    severity: "HIGH",
    icon: FileCode,
    color: "neon-yellow",
  },
];

const roadmapSteps = [
  {
    step: 1,
    title: "Understand XSS",
    description: "Learn what Cross-Site Scripting is and why it matters",
  },
  {
    step: 2,
    title: "Reflected XSS",
    description: "Practice finding reflected input in server responses",
  },
  {
    step: 3,
    title: "Stored XSS",
    description: "Explore persistent XSS through database storage",
  },
  {
    step: 4,
    title: "DOM-Based XSS",
    description: "Discover client-side vulnerabilities in JavaScript",
  },
  {
    step: 5,
    title: "Advanced Techniques",
    description: "Master filter bypass and context-aware exploitation",
  },
  {
    step: 6,
    title: "Secure Coding",
    description: "Learn proper defenses and write secure code",
  },
];

function TypewriterText({ text }: { text: string }) {
  const [displayed, setDisplayed] = useState("");
  const [index, setIndex] = useState(0);

  useEffect(() => {
    if (index < text.length) {
      const timeout = setTimeout(() => {
        setDisplayed((prev) => prev + text[index]);
        setIndex((prev) => prev + 1);
      }, 50);
      return () => clearTimeout(timeout);
    }
  }, [index, text]);

  return (
    <span>
      {displayed}
      {index < text.length && (
        <span className="animate-pulse text-neon-green">█</span>
      )}
    </span>
  );
}

export default function LandingPage() {
  return (
    <div className="min-h-screen bg-cyber-950 cyber-grid">
      {/* Navigation */}
      <nav className="fixed top-0 left-0 right-0 z-50 glass border-b border-cyber-700/50">
        <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8">
          <div className="flex items-center justify-between h-16">
            <div className="flex items-center gap-2">
              <Shield className="w-8 h-8 text-neon-green" />
              <span className="text-xl font-bold gradient-text">
                XSS Detection Lab
              </span>
            </div>
            <div className="hidden md:flex items-center gap-6">
              <Link
                href="#labs"
                className="text-cyber-300 hover:text-neon-green transition-colors"
              >
                Labs
              </Link>
              <Link
                href="#roadmap"
                className="text-cyber-300 hover:text-neon-green transition-colors"
              >
                Roadmap
              </Link>
              <Link
                href="#scanner"
                className="text-cyber-300 hover:text-neon-green transition-colors"
              >
                Scanner
              </Link>
              <Link
                href="/dashboard"
                className="text-cyber-300 hover:text-neon-green transition-colors"
              >
                Dashboard
              </Link>
              <Link
                href="/labs"
                className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all"
              >
                Launch Labs
              </Link>
            </div>
          </div>
        </div>
      </nav>

      {/* Hero Section */}
      <section className="pt-32 pb-20 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-b from-neon-green/5 via-transparent to-transparent pointer-events-none" />
        <div className="max-w-7xl mx-auto text-center relative">
          <div className="inline-flex items-center gap-2 px-4 py-2 rounded-full glass mb-8 text-sm">
            <span className="w-2 h-2 bg-neon-green rounded-full animate-pulse-glow" />
            <span className="text-cyber-300">
              Educational Cybersecurity Platform
            </span>
          </div>

          <h1 className="text-5xl md:text-7xl font-black mb-6 leading-tight">
            <span className="text-white">Learn </span>
            <span className="gradient-text">XSS</span>
            <span className="text-white"> by Doing</span>
          </h1>

          <p className="text-xl md:text-2xl text-cyber-300 max-w-3xl mx-auto mb-4 font-mono">
            <TypewriterText text="Master Cross-Site Scripting through hands-on labs" />
          </p>

          <p className="text-lg text-cyber-400 max-w-2xl mx-auto mb-12">
            A professional interactive training platform for learning,
            detecting, and preventing XSS vulnerabilities. Practice on
            intentionally vulnerable applications in a safe, controlled
            environment.
          </p>

          <div className="flex flex-col sm:flex-row items-center justify-center gap-4">
            <Link
              href="/labs"
              className="group px-8 py-4 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 text-neon-green border border-neon-green/40 rounded-xl text-lg font-semibold hover:from-neon-green/30 hover:to-neon-blue/30 transition-all glow-green flex items-center gap-2"
            >
              <Terminal className="w-5 h-5" />
              Start Labs
              <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
            <Link
              href="/scanner"
              className="group px-8 py-4 glass text-neon-blue border border-neon-blue/30 rounded-xl text-lg font-semibold hover:bg-neon-blue/10 transition-all flex items-center gap-2"
            >
              <Search className="w-5 h-5" />
              XSS Scanner
              <ChevronRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
            </Link>
          </div>
        </div>
      </section>

      {/* What is XSS Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid md:grid-cols-2 gap-12 items-center">
            <div>
              <h2 className="text-3xl md:text-4xl font-bold mb-6">
                What is{" "}
                <span className="gradient-text">Cross-Site Scripting?</span>
              </h2>
              <p className="text-cyber-300 text-lg mb-4 leading-relaxed">
                Cross-Site Scripting (XSS) is a web security vulnerability that
                allows attackers to inject malicious scripts into web pages
                viewed by other users. It&apos;s consistently ranked in the OWASP Top
                10 and affects millions of websites worldwide.
              </p>
              <p className="text-cyber-400 mb-6 leading-relaxed">
                XSS attacks exploit the trust a user has in a particular site.
                When successful, an attacker can steal session tokens, redirect
                users, deface websites, or perform actions on behalf of the
                victim.
              </p>
              <div className="space-y-3">
                {[
                  "Session hijacking and cookie theft",
                  "Credential harvesting via fake forms",
                  "Malware distribution",
                  "Website defacement",
                  "Keylogging and data exfiltration",
                ].map((item, i) => (
                  <div key={i} className="flex items-center gap-3">
                    <AlertTriangle className="w-4 h-4 text-neon-red flex-shrink-0" />
                    <span className="text-cyber-300">{item}</span>
                  </div>
                ))}
              </div>
            </div>
            <div className="code-block p-6">
              <div className="flex items-center gap-2 mb-4 pb-3 border-b border-cyber-700/50">
                <div className="w-3 h-3 rounded-full bg-neon-red/60" />
                <div className="w-3 h-3 rounded-full bg-neon-yellow/60" />
                <div className="w-3 h-3 rounded-full bg-neon-green/60" />
                <span className="text-cyber-500 text-xs ml-2 font-mono">
                  xss-example.js
                </span>
              </div>
              <pre className="text-sm font-mono leading-relaxed">
                <code>
                  <span className="text-cyber-500">
                    {"// "}Vulnerable server code
                  </span>
                  {"\n"}
                  <span className="text-neon-purple">const</span>{" "}
                  <span className="text-neon-blue">query</span>{" "}
                  <span className="text-cyber-300">=</span>{" "}
                  <span className="text-neon-blue">req</span>
                  <span className="text-cyber-300">.</span>
                  <span className="text-neon-blue">query</span>
                  <span className="text-cyber-300">.</span>
                  <span className="text-neon-blue">search</span>
                  <span className="text-cyber-300">;</span>
                  {"\n\n"}
                  <span className="text-cyber-500">
                    {"// "}❌ Directly inserting user input
                  </span>
                  {"\n"}
                  <span className="text-neon-blue">res</span>
                  <span className="text-cyber-300">.</span>
                  <span className="text-neon-yellow">send</span>
                  <span className="text-cyber-300">(</span>
                  <span className="text-neon-green">{"`Results for: ${query}`"}</span>
                  <span className="text-cyber-300">);</span>
                  {"\n\n"}
                  <span className="text-cyber-500">{"// "}Attacker sends:</span>
                  {"\n"}
                  <span className="text-cyber-500">
                    {"// "}/search?q=
                    {"<script>"}steal(cookie){"</script>"}
                  </span>
                  {"\n\n"}
                  <span className="text-cyber-500">
                    {"// "}✅ Secure: encode output
                  </span>
                  {"\n"}
                  <span className="text-neon-purple">const</span>{" "}
                  <span className="text-neon-blue">safe</span>{" "}
                  <span className="text-cyber-300">=</span>{" "}
                  <span className="text-neon-yellow">escapeHtml</span>
                  <span className="text-cyber-300">(</span>
                  <span className="text-neon-blue">query</span>
                  <span className="text-cyber-300">);</span>
                  {"\n"}
                  <span className="text-neon-blue">res</span>
                  <span className="text-cyber-300">.</span>
                  <span className="text-neon-yellow">send</span>
                  <span className="text-cyber-300">(</span>
                  <span className="text-neon-green">{"`Results for: ${safe}`"}</span>
                  <span className="text-cyber-300">);</span>
                </code>
              </pre>
            </div>
          </div>
        </div>
      </section>

      {/* Stats */}
      <section className="py-12 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            {stats.map((stat, i) => (
              <div
                key={i}
                className="glass rounded-xl p-6 text-center glass-hover transition-all"
              >
                <stat.icon className="w-8 h-8 text-neon-green mx-auto mb-3" />
                <div className="text-3xl font-bold text-white mb-1">
                  {stat.value}
                </div>
                <div className="text-sm text-cyber-400">{stat.label}</div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Vulnerability Categories */}
      <section id="labs" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <span className="gradient-text">Vulnerability</span> Categories
            </h2>
            <p className="text-cyber-400 max-w-2xl mx-auto">
              Master every type of Cross-Site Scripting through dedicated,
              progressively difficult challenges
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {categories.map((cat, i) => (
              <div
                key={i}
                className="glass rounded-xl p-6 glass-hover transition-all group cursor-pointer"
              >
                <div className="flex items-start justify-between mb-4">
                  <cat.icon
                    className={`w-10 h-10 text-${cat.color} group-hover:scale-110 transition-transform`}
                  />
                  <span
                    className={`badge-${cat.severity.toLowerCase()} px-3 py-1 rounded-full text-xs font-semibold`}
                  >
                    {cat.severity}
                  </span>
                </div>
                <h3 className="text-xl font-bold text-white mb-2">
                  {cat.title}
                </h3>
                <p className="text-cyber-400 text-sm">{cat.description}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Learning Roadmap */}
      <section id="roadmap" className="py-20 px-4">
        <div className="max-w-4xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Learning <span className="gradient-text">Roadmap</span>
            </h2>
            <p className="text-cyber-400">
              Follow a structured path from beginner to expert
            </p>
          </div>

          <div className="space-y-6">
            {roadmapSteps.map((step, i) => (
              <div key={i} className="flex gap-6 items-start group">
                <div className="flex flex-col items-center">
                  <div className="w-10 h-10 rounded-full bg-neon-green/10 border border-neon-green/30 flex items-center justify-center text-neon-green font-bold group-hover:bg-neon-green/20 transition-all">
                    {step.step}
                  </div>
                  {i < roadmapSteps.length - 1 && (
                    <div className="w-px h-12 bg-cyber-700 mt-2" />
                  )}
                </div>
                <div className="glass rounded-xl p-5 flex-1 glass-hover transition-all">
                  <h3 className="text-lg font-semibold text-white mb-1">
                    {step.title}
                  </h3>
                  <p className="text-cyber-400 text-sm">{step.description}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* Scanner Section */}
      <section id="scanner" className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="glass rounded-2xl p-12 text-center glow-blue">
            <Search className="w-16 h-16 text-neon-blue mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Educational <span className="gradient-text">XSS Scanner</span>
            </h2>
            <p className="text-cyber-300 max-w-2xl mx-auto mb-8 text-lg">
              Use our DAST-style detection engine to analyze lab endpoints.
              Discover vulnerabilities, understand their context, and learn
              proper remediation.
            </p>
            <Link
              href="/scanner"
              className="inline-flex items-center gap-2 px-8 py-4 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-xl text-lg font-semibold hover:bg-neon-blue/20 transition-all"
            >
              <Search className="w-5 h-5" />
              Launch Scanner
            </Link>
          </div>
        </div>
      </section>

      {/* Secure Coding Section */}
      <section className="py-20 px-4">
        <div className="max-w-7xl mx-auto">
          <div className="text-center mb-12">
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              <Lock className="inline w-8 h-8 text-neon-green mr-2" />
              Secure <span className="gradient-text">Coding</span> Practices
            </h2>
            <p className="text-cyber-400 max-w-2xl mx-auto">
              Every lab teaches you the defensive side — how to write secure
              code
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
            {[
              {
                title: "Output Encoding",
                desc: "HTML-encode user data before rendering",
                icon: Code,
              },
              {
                title: "Input Validation",
                desc: "Validate and sanitize all user input server-side",
                icon: Shield,
              },
              {
                title: "Content Security Policy",
                desc: "Deploy CSP headers to prevent inline scripts",
                icon: Lock,
              },
              {
                title: "Safe DOM APIs",
                desc: "Use textContent instead of innerHTML",
                icon: FileCode,
              },
              {
                title: "Security Headers",
                desc: "X-Content-Type-Options, Referrer-Policy, HSTS",
                icon: Layers,
              },
              {
                title: "Burp Suite Analysis",
                desc: "Learn to intercept and analyze HTTP traffic",
                icon: Eye,
              },
            ].map((item, i) => (
              <div
                key={i}
                className="glass rounded-xl p-6 glass-hover transition-all"
              >
                <item.icon className="w-8 h-8 text-neon-green mb-4" />
                <h3 className="text-lg font-semibold text-white mb-2">
                  {item.title}
                </h3>
                <p className="text-cyber-400 text-sm">{item.desc}</p>
              </div>
            ))}
          </div>
        </div>
      </section>

      {/* CTA */}
      <section className="py-20 px-4">
        <div className="max-w-4xl mx-auto text-center">
          <div className="glass rounded-2xl p-12 glow-green">
            <Trophy className="w-16 h-16 text-neon-green mx-auto mb-6" />
            <h2 className="text-3xl md:text-4xl font-bold mb-4">
              Ready to <span className="gradient-text">Level Up?</span>
            </h2>
            <p className="text-cyber-300 mb-8 text-lg max-w-xl mx-auto">
              Start your cybersecurity journey. Practice real XSS techniques,
              earn points, and become a security expert.
            </p>
            <Link
              href="/labs"
              className="inline-flex items-center gap-2 px-8 py-4 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 text-neon-green border border-neon-green/40 rounded-xl text-lg font-semibold hover:from-neon-green/30 hover:to-neon-blue/30 transition-all glow-green"
            >
              <BookOpen className="w-5 h-5" />
              Explore All Labs
              <ArrowRight className="w-5 h-5" />
            </Link>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-4 border-t border-cyber-800">
        <div className="max-w-7xl mx-auto text-center">
          <div className="flex items-center justify-center gap-2 mb-4">
            <Shield className="w-6 h-6 text-neon-green" />
            <span className="text-lg font-bold gradient-text">
              XSS Detection Lab
            </span>
          </div>
          <p className="text-cyber-500 text-sm mb-2">
            An authorized cybersecurity training environment for educational
            purposes.
          </p>
          <p className="text-cyber-600 text-xs">
            Vulnerabilities are intentionally created for learning. Do not use
            these techniques on unauthorized systems.
          </p>
        </div>
      </footer>
    </div>
  );
}
