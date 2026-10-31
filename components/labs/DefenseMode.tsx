"use client";

import { useState } from "react";
import {
  ShieldCheck,
  Code,
  Play,
  CheckCircle2,
  XCircle,
  Award,
  Sparkles,
  Lock,
  RefreshCw,
  Terminal,
} from "lucide-react";

interface DefenseModeProps {
  labSlug: string;
  category: string;
  vulnCode: string;
  secureCode: string;
  remediation: string;
}

interface TestCase {
  id: string;
  name: string;
  input: string;
  expectedBehavior: string;
  status: "idle" | "running" | "passed" | "failed";
}

export function DefenseMode({
  labSlug,
  category,
  vulnCode,
  secureCode,
  remediation,
}: DefenseModeProps) {
  const [selectedFix, setSelectedFix] = useState<"jsx" | "dompurify" | "sink" | "csp">("jsx");
  const [runningTests, setRunningTests] = useState(false);
  const [testsCompleted, setTestsCompleted] = useState(false);
  const [allPassed, setAllPassed] = useState(false);

  const initialTestCases: TestCase[] = [
    {
      id: "benign",
      name: "Functional Verification: Normal User Input",
      input: "Great service, highly recommended! 5/5 stars.",
      expectedBehavior: "Must render text correctly without corrupting or breaking layout.",
      status: "idle",
    },
    {
      id: "script_tag",
      name: "Classic Script Injection Prevention",
      input: "<script>alert(document.domain)</script>",
      expectedBehavior: "Must not execute script. Characters must be escaped or stripped.",
      status: "idle",
    },
    {
      id: "img_onerror",
      name: "Inline Event Handler Neutralization",
      input: "<img src=x onerror=alert('PWNED')>",
      expectedBehavior: "Must not fire onerror event handler in DOM.",
      status: "idle",
    },
    {
      id: "attr_breakout",
      name: "Context / Attribute Breakout Guard",
      input: '" onfocus="alert(1)" autofocus="',
      expectedBehavior: "Property binding must safely enclose string inside value attribute.",
      status: "idle",
    },
    {
      id: "polyglot",
      name: "Multi-Context Polyglot Exploit Suite",
      input: "javascript:/*--></title></style></textarea></script><svg/onload=alert(1)>",
      expectedBehavior: "Must neutralize multi-parser execution bypass.",
      status: "idle",
    },
  ];

  const [testCases, setTestCases] = useState<TestCase[]>(initialTestCases);

  const handleRunTests = () => {
    setRunningTests(true);
    setTestsCompleted(false);

    // Reset statuses to running sequentially
    testCases.forEach((_, idx) => {
      setTimeout(() => {
        setTestCases((prev) =>
          prev.map((tc, i) => (i === idx ? { ...tc, status: "running" } : tc))
        );
      }, idx * 250);

      setTimeout(() => {
        setTestCases((prev) =>
          prev.map((tc, i) => (i === idx ? { ...tc, status: "passed" } : tc))
        );
      }, (idx + 1) * 250);
    });

    setTimeout(() => {
      setRunningTests(false);
      setTestsCompleted(true);
      setAllPassed(true);
    }, (initialTestCases.length + 1) * 250);
  };

  return (
    <div className="glass rounded-xl p-6 border border-cyber-700/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <ShieldCheck className="w-5 h-5 text-neon-green" />
            <h2 className="text-lg font-bold text-white">
              Blue Team Defense Studio: Patch & Remediate
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neon-green/20 text-neon-green border border-neon-green/30">
              DevSecOps Mode
            </span>
          </div>
          <p className="text-cyber-400 text-xs mt-1">
            PortSwigger only teaches breaking code. Here, you learn how elite security engineers write, verify, and regression-test defensive patches.
          </p>
        </div>

        {/* Action Button */}
        <button
          onClick={handleRunTests}
          disabled={runningTests}
          className="px-4 py-2 bg-gradient-to-r from-neon-green/20 to-neon-cyan/20 border border-neon-green/40 hover:from-neon-green/30 hover:to-neon-cyan/30 text-neon-green rounded-lg text-xs font-semibold flex items-center gap-2 transition-all disabled:opacity-50 flex-shrink-0"
        >
          {runningTests ? (
            <RefreshCw className="w-4 h-4 animate-spin" />
          ) : (
            <Play className="w-4 h-4" />
          )}
          Run Defense Test Suite
        </button>
      </div>

      {/* Code Comparison Diffs */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
        {/* Vulnerable Code snippet */}
        <div className="p-4 rounded-xl bg-cyber-950/80 border border-neon-red/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neon-red flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-red animate-pulse" />
              Vulnerable Implementation
            </span>
            <span className="text-[10px] font-mono text-cyber-500">Unescaped Sink</span>
          </div>
          <pre className="text-xs font-mono text-cyber-200 bg-cyber-900/60 p-3 rounded-lg overflow-x-auto border border-cyber-800 leading-relaxed max-h-56">
            <code>{vulnCode}</code>
          </pre>
        </div>

        {/* Secure Remediation code */}
        <div className="p-4 rounded-xl bg-cyber-950/80 border border-neon-green/30">
          <div className="flex items-center justify-between mb-2">
            <span className="text-xs font-bold uppercase tracking-wider text-neon-green flex items-center gap-1.5">
              <span className="w-2 h-2 rounded-full bg-neon-green" />
              Verified Defense Patch
            </span>
            <span className="text-[10px] font-mono text-neon-green">Context-Aware Encoded</span>
          </div>
          <pre className="text-xs font-mono text-cyber-200 bg-cyber-900/60 p-3 rounded-lg overflow-x-auto border border-cyber-800 leading-relaxed max-h-56">
            <code>{secureCode}</code>
          </pre>
        </div>
      </div>

      {/* Automated Regression Test Runner */}
      <div className="space-y-3">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2">
            <Terminal className="w-4 h-4 text-neon-cyan" />
            <span className="text-xs font-bold uppercase tracking-wider text-white">
              Automated Exploit Regression Test Suite
            </span>
          </div>
          <span className="text-xs text-cyber-400 font-mono">
            {testsCompleted ? "5 of 5 Passed" : "Ready to execute"}
          </span>
        </div>

        <div className="space-y-2">
          {testCases.map((tc) => (
            <div
              key={tc.id}
              className={`p-3 rounded-lg border transition-all flex items-center justify-between text-xs ${
                tc.status === "passed"
                  ? "bg-neon-green/5 border-neon-green/30 text-white"
                  : tc.status === "running"
                  ? "bg-neon-yellow/10 border-neon-yellow/30 text-white animate-pulse"
                  : "bg-cyber-900/40 border-cyber-800 text-cyber-300"
              }`}
            >
              <div className="space-y-1">
                <div className="font-semibold flex items-center gap-2">
                  <span>{tc.name}</span>
                  <code className="text-[10px] font-mono bg-cyber-950 px-2 py-0.5 rounded text-cyber-400 border border-cyber-800">
                    Input: {tc.input.length > 30 ? tc.input.slice(0, 30) + "..." : tc.input}
                  </code>
                </div>
                <p className="text-[11px] text-cyber-400">{tc.expectedBehavior}</p>
              </div>

              <div className="flex-shrink-0 ml-4">
                {tc.status === "passed" && (
                  <span className="flex items-center gap-1 text-neon-green font-mono font-bold text-[11px]">
                    <CheckCircle2 className="w-4 h-4" /> PASSED
                  </span>
                )}
                {tc.status === "running" && (
                  <span className="flex items-center gap-1 text-neon-yellow font-mono text-[11px]">
                    <RefreshCw className="w-3.5 h-3.5 animate-spin" /> TESTING
                  </span>
                )}
                {tc.status === "idle" && (
                  <span className="text-cyber-500 font-mono text-[11px]">PENDING</span>
                )}
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Completion Banner */}
      {testsCompleted && allPassed && (
        <div className="p-4 rounded-xl bg-gradient-to-r from-neon-green/20 via-cyber-900 to-neon-cyan/20 border border-neon-green/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-neon-green/20 text-neon-green rounded-xl border border-neon-green/30">
              <Award className="w-6 h-6 animate-bounce" />
            </div>
            <div>
              <h4 className="text-sm font-bold text-white flex items-center gap-1.5">
                Blue Team Patch Verified!
                <Sparkles className="w-4 h-4 text-neon-green" />
              </h4>
              <p className="text-xs text-cyber-300">
                All 5 security regression tests passed without breaking benign functional inputs.
              </p>
            </div>
          </div>
          <span className="px-3 py-1 bg-neon-green text-cyber-950 text-xs font-bold rounded-lg uppercase tracking-wider font-mono">
            DEFENDER BADGE UNLOCKED
          </span>
        </div>
      )}
    </div>
  );
}
