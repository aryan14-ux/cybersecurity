"use client";

import { useState, useEffect } from "react";
import { usePathname, useSearchParams } from "next/navigation";
import Link from "next/link";
import {
  Shield,
  Trophy,
  Sparkles,
  Zap,
  Sliders,
  ChevronDown,
  ChevronUp,
  Copy,
  Check,
  Code,
  AlertTriangle,
  Target,
  ArrowLeft,
  CheckCircle2,
} from "lucide-react";
import { ConfettiCanvas } from "./ConfettiCanvas";
import { playSuccessChime } from "@/lib/labs/oracle";

interface LabMeta {
  slug: string;
  title: string;
  category: string;
  vulnPath: string;
  securePath: string;
  defaultPayload: string;
  sinkDescription: string;
}

const LABS_REGISTRY: Record<string, LabMeta> = {
  reflected: {
    slug: "reflected-xss-search",
    title: "Reflected XSS — Unencoded Search Reflection",
    category: "Reflected",
    vulnPath: "/labs/reflected",
    securePath: "/labs/reflected/secure",
    defaultPayload: "<script>alert(1)</script>",
    sinkDescription: "dangerouslySetInnerHTML without output encoding",
  },
  stored: {
    slug: "stored-xss-comments",
    title: "Stored XSS — Persistent Comment Database Injection",
    category: "Stored",
    vulnPath: "/labs/stored",
    securePath: "/labs/stored/secure",
    defaultPayload: "<img src=x onerror=alert('StoredXSS')>",
    sinkDescription: "database comments rendered via raw HTML markup",
  },
  dom: {
    slug: "dom-xss-client",
    title: "DOM XSS — Client-Side Hash Fragment Sink",
    category: "DOM",
    vulnPath: "/labs/dom",
    securePath: "/labs/dom/secure",
    defaultPayload: "<img src=x onerror=alert('DOM')>",
    sinkDescription: "element.innerHTML = decodeURIComponent(location.hash)",
  },
  "filter-bypass": {
    slug: "filter-bypass-xss",
    title: "Filter Bypass — Script Tag Stripper Bypass",
    category: "Filter Bypass",
    vulnPath: "/labs/filter-bypass",
    securePath: "/labs/filter-bypass/secure",
    defaultPayload: "<img src=x onerror=alert(1)>",
    sinkDescription: "regex strips <script> but allows HTML event handlers",
  },
  context: {
    slug: "context-xss-attribute",
    title: "Context Breakout — HTML Attribute Quote Escape",
    category: "Context",
    vulnPath: "/labs/context",
    securePath: "/labs/context/secure",
    defaultPayload: '" onfocus="alert(1)" autofocus="',
    sinkDescription: 'input placed unquoted inside value="" attribute',
  },
};

export function PortSwiggerLabHeader() {
  const pathname = usePathname() || "";
  const searchParams = useSearchParams();

  // Detect which lab this is
  const labKey = Object.keys(LABS_REGISTRY).find((key) =>
    pathname.includes(`/labs/${key}`)
  ) || "reflected";

  const labMeta = LABS_REGISTRY[labKey];
  const isSecureMode = pathname.endsWith("/secure");

  const [isSolved, setIsSolved] = useState(false);
  const [showConfetti, setShowConfetti] = useState(false);
  const [showHud, setShowHud] = useState(false);
  const [copiedPayload, setCopiedPayload] = useState(false);
  const [resetting, setResetting] = useState(false);

  // Check initial solved state
  useEffect(() => {
    try {
      const solvedKey = `xss_solved_${labMeta.slug}`;
      if (localStorage.getItem(solvedKey) === "true") {
        setIsSolved(true);
      }
    } catch {
      // ignore
    }
  }, [labMeta.slug]);

  // Listen for exploit oracle trigger
  useEffect(() => {
    const onExploitSuccess = () => {
      setIsSolved(true);
      setShowConfetti(true);
      playSuccessChime();

      try {
        localStorage.setItem(`xss_solved_${labMeta.slug}`, "true");
        fetch("/api/labs/complete", {
          method: "POST",
          headers: { "Content-Type": "application/json" },
          body: JSON.stringify({
            labId: labMeta.slug,
            mode: "CHALLENGE",
            hintsUsed: 0,
          }),
        }).catch(() => {});
      } catch {
        // ignore
      }

      setTimeout(() => setShowConfetti(false), 5000);
    };

    window.addEventListener("xss-exploit-success", onExploitSuccess);
    return () => {
      window.removeEventListener("xss-exploit-success", onExploitSuccess);
    };
  }, [labMeta.slug]);

  const currentQuery = searchParams.get("q") || searchParams.get("user") || "";

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopiedPayload(true);
    setTimeout(() => setCopiedPayload(false), 2000);
  };

  const handleResetLab = async () => {
    setResetting(true);
    try {
      // Clear localStorage
      localStorage.removeItem(`xss_solved_${labMeta.slug}`);
      localStorage.removeItem("xss_last_exploit");

      // Clear DB progress
      await fetch("/api/labs/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labSlug: labMeta.slug }),
      });

      setIsSolved(false);
      window.location.reload();
    } catch {
      // Still reset local state
      setIsSolved(false);
    } finally {
      setResetting(false);
    }
  };

  return (
    <>
      <ConfettiCanvas active={showConfetti} />

      {/* Cyber Top Header Bar */}
      <header className="fixed top-0 left-0 right-0 z-50 bg-cyber-950/95 text-cyber-100 border-b border-cyber-800 shadow-2xl backdrop-blur-xl select-none">
        <div className="max-w-7xl mx-auto px-4 py-2.5 flex items-center justify-between gap-4">
          {/* Left: Brand & Target Info */}
          <div className="flex items-center gap-3 min-w-0">
            {/* Logo */}
            <Link
              href="/labs"
              className="flex items-center gap-2 group flex-shrink-0"
              title="Return to Labs Hub"
            >
              <div className="w-8 h-8 rounded-lg bg-neon-green/10 border border-neon-green/40 flex items-center justify-center text-neon-green group-hover:scale-105 transition-transform shadow-sm glow-green">
                <Shield className="w-4 h-4" />
              </div>
              <span className="text-white font-extrabold text-sm tracking-wide hidden sm:block">
                XSS <span className="text-neon-green">LAB</span>
              </span>
            </Link>

            <div className="h-6 w-[1px] bg-cyber-800 hidden md:block" />

            {/* Title & Guide link */}
            <div className="truncate">
              <div className="flex items-center gap-2">
                <span className="text-white font-semibold text-xs sm:text-sm truncate block">
                  {labMeta.title}
                </span>
              </div>
              <Link
                href={`/labs/${labMeta.slug}`}
                className="text-[11px] text-cyber-400 hover:text-neon-green flex items-center gap-1 transition-colors"
              >
                <ArrowLeft className="w-3 h-3" />
                Mission Intel &amp; Solution Guide
              </Link>
            </div>
          </div>

          {/* Center: Animated Exploit Status Pill */}
          <div className="flex-shrink-0 flex items-center gap-2">
            {isSolved ? (
              <>
                <div className="flex items-center rounded-lg overflow-hidden border border-neon-green/60 bg-neon-green/15 text-neon-green px-3 py-1 shadow-lg glow-green">
                  <CheckCircle2 className="w-3.5 h-3.5 mr-1.5" />
                  <span className="text-xs font-extrabold uppercase tracking-wider">
                    Solved!
                  </span>
                  <Sparkles className="w-3.5 h-3.5 ml-1.5 hidden sm:inline" />
                </div>
                <button
                  onClick={handleResetLab}
                  disabled={resetting}
                  className="flex items-center gap-1 px-2.5 py-1 rounded-lg text-[11px] font-semibold border border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow hover:bg-neon-yellow/20 transition-all disabled:opacity-50"
                  title="Reset this lab to try again"
                >
                  <Target className="w-3 h-3" />
                  {resetting ? "Resetting..." : "Reset Lab"}
                </button>
              </>
            ) : (
              <div className="flex items-center rounded-lg overflow-hidden border border-cyber-700 bg-cyber-900/80 px-2.5 py-1 text-xs">
                <span className="relative flex h-2 w-2 mr-2">
                  <span className="animate-ping absolute inline-flex h-full w-full rounded-full bg-neon-red opacity-75" />
                  <span className="relative inline-flex rounded-full h-2 w-2 bg-neon-red" />
                </span>
                <span className="text-cyber-400 font-mono uppercase tracking-wider text-[11px]">
                  Target: <span className="text-neon-red font-bold">Unsolved</span>
                </span>
              </div>
            )}
          </div>

          {/* Right: Unique Differentiator Controls */}
          <div className="flex items-center gap-2 flex-shrink-0">
            {/* Differentiator 1: Red/Blue Team Switcher */}
            <Link
              href={isSecureMode ? labMeta.vulnPath : labMeta.securePath}
              className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-xs font-semibold border transition-all ${
                isSecureMode
                  ? "bg-neon-red/10 text-neon-red border-neon-red/30 hover:bg-neon-red/20"
                  : "bg-neon-green/10 text-neon-green border-neon-green/30 hover:bg-neon-green/20"
              }`}
              title={
                isSecureMode
                  ? "Switch to vulnerable target app"
                  : "Switch to secure defense reference"
              }
            >
              {isSecureMode ? (
                <>
                  <AlertTriangle className="w-3.5 h-3.5 text-neon-red" />
                  <span className="hidden sm:inline">Switch to</span> Vulnerable
                </>
              ) : (
                <>
                  <Shield className="w-3.5 h-3.5 text-neon-green" />
                  <span className="hidden sm:inline">Switch to</span> Secure Fix
                </>
              )}
            </Link>

            {/* Differentiator 2: In-Page Taint HUD Drawer */}
            <button
              onClick={() => setShowHud(!showHud)}
              className="flex items-center gap-1 px-3 py-1.5 bg-cyber-900 border border-cyber-700 hover:border-cyber-600 rounded-lg text-xs font-medium text-cyber-300 hover:text-white transition-all"
              title="Toggle Live Taint & Payload HUD"
            >
              <Sliders className="w-3.5 h-3.5 text-neon-cyan" />
              <span className="hidden md:inline">Taint HUD</span>
              {showHud ? (
                <ChevronUp className="w-3 h-3 text-cyber-400" />
              ) : (
                <ChevronDown className="w-3 h-3 text-cyber-400" />
              )}
            </button>
          </div>
        </div>

        {/* Gradient Cyber Line */}
        <div className="h-[2px] bg-gradient-to-r from-neon-green via-neon-blue to-neon-purple w-full opacity-60" />

        {/* Dropdown Taint HUD Drawer */}
        {showHud && (
          <div className="bg-cyber-900/98 border-b border-cyber-800 px-4 py-3 shadow-2xl animate-in slide-in-from-top duration-200">
            <div className="max-w-7xl mx-auto flex flex-col md:flex-row items-start md:items-center justify-between gap-3 text-xs">
              <div className="space-y-1">
                <div className="flex items-center gap-2">
                  <span className="font-bold text-neon-cyan uppercase tracking-wider text-[10px]">
                    Live Taint Inspector
                  </span>
                  <span className="text-cyber-600">•</span>
                  <span className="text-cyber-400">
                    Sink: <code className="font-mono text-neon-green">{labMeta.sinkDescription}</code>
                  </span>
                </div>
                <div className="flex items-center gap-2 font-mono text-[11px] text-cyber-400">
                  <span>Detected Payload:</span>
                  <span className="text-neon-yellow bg-cyber-950 px-2 py-0.5 rounded border border-cyber-800">
                    {currentQuery || "(none detected in query parameter)"}
                  </span>
                </div>
              </div>

              <div className="flex items-center gap-2">
                <code className="font-mono text-cyber-300 bg-cyber-950 px-3 py-1.5 rounded border border-cyber-800 text-xs">
                  {labMeta.defaultPayload}
                </code>
                <button
                  onClick={() => handleCopy(labMeta.defaultPayload)}
                  className="flex items-center gap-1 px-3 py-1.5 bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/40 hover:bg-neon-cyan/30 rounded font-semibold transition-all text-xs"
                >
                  {copiedPayload ? (
                    <Check className="w-3.5 h-3.5 text-neon-green" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                  {copiedPayload ? "Copied!" : "Copy Payload"}
                </button>
              </div>
            </div>
          </div>
        )}
      </header>

      {/* Persistent celebratory toast when solved */}
      {isSolved && (
        <div className="fixed bottom-6 right-6 z-50 animate-bounce">
          <div className="flex items-center gap-3 px-5 py-3.5 bg-cyber-900/95 border-2 border-neon-green shadow-2xl rounded-xl text-white glow-green backdrop-blur-md">
            <div className="p-2 bg-neon-green/20 rounded-lg text-neon-green">
              <Trophy className="w-6 h-6 text-neon-green" />
            </div>
            <div>
              <span className="text-neon-green font-extrabold text-sm block">
                EXPLOIT CONFIRMED • LAB SOLVED!
              </span>
              <p className="text-cyber-400 text-xs font-mono">
                Verified by In-Browser Exploit Oracle
              </p>
            </div>
            <button
              onClick={handleResetLab}
              disabled={resetting}
              className="ml-2 px-3 py-1.5 rounded-lg text-xs font-bold border border-neon-yellow/50 bg-neon-yellow/15 text-neon-yellow hover:bg-neon-yellow/25 transition-all shadow disabled:opacity-50 flex items-center gap-1.5"
              title="Reset progress to exploit this lab again"
            >
              <Target className="w-3.5 h-3.5" />
              {resetting ? "Resetting..." : "Reset & Try Again"}
            </button>
          </div>
        </div>
      )}
    </>
  );
}
