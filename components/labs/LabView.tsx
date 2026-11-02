"use client";

import { useState, useEffect } from "react";
import {
  Shield,
  Target,
  Zap,
  ChevronDown,
  ChevronUp,
  Share2,
  CheckCircle2,
  Sparkles,
  Trophy,
  Copy,
  Check,
  ExternalLink,
  BookOpen,
  Code,
  ArrowLeft,
  Terminal,
  Play,
  Flame,
  AlertTriangle,
  Globe,
  Radio,
  FileCode2,
  CheckCircle,
  XCircle,
  HelpCircle,
  RotateCcw,
} from "lucide-react";
import Link from "next/link";
import { playSuccessChime } from "@/lib/labs/oracle";
import { LAB_EDUCATIONAL_INTEL } from "@/lib/labs/educationalContent";

interface Lab {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: string;
  category: string;
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
}

interface Progress {
  completed: boolean;
  bestScore: number;
  totalAttempts: number;
  hintsUsed: number;
}

interface LabViewProps {
  lab: Lab;
  progress: Progress | null;
  mode?: "learn" | "challenge";
  isAuthenticated?: boolean;
}

export function LabView({ lab, progress }: LabViewProps) {
  const [completed, setCompleted] = useState(progress?.completed || false);
  const [solutionOpen, setSolutionOpen] = useState(true);
  const [conceptOpen, setConceptOpen] = useState(true);
  const [scenariosOpen, setScenariosOpen] = useState(true);
  const [codeOpen, setCodeOpen] = useState(true);
  const [defenseOpen, setDefenseOpen] = useState(false);
  const [codeTab, setCodeTab] = useState<"vuln" | "secure">("vuln");
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [copiedLink, setCopiedLink] = useState(false);
  const [solvedSlugs, setSolvedSlugs] = useState<Record<string, boolean>>({});

  const intel =
    LAB_EDUCATIONAL_INTEL[lab.category] || LAB_EDUCATIONAL_INTEL.REFLECTED;

  // Determine standard payload for this lab
  const getStandardPayload = () => {
    switch (lab.category) {
      case "DOM":
        return "<img src=x onerror=alert(1)>";
      case "STORED":
        return "<img src=x onerror=alert('StoredXSS')>";
      case "FILTER_BYPASS":
        return "<img src=x onerror=alert(1)>";
      case "CONTEXT":
        return '" onfocus="alert(1)" autofocus="';
      case "REFLECTED":
      default:
        return "<script>alert(1)</script>";
    }
  };

  const defaultPayload = getStandardPayload();

  // Check solved state from localStorage and database
  useEffect(() => {
    try {
      const map: Record<string, boolean> = {};
      [
        "reflected-xss-search",
        "stored-xss-comments",
        "dom-xss-client",
        "filter-bypass-xss",
        "context-xss-attribute",
      ].forEach((slug) => {
        if (localStorage.getItem(`xss_solved_${slug}`) === "true") {
          map[slug] = true;
        }
      });
      if (progress?.completed) {
        map[lab.slug] = true;
      }
      setSolvedSlugs(map);
      if (map[lab.slug] || localStorage.getItem(`xss_solved_${lab.slug}`) === "true") {
        setCompleted(true);
      }
    } catch {
      // ignore
    }
  }, [lab.slug, progress?.completed]);

  // Listen for real-time exploit oracle completion
  useEffect(() => {
    const handleExploit = () => {
      setCompleted(true);
      playSuccessChime();
    };

    window.addEventListener("xss-exploit-success", handleExploit);
    return () => {
      window.removeEventListener("xss-exploit-success", handleExploit);
    };
  }, []);

  const [resetting, setResetting] = useState(false);

  const handleResetLab = async () => {
    setResetting(true);
    try {
      localStorage.removeItem(`xss_solved_${lab.slug}`);
      localStorage.removeItem("xss_last_exploit");

      await fetch("/api/labs/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labSlug: lab.slug }),
      });

      setCompleted(false);
      setSolvedSlugs((prev) => {
        const next = { ...prev };
        delete next[lab.slug];
        return next;
      });
      window.location.reload();
    } catch (err) {
      console.warn("Reset lab error:", err);
      setCompleted(false);
    } finally {
      setResetting(false);
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleCopyLink = () => {
    navigator.clipboard.writeText(window.location.href);
    setCopiedLink(true);
    setTimeout(() => setCopiedLink(false), 2000);
  };

  const difficultyTier =
    lab.difficulty === "EASY"
      ? "APPRENTICE"
      : lab.difficulty === "MEDIUM"
      ? "PRACTITIONER"
      : "EXPERT";

  const difficultyBadgeStyle =
    lab.difficulty === "EASY"
      ? "bg-neon-green/10 text-neon-green border-neon-green/40"
      : lab.difficulty === "MEDIUM"
      ? "bg-neon-yellow/10 text-neon-yellow border-neon-yellow/40"
      : "bg-neon-red/10 text-neon-red border-neon-red/40";

  const categoryName = lab.category.replace("_", " ");

  const topicsList = [
    { title: "Reflected XSS", slug: "reflected-xss-search", active: lab.category === "REFLECTED", count: "Easy" },
    { title: "Stored XSS", slug: "stored-xss-comments", active: lab.category === "STORED", count: "Medium" },
    { title: "DOM-Based XSS", slug: "dom-xss-client", active: lab.category === "DOM", count: "Medium" },
    { title: "Filter Bypasses", slug: "filter-bypass-xss", active: lab.category === "FILTER_BYPASS", count: "Hard" },
    { title: "Context Breakouts", slug: "context-xss-attribute", active: lab.category === "CONTEXT", count: "Hard" },
  ];

  return (
    <div className="min-h-screen bg-cyber-950 text-cyber-100 font-sans p-4 sm:p-6 lg:p-8">
      <div className="max-w-7xl mx-auto flex flex-col lg:flex-row gap-6">
        {/* Left Sidebar: Training Syllabus Navigation */}
        <aside className="w-full lg:w-72 flex-shrink-0 space-y-4">
          <div className="glass rounded-2xl p-5 border border-cyber-800">
            {/* Back to Catalog Link */}
            <Link
              href="/labs"
              className="flex items-center gap-2 text-cyber-400 hover:text-neon-green text-xs font-semibold uppercase tracking-wider mb-6 transition-colors"
            >
              <ArrowLeft className="w-3.5 h-3.5" />
              All Training Labs
            </Link>

            <h3 className="text-xs font-bold uppercase tracking-wider text-white mb-3 flex items-center gap-1.5">
              <Flame className="w-3.5 h-3.5 text-neon-cyan" />
              Training Syllabus
            </h3>

            {/* Modules List */}
            <nav className="space-y-1.5">
              {topicsList.map((t, idx) => {
                const isCurrent = t.active;
                const isItemSolved = Boolean(solvedSlugs[t.slug]);

                return (
                  <Link
                    key={idx}
                    href={`/labs/${t.slug}`}
                    className={`flex items-center justify-between px-3.5 py-2.5 rounded-xl text-xs font-medium transition-all ${
                      isCurrent
                        ? "bg-neon-green/15 text-neon-green border border-neon-green/30 font-semibold glow-green"
                        : "text-cyber-400 hover:bg-cyber-900 hover:text-white border border-transparent"
                    }`}
                  >
                    <span className="truncate">{t.title}</span>
                    <div className="flex items-center gap-1.5 flex-shrink-0">
                      {isItemSolved && (
                        <CheckCircle2 className="w-3.5 h-3.5 text-neon-green stroke-[3]" />
                      )}
                      <span className="text-[10px] opacity-70 font-mono">
                        {t.count}
                      </span>
                    </div>
                  </Link>
                );
              })}
            </nav>
          </div>

          {/* Quick Details Panel */}
          <div className="glass rounded-2xl p-5 border border-cyber-800 space-y-3">
            <h4 className="text-xs font-bold uppercase tracking-wider text-cyber-400">
              Lab Intel
            </h4>
            <div className="space-y-2 text-xs">
              <div className="flex justify-between py-1 border-b border-cyber-900">
                <span className="text-cyber-500">Category</span>
                <span className="text-white font-mono">{categoryName}</span>
              </div>
              <div className="flex justify-between py-1 border-b border-cyber-900">
                <span className="text-cyber-500">Bounty XP</span>
                <span className="text-neon-green font-mono font-bold">+{lab.points} pts</span>
              </div>
              <div className="flex justify-between py-1">
                <span className="text-cyber-500">Exploit Oracle</span>
                <span className="text-neon-cyan font-mono flex items-center gap-1">
                  <span className="w-1.5 h-1.5 rounded-full bg-neon-cyan animate-ping" />
                  Active Telemetry
                </span>
              </div>
            </div>
          </div>
        </aside>

        {/* Main Content Area */}
        <main className="flex-1 space-y-6">
          {/* Main Mission Card */}
          <div className="glass rounded-2xl p-6 sm:p-8 border border-cyber-800 relative overflow-hidden">
            <div className="absolute top-0 right-0 w-80 h-80 bg-neon-green/5 rounded-full blur-3xl pointer-events-none" />

            {/* Breadcrumb Navigation */}
            <div className="text-xs text-cyber-500 font-mono mb-4 flex items-center gap-2 flex-wrap">
              <Link href="/labs" className="hover:text-neon-green transition-colors">
                ACADEMY
              </Link>
              <span>/</span>
              <span className="uppercase text-cyber-400">{categoryName}</span>
              <span>/</span>
              <span className="text-neon-green uppercase font-bold">{lab.slug}</span>
            </div>

            {/* Lab Title */}
            <h1 className="text-2xl sm:text-3xl lg:text-4xl font-extrabold text-white tracking-tight mb-4">
              {lab.title}
            </h1>

            {/* Badges Row */}
            <div className="flex items-center gap-3 mb-6 flex-wrap">
              <span
                className={`px-3 py-1 rounded-lg text-xs font-bold uppercase tracking-wider border ${difficultyBadgeStyle}`}
              >
                {difficultyTier}
              </span>

              {/* Solved Status Pill & Reset Button */}
              {completed ? (
                <div className="flex items-center gap-2">
                  <div className="flex items-center rounded-lg overflow-hidden border border-neon-green/60 bg-neon-green/15 text-neon-green px-3 py-1 text-xs font-bold shadow-lg glow-green">
                    <CheckCircle2 className="w-3.5 h-3.5 mr-1.5 stroke-[3]" />
                    <span>STATUS: SOLVED</span>
                    <Sparkles className="w-3.5 h-3.5 ml-1.5" />
                  </div>
                  <button
                    onClick={handleResetLab}
                    disabled={resetting}
                    className="flex items-center gap-1.5 px-2.5 py-1 rounded-lg text-xs font-semibold border border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow hover:bg-neon-yellow/20 transition-all disabled:opacity-50"
                    title="Reset this lab and try again"
                  >
                    <RotateCcw className="w-3 h-3" />
                    <span>{resetting ? "Resetting..." : "Reset"}</span>
                  </button>
                </div>
              ) : (
                <div className="flex items-center rounded-lg overflow-hidden border border-cyber-700 bg-cyber-900/90 text-cyber-300 px-3 py-1 text-xs font-medium">
                  <span className="w-2 h-2 rounded-full bg-neon-red mr-2 animate-pulse" />
                  <span>STATUS: UNSOLVED</span>
                </div>
              )}

              {/* Share */}
              <button
                onClick={handleCopyLink}
                className="p-2 rounded-lg bg-cyber-900 border border-cyber-800 text-cyber-400 hover:text-white hover:border-cyber-700 transition-all flex items-center gap-1.5 text-xs"
                title="Copy share link"
              >
                {copiedLink ? <Check className="w-3.5 h-3.5 text-neon-green" /> : <Share2 className="w-3.5 h-3.5" />}
                <span>{copiedLink ? "Link Copied" : "Share"}</span>
              </button>
            </div>

            {/* Objective Paragraph */}
            <div className="space-y-3 text-sm sm:text-base text-cyber-300 leading-relaxed mb-8 max-w-3xl">
              <p>{lab.description}</p>
              <p className="text-white font-medium bg-cyber-900/60 p-3 rounded-xl border border-cyber-800">
                🎯 <strong className="text-neon-green">Objective:</strong> Inject a payload into the target endpoint that causes JavaScript to execute (triggering an <code className="text-neon-cyan font-mono text-xs">alert()</code> dialog), proving code execution.
              </p>
            </div>

            {/* Target Launch Buttons */}
            <div className="flex flex-wrap items-center gap-4 pt-2">
              <Link
                href={lab.vulnEndpoint}
                target="_blank"
                className="inline-flex items-center gap-2.5 bg-gradient-to-r from-neon-green/20 via-neon-cyan/20 to-neon-green/20 border border-neon-green text-neon-green hover:from-neon-green/30 hover:to-neon-cyan/30 font-bold py-3.5 px-8 rounded-xl text-sm uppercase tracking-wider shadow-lg glow-green transition-all transform active:scale-95"
              >
                <Play className="w-4 h-4 fill-neon-green" />
                Launch Vulnerable Target
                <ExternalLink className="w-4 h-4 ml-1 opacity-80" />
              </Link>

              <Link
                href={lab.secureEndpoint}
                target="_blank"
                className="inline-flex items-center gap-2 px-5 py-3.5 bg-cyber-900/80 hover:bg-cyber-800 border border-cyber-700 text-cyber-300 hover:text-white rounded-xl text-xs font-semibold transition-all"
              >
                <Shield className="w-4 h-4 text-neon-green" />
                View Secure Reference
              </Link>
            </div>
          </div>

          {/* Educational Accordions */}
          <div className="space-y-4">
            {/* Section 1: Attack Vector & Solution Guide */}
            <div className="glass rounded-xl border border-cyber-700 shadow-xl glow-blue overflow-hidden">
              <button
                onClick={() => setSolutionOpen(!solutionOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:bg-cyber-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <span className="text-neon-yellow text-lg">💡</span>
                  <span className="text-sm font-bold">Attack Walkthrough &amp; Working Solution</span>
                </div>
                {solutionOpen ? (
                  <ChevronUp className="w-4 h-4 text-cyber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-cyber-400" />
                )}
              </button>

              {solutionOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-cyber-300 space-y-4 border-t border-cyber-800/60">
                  <p className="leading-relaxed">
                    Follow these step-by-step instructions to trigger code execution and solve this lab:
                  </p>

                  <ol className="list-decimal list-inside space-y-2 text-cyber-200">
                    <li>
                      Click <strong>&quot;Launch Vulnerable Target&quot;</strong> above to open the target application in a new tab.
                    </li>
                    <li>
                      Inject or submit the verified proof-of-concept payload shown below:
                    </li>
                  </ol>

                  {/* Copy Payload Box */}
                  <div className="relative group">
                    <div className="bg-cyber-950 text-neon-green font-mono text-xs sm:text-sm p-4 rounded-xl border border-cyber-800 break-all shadow-inner">
                      <code>{defaultPayload}</code>
                    </div>
                    <button
                      type="button"
                      onClick={() => handleCopy(defaultPayload)}
                      className="absolute right-3 top-3 px-3 py-1 bg-cyber-900 border border-cyber-700 text-xs font-semibold rounded-lg text-cyber-200 hover:text-white flex items-center gap-1.5 transition-all shadow-sm cursor-pointer"
                    >
                      {copiedPayload ? (
                        <Check className="w-3.5 h-3.5 text-neon-green" />
                      ) : (
                        <Copy className="w-3.5 h-3.5" />
                      )}
                      {copiedPayload ? "Copied!" : "Copy Payload"}
                    </button>
                  </div>

                  {/* Why this payload works */}
                  <div className="p-3.5 bg-cyber-900/60 rounded-xl border border-cyber-800 text-xs text-cyber-300 space-y-1">
                    <span className="font-bold text-neon-cyan uppercase tracking-wider block text-[10px]">
                      Why This Payload Works:
                    </span>
                    <p className="leading-relaxed">{intel.whySpecificPayloadWorks}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 2: Deep Dive - What is this Vulnerability? */}
            <div className="glass rounded-xl border border-cyber-800 overflow-hidden shadow-lg">
              <button
                onClick={() => setConceptOpen(!conceptOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:bg-cyber-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <BookOpen className="w-5 h-5 text-neon-cyan" />
                  <span className="text-sm font-bold">Concept Deep Dive: What is {categoryName} XSS?</span>
                </div>
                {conceptOpen ? (
                  <ChevronUp className="w-4 h-4 text-cyber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-cyber-400" />
                )}
              </button>

              {conceptOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-cyber-300 space-y-5 border-t border-cyber-800/60">
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-neon-cyan mb-1.5">
                      Understanding the Vulnerability
                    </h4>
                    <p className="leading-relaxed text-cyber-200">{intel.whatIsIt}</p>
                  </div>

                  {/* Source -> Flow -> Sink Pipeline Cards */}
                  <div>
                    <h4 className="text-xs font-bold uppercase tracking-wider text-white mb-2.5">
                      The Execution Flow Pipeline:
                    </h4>
                    <div className="grid grid-cols-1 md:grid-cols-3 gap-3 font-mono text-xs">
                      <div className="p-3.5 rounded-xl bg-cyber-950/80 border border-cyber-800">
                        <span className="text-[10px] text-neon-yellow font-bold uppercase block mb-1">
                          1. The Source
                        </span>
                        <p className="text-cyber-300 text-[11px] leading-relaxed">
                          {intel.sourceSinkExplanation.source}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-cyber-950/80 border border-cyber-800">
                        <span className="text-[10px] text-neon-blue font-bold uppercase block mb-1">
                          2. The Vulnerable Flow
                        </span>
                        <p className="text-cyber-300 text-[11px] leading-relaxed">
                          {intel.sourceSinkExplanation.flow}
                        </p>
                      </div>

                      <div className="p-3.5 rounded-xl bg-cyber-950/80 border border-neon-red/40">
                        <span className="text-[10px] text-neon-red font-bold uppercase block mb-1">
                          3. The Dangerous Sink
                        </span>
                        <p className="text-cyber-300 text-[11px] leading-relaxed">
                          {intel.sourceSinkExplanation.sink}
                        </p>
                      </div>
                    </div>
                  </div>

                  {/* Why it matters */}
                  <div className="p-3 bg-neon-blue/10 border border-neon-blue/30 rounded-xl text-xs text-cyber-200">
                    <strong className="text-neon-blue block mb-1">Why This Matters:</strong>
                    <p className="leading-relaxed">{intel.whyItMatters}</p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 3: Real-World Scenarios - How it Works in Real Life */}
            <div className="glass rounded-xl border border-cyber-800 overflow-hidden shadow-lg">
              <button
                onClick={() => setScenariosOpen(!scenariosOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:bg-cyber-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Globe className="w-5 h-5 text-neon-green" />
                  <span className="text-sm font-bold">Real-World Attack Scenarios: How It Works in Real Life</span>
                </div>
                {scenariosOpen ? (
                  <ChevronUp className="w-4 h-4 text-cyber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-cyber-400" />
                )}
              </button>

              {scenariosOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-cyber-300 space-y-4 border-t border-cyber-800/60">
                  <p className="leading-relaxed text-cyber-400">
                    In real-world cybersecurity, XSS is not just about popping an alert box. Here is what real attackers actually achieve when exploiting this vulnerability:
                  </p>

                  <div className="space-y-3">
                    {intel.realWorldScenarios.map((scenario, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 space-y-1.5"
                      >
                        <div className="flex items-center justify-between gap-2">
                          <h5 className="font-bold text-white text-xs sm:text-sm flex items-center gap-2">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-green" />
                            {scenario.title}
                          </h5>
                          <span
                            className={`text-[9px] font-mono font-bold px-2 py-0.5 rounded ${
                              scenario.impact === "CRITICAL"
                                ? "bg-neon-red/15 text-neon-red border border-neon-red/30"
                                : "bg-neon-orange/15 text-neon-orange border border-neon-orange/30"
                            }`}
                          >
                            {scenario.impact} IMPACT
                          </span>
                        </div>
                        <p className="text-xs text-cyber-300 leading-relaxed">
                          {scenario.description}
                        </p>
                      </div>
                    ))}
                  </div>

                  {/* Famous Real-World Breach Callout */}
                  <div className="p-4 rounded-xl bg-cyber-950 border border-neon-yellow/30 space-y-1">
                    <div className="flex items-center gap-2 text-neon-yellow font-bold text-xs uppercase tracking-wider">
                      <Trophy className="w-4 h-4" />
                      Famous Real-World Incident: {intel.famousBreach.target} ({intel.famousBreach.year})
                    </div>
                    <p className="text-xs text-cyber-300 leading-relaxed pt-1">
                      {intel.famousBreach.details}
                    </p>
                  </div>
                </div>
              )}
            </div>

            {/* Section 4: Vulnerable vs. Secure Code Comparison */}
            <div className="glass rounded-xl border border-cyber-800 overflow-hidden shadow-lg">
              <button
                onClick={() => setCodeOpen(!codeOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:bg-cyber-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Code className="w-5 h-5 text-neon-yellow" />
                  <span className="text-sm font-bold">Source Code Analysis: Vulnerable vs. Secure Implementation</span>
                </div>
                {codeOpen ? (
                  <ChevronUp className="w-4 h-4 text-cyber-400" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-cyber-400" />
                )}
              </button>

              {codeOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-cyber-300 space-y-4 border-t border-cyber-800/60">
                  {/* Tab switchers */}
                  <div className="flex items-center gap-2">
                    <button
                      type="button"
                      onClick={() => setCodeTab("vuln")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        codeTab === "vuln"
                          ? "bg-neon-red/20 text-neon-red border border-neon-red/50 shadow-md"
                          : "bg-cyber-900 text-cyber-400 border border-cyber-800 hover:text-white"
                      }`}
                    >
                      <XCircle className="w-3.5 h-3.5" />
                      Vulnerable Code (Flawed)
                    </button>

                    <button
                      type="button"
                      onClick={() => setCodeTab("secure")}
                      className={`px-4 py-2 rounded-xl text-xs font-bold transition-all cursor-pointer flex items-center gap-1.5 ${
                        codeTab === "secure"
                          ? "bg-neon-green/20 text-neon-green border border-neon-green/50 shadow-md glow-green"
                          : "bg-cyber-900 text-cyber-400 border border-cyber-800 hover:text-white"
                      }`}
                    >
                      <CheckCircle className="w-3.5 h-3.5" />
                      Patched Code (Industry Fix)
                    </button>
                  </div>

                  {/* Code block */}
                  <div className="relative">
                    <pre className="p-4 bg-cyber-950 rounded-xl border border-cyber-800 font-mono text-xs overflow-x-auto text-cyber-200 leading-relaxed shadow-inner">
                      <code>{codeTab === "vuln" ? lab.vulnCode : lab.secureCode}</code>
                    </pre>
                  </div>

                  <p className="text-xs text-cyber-400 leading-relaxed">
                    {codeTab === "vuln"
                      ? "Notice how the input is placed directly into execution sinks without context-aware escaping or sanitization."
                      : "Notice how the patch either replaces the dangerous sink with a safe API (like textContent / React JSX) or applies strict sanitization."}
                  </p>
                </div>
              )}
            </div>

            {/* Section 5: Enterprise Defense Cheatsheet */}
            <div className="glass rounded-xl border border-neon-green/30 overflow-hidden shadow-lg">
              <button
                onClick={() => setDefenseOpen(!defenseOpen)}
                className="w-full px-6 py-4 flex items-center justify-between text-left font-semibold text-white hover:bg-cyber-900/50 transition-colors cursor-pointer"
              >
                <div className="flex items-center gap-2.5">
                  <Shield className="w-5 h-5 text-neon-green" />
                  <span className="text-sm font-bold text-white">
                    Enterprise Defense Guide: How Real Companies Fix It
                  </span>
                </div>
                {defenseOpen ? (
                  <ChevronUp className="w-4 h-4 text-neon-green" />
                ) : (
                  <ChevronDown className="w-4 h-4 text-neon-green" />
                )}
              </button>

              {defenseOpen && (
                <div className="px-6 pb-6 pt-2 text-xs sm:text-sm text-cyber-300 space-y-4 border-t border-cyber-800">
                  <p className="leading-relaxed text-cyber-300">
                    Modern security teams implement multi-layered defense-in-depth to eliminate this attack vector:
                  </p>

                  <div className="space-y-3">
                    {intel.enterpriseDefense.map((def, idx) => (
                      <div
                        key={idx}
                        className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 space-y-2"
                      >
                        <h5 className="font-bold text-neon-green text-xs flex items-center gap-2">
                          <CheckCircle2 className="w-4 h-4 text-neon-green flex-shrink-0" />
                          {def.title}
                        </h5>
                        <p className="text-xs text-cyber-300 leading-relaxed">
                          {def.rule}
                        </p>
                        <pre className="p-3 bg-cyber-950 rounded-lg border border-cyber-800/80 font-mono text-[11px] text-cyber-200 overflow-x-auto">
                          <code>{def.codeExample}</code>
                        </pre>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </main>
      </div>
    </div>
  );
}
