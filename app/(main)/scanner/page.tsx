"use client";

import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import {
  Search,
  AlertTriangle,
  CheckCircle,
  Shield,
  Loader2,
  Clock,
  Target,
  ExternalLink,
  Bug,
  Info,
  Copy,
  Check,
  Zap,
  Play,
  ArrowRight,
  HelpCircle,
  Radio,
} from "lucide-react";

interface ScanResult {
  id?: string;
  type: string;
  severity: string;
  confidence: number;
  parameter: string;
  context: string;
  evidence: string;
  remediation: string;
}

interface Scan {
  id: string;
  targetUrl: string;
  status: string;
  createdAt: string;
  results: ScanResult[];
}

export default function ScannerPage() {
  const [targetUrl, setTargetUrl] = useState("/labs/reflected?q=test");
  const [scanning, setScanning] = useState(false);
  const [results, setResults] = useState<ScanResult[]>([]);
  const [activeScanMeta, setActiveScanMeta] = useState<{
    url: string;
    date?: string;
    isHistory?: boolean;
    scanId?: string;
  }>({
    url: "/labs/reflected?q=test",
    isHistory: false,
  });
  const [scanHistory, setScanHistory] = useState<Scan[]>([]);
  const [error, setError] = useState("");
  const [scanComplete, setScanComplete] = useState(false);
  const [copiedIndex, setCopiedIndex] = useState<number | null>(null);
  const [scanStep, setScanStep] = useState<string>("");
  const resultsRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    fetchHistory();
  }, []);

  const fetchHistory = async () => {
    try {
      const res = await fetch("/api/scanner");
      if (res.ok) {
        const data = await res.json();
        const scans: Scan[] = data.scans || [];
        setScanHistory(scans);

        // Auto-load latest scan if results are currently empty
        if (scans.length > 0 && results.length === 0 && !scanComplete) {
          const latest = scans[0];
          setResults(latest.results || []);
          setActiveScanMeta({
            url: latest.targetUrl,
            date: latest.createdAt,
            isHistory: true,
            scanId: latest.id,
          });
          setScanComplete(true);
        }
      }
    } catch {
      // Ignore
    }
  };

  const handleScan = async (overrideUrl?: string) => {
    const rawUrl = overrideUrl || targetUrl;
    const effectiveUrl = rawUrl.trim() || "/labs/reflected?q=test";
    setTargetUrl(effectiveUrl);

    setScanning(true);
    setError("");
    setScanStep("Initiating canary probes against target...");

    try {
      const fullTarget = effectiveUrl.startsWith("/")
        ? `${window.location.origin}${effectiveUrl}`
        : effectiveUrl;

      setTimeout(() => {
        setScanStep("Sending XSS syntax-breakers & event handler canaries...");
      }, 500);

      setTimeout(() => {
        setScanStep("Inspecting response reflection contexts & sanitization...");
      }, 1100);

      const res = await fetch("/api/scanner", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ targetUrl: fullTarget }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Scan failed");
        return;
      }

      setResults(data.findings || []);
      setActiveScanMeta({
        url: effectiveUrl,
        date: new Date().toISOString(),
        isHistory: false,
        scanId: data.scanId,
      });
      setScanComplete(true);
      fetchHistory();

      // Smooth scroll to results
      setTimeout(() => {
        resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }, 100);
    } catch {
      setError("Failed to connect to scanner API");
    } finally {
      setScanning(false);
      setScanStep("");
    }
  };

  const loadFromHistory = (scan: Scan) => {
    setResults(scan.results || []);
    setActiveScanMeta({
      url: scan.targetUrl,
      date: scan.createdAt,
      isHistory: true,
      scanId: scan.id,
    });
    setScanComplete(true);
    setError("");
    resultsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  };

  const getSuggestedPayload = (finding: ScanResult) => {
    if (finding.context === "JavaScript") {
      return "'-alert('XSS')-'";
    }
    if (finding.context === "Attribute") {
      return '" onfocus="alert(\'XSS\')" autofocus="';
    }
    return "<img src=x onerror=alert('XSS')>";
  };

  const getExploitUrl = (finding: ScanResult) => {
    try {
      const base = activeScanMeta.url;
      const payload = getSuggestedPayload(finding);
      if (base.includes("/labs/dom")) {
        return `/labs/dom#${encodeURIComponent(payload)}`;
      }
      if (base.includes("/labs/stored")) {
        return `/labs/stored`;
      }
      const url = new URL(base, "http://localhost:3000");
      url.searchParams.set(finding.parameter, payload);
      return `${url.pathname}${url.search}`;
    } catch {
      return `/labs/reflected?q=${encodeURIComponent("<img src=x onerror=alert('XSS')>")}`;
    }
  };

  const handleCopy = (text: string, index: number) => {
    navigator.clipboard.writeText(text);
    setCopiedIndex(index);
    setTimeout(() => setCopiedIndex(null), 2000);
  };

  const severityColors: Record<string, string> = {
    CRITICAL: "badge-critical",
    HIGH: "badge-high",
    MEDIUM: "badge-medium",
    LOW: "badge-low",
  };

  const labPresets = [
    {
      url: "/labs/reflected?q=test",
      label: "Reflected XSS Lab",
      badge: "Vulnerable",
      desc: "Searches threat database; parameter reflected raw",
    },
    {
      url: "/labs/stored",
      label: "Stored XSS Lab",
      badge: "Vulnerable",
      desc: "Comments persisted in DB and rendered unsanitized",
    },
    {
      url: "/labs/dom",
      label: "DOM XSS Lab",
      badge: "Vulnerable",
      desc: "Client-side hash fragment sink (location.hash -> innerHTML)",
    },
    {
      url: "/labs/filter-bypass?q=test",
      label: "Filter Bypass Lab",
      badge: "Vulnerable",
      desc: "Strips <script> tags; event handlers pass through",
    },
    {
      url: "/labs/context?user=test",
      label: "Context XSS Lab",
      badge: "Vulnerable",
      desc: "Unquoted reflection inside input attribute",
    },
    {
      url: "/labs/reflected/secure?q=test",
      label: "Reflected Secure Fix",
      badge: "Secure (0 Findings)",
      desc: "Verified defense reference with JSX text encoding",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-cyber-100">
      {/* Page Header */}
      <div className="mb-8">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-blue/10 border border-neon-blue/30 text-neon-blue text-xs font-mono mb-3">
          <Zap className="w-3.5 h-3.5" />
          AUTOMATED DAST ENGINE
        </div>
        <h1 className="text-3xl sm:text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
          <Search className="w-8 h-8 text-neon-blue" />
          Dynamic XSS Scanner
        </h1>
        <p className="text-cyber-400 text-sm max-w-3xl leading-relaxed">
          Injects syntax-breaking canary probes into target lab endpoints, analyzes reflection
          contexts (HTML, Attribute, Script), and verifies exploitability with one-click test launchers.
        </p>
      </div>

      {/* Educational Quick Guide Card */}
      <div className="glass rounded-xl p-4 mb-6 border border-cyber-800 bg-cyber-900/40">
        <div className="flex items-center gap-2 text-xs font-bold text-neon-cyan uppercase tracking-wider mb-2">
          <HelpCircle className="w-4 h-4" />
          How to Scan &amp; Exploit Labs:
        </div>
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3 text-xs text-cyber-300">
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyber-950/60 border border-cyber-800/80">
            <span className="w-5 h-5 rounded-full bg-neon-blue/20 text-neon-blue flex items-center justify-center font-bold text-[11px] flex-shrink-0">
              1
            </span>
            <span>
              <strong className="text-white block">Select Endpoint</strong>
              Choose a preset button below or enter a target lab URL with a query parameter.
            </span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyber-950/60 border border-cyber-800/80">
            <span className="w-5 h-5 rounded-full bg-neon-cyan/20 text-neon-cyan flex items-center justify-center font-bold text-[11px] flex-shrink-0">
              2
            </span>
            <span>
              <strong className="text-white block">Run DAST Scan</strong>
              Click &quot;Scan Target&quot; to probe for unescaped tags, quotes, and event handlers.
            </span>
          </div>
          <div className="flex items-start gap-2 p-2.5 rounded-lg bg-cyber-950/60 border border-cyber-800/80">
            <span className="w-5 h-5 rounded-full bg-neon-green/20 text-neon-green flex items-center justify-center font-bold text-[11px] flex-shrink-0">
              3
            </span>
            <span>
              <strong className="text-white block">Launch Exploit</strong>
              Click &quot;Launch Exploit in Lab&quot; to trigger the alert and solve the challenge!
            </span>
          </div>
        </div>
      </div>

      {/* Scan Control Center */}
      <div className="glass rounded-xl p-6 mb-8 border border-cyber-700 shadow-xl glow-blue">
        <div className="space-y-4">
          <div>
            <label className="block text-xs font-bold uppercase tracking-wider text-cyber-300 mb-2">
              Target Lab Endpoint (URL with parameters)
            </label>
            <div className="flex flex-col sm:flex-row gap-3">
              <input
                type="text"
                value={targetUrl}
                onChange={(e) => setTargetUrl(e.target.value)}
                onKeyDown={(e) => {
                  if (e.key === "Enter") {
                    e.preventDefault();
                    handleScan();
                  }
                }}
                placeholder="/labs/reflected?q=test"
                className="flex-1 px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-xl text-white placeholder-cyber-600 focus:outline-none focus:border-neon-blue focus:ring-1 focus:ring-neon-blue font-mono text-sm shadow-inner"
              />
              <button
                type="button"
                onClick={() => handleScan()}
                disabled={scanning}
                className="px-6 py-3 bg-gradient-to-r from-neon-blue to-neon-cyan text-cyber-950 font-extrabold rounded-xl hover:opacity-90 transition-all disabled:opacity-50 flex items-center justify-center gap-2 shadow-lg glow-blue cursor-pointer flex-shrink-0"
              >
                {scanning ? (
                  <Loader2 className="w-4 h-4 animate-spin text-cyber-950" />
                ) : (
                  <Play className="w-4 h-4 fill-current" />
                )}
                {scanning ? "Scanning Target..." : "Scan Target"}
              </button>
            </div>
          </div>

          {/* Target Presets */}
          <div>
            <span className="text-[11px] font-semibold text-cyber-500 uppercase tracking-wider block mb-2">
              Quick Target Presets (Click to Load):
            </span>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-2">
              {labPresets.map((preset) => (
                <button
                  key={preset.url}
                  type="button"
                  onClick={() => {
                    setTargetUrl(preset.url);
                    handleScan(preset.url);
                  }}
                  className={`text-left p-3 rounded-xl border transition-all cursor-pointer ${
                    targetUrl === preset.url
                      ? "bg-neon-blue/15 border-neon-blue text-white glow-blue"
                      : "bg-cyber-900/60 border-cyber-800 text-cyber-300 hover:border-cyber-700 hover:bg-cyber-900"
                  }`}
                >
                  <div className="flex items-center justify-between gap-1 mb-1">
                    <span className="font-bold text-xs truncate">{preset.label}</span>
                    <span
                      className={`text-[9px] px-1.5 py-0.2 rounded font-mono font-semibold ${
                        preset.badge.includes("Secure")
                          ? "bg-neon-green/15 text-neon-green border border-neon-green/30"
                          : "bg-neon-red/15 text-neon-red border border-neon-red/30"
                      }`}
                    >
                      {preset.badge}
                    </span>
                  </div>
                  <code className="text-[10px] text-neon-cyan block truncate font-mono">
                    {preset.url}
                  </code>
                </button>
              ))}
            </div>
          </div>

          {/* Active scanning progress indicator */}
          {scanning && (
            <div className="p-4 rounded-xl bg-cyber-950 border border-neon-blue/40 animate-pulse flex items-center gap-3">
              <Radio className="w-5 h-5 text-neon-blue animate-spin" />
              <div>
                <p className="text-xs font-bold text-neon-blue uppercase tracking-wider">
                  Automated Probe Active
                </p>
                <p className="text-xs text-cyber-300 font-mono">{scanStep}</p>
              </div>
            </div>
          )}

          {error && (
            <div className="p-3 bg-neon-red/10 border border-neon-red/30 rounded-xl flex items-center gap-2 text-neon-red text-xs">
              <AlertTriangle className="w-4 h-4 flex-shrink-0" />
              <span>{error}</span>
            </div>
          )}
        </div>
      </div>

      {/* Results Section */}
      <div ref={resultsRef}>
        {scanComplete && (
          <div className="glass rounded-xl p-6 mb-8 border border-cyber-700 shadow-2xl">
            {/* Header info */}
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 pb-4 mb-6 border-b border-cyber-800">
              <div>
                <div className="flex items-center gap-2 mb-1">
                  <Bug className="w-5 h-5 text-neon-green" />
                  <h2 className="text-lg font-bold text-white">Scan Findings</h2>
                  {activeScanMeta.isHistory && (
                    <span className="px-2 py-0.5 rounded bg-cyber-800 text-cyber-400 text-[10px] font-mono">
                      Loaded from History
                    </span>
                  )}
                </div>
                <p className="text-xs text-cyber-400 font-mono flex items-center gap-1">
                  Target: <span className="text-neon-cyan">{activeScanMeta.url}</span>
                </p>
              </div>

              <div className="flex items-center gap-2">
                <span
                  className={`px-3 py-1 rounded-full text-xs font-extrabold uppercase tracking-wide ${
                    results.length > 0 ? "badge-critical" : "badge-low"
                  }`}
                >
                  {results.length > 0
                    ? `${results.length} Vulnerabilit${results.length > 1 ? "ies" : "y"} Found`
                    : "0 Findings • Target Verified Secure"}
                </span>
              </div>
            </div>

            {/* Zero findings state */}
            {results.length === 0 && (
              <div className="text-center py-10 px-4 bg-cyber-950/40 rounded-xl border border-cyber-800">
                <CheckCircle className="w-12 h-12 text-neon-green mx-auto mb-3" />
                <h3 className="text-base font-bold text-white mb-1">
                  No XSS Vulnerabilities Detected
                </h3>
                <p className="text-cyber-400 text-xs max-w-md mx-auto leading-relaxed">
                  All canary probes with HTML tags, script elements, and event handlers were
                  properly sanitized or entity-encoded. This endpoint adheres to defense best practices.
                </p>
                <div className="mt-4">
                  <button
                    type="button"
                    onClick={() => {
                      setTargetUrl("/labs/reflected?q=test");
                      handleScan("/labs/reflected?q=test");
                    }}
                    className="px-4 py-2 bg-neon-blue/15 text-neon-blue border border-neon-blue/30 rounded-lg text-xs font-bold hover:bg-neon-blue/25 transition-all cursor-pointer"
                  >
                    Scan Vulnerable Lab Instead (/labs/reflected)
                  </button>
                </div>
              </div>
            )}

            {/* Finding cards */}
            <div className="space-y-4">
              {results.map((finding, i) => {
                const suggestedPayload = getSuggestedPayload(finding);
                const exploitUrl = getExploitUrl(finding);

                return (
                  <div
                    key={finding.id || i}
                    className="p-5 bg-cyber-900/70 rounded-xl border border-cyber-800 hover:border-cyber-700 transition-all space-y-4 shadow-lg"
                  >
                    {/* Top Row: Severity + Type + Confidence */}
                    <div className="flex items-center justify-between flex-wrap gap-2">
                      <div className="flex items-center gap-2">
                        <span
                          className={`${
                            severityColors[finding.severity] || "badge-high"
                          } px-2.5 py-0.5 rounded-full text-xs font-extrabold uppercase tracking-wide`}
                        >
                          {finding.severity}
                        </span>
                        <span className="text-white font-bold text-sm">
                          {finding.type.replace("_", " ")} XSS Injection
                        </span>
                      </div>
                      <div className="text-right">
                        <span className="text-xs font-mono text-neon-green font-bold bg-neon-green/10 px-2 py-0.5 rounded border border-neon-green/30">
                          {finding.confidence}% confidence
                        </span>
                      </div>
                    </div>

                    {/* Metadata Grid */}
                    <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 text-xs bg-cyber-950/60 p-3 rounded-lg border border-cyber-800/80 font-mono">
                      <div>
                        <span className="text-cyber-500 block text-[10px] uppercase">
                          Vulnerable Parameter
                        </span>
                        <span className="text-neon-cyan font-bold">{finding.parameter}</span>
                      </div>
                      <div>
                        <span className="text-cyber-500 block text-[10px] uppercase">
                          Reflection Context
                        </span>
                        <span className="text-neon-yellow font-bold">{finding.context}</span>
                      </div>
                      <div>
                        <span className="text-cyber-500 block text-[10px] uppercase">
                          Detection Method
                        </span>
                        <span className="text-cyber-300">Canary Probe</span>
                      </div>
                      <div>
                        <span className="text-cyber-500 block text-[10px] uppercase">
                          Action Required
                        </span>
                        <span className="text-neon-red font-bold">Exploit / Patch</span>
                      </div>
                    </div>

                    {/* Evidence Snippet */}
                    <div className="p-3 bg-cyber-950/80 rounded-lg border border-cyber-800">
                      <span className="text-[10px] uppercase tracking-wider text-cyber-500 font-bold block mb-1">
                        Technical Evidence
                      </span>
                      <p className="text-xs text-cyber-300 font-mono leading-relaxed">
                        {finding.evidence}
                      </p>
                    </div>

                    {/* Quick Exploit Action Bar */}
                    <div className="p-3 bg-neon-blue/5 border border-neon-blue/20 rounded-lg flex flex-col sm:flex-row sm:items-center justify-between gap-3">
                      <div className="space-y-1">
                        <span className="text-[10px] uppercase tracking-wider text-neon-cyan font-bold block">
                          PoC Exploit Payload
                        </span>
                        <code className="text-xs text-white font-mono bg-cyber-950 px-2.5 py-1 rounded border border-cyber-800 inline-block">
                          {suggestedPayload}
                        </code>
                      </div>

                      <div className="flex items-center gap-2 flex-shrink-0">
                        <button
                          type="button"
                          onClick={() => handleCopy(suggestedPayload, i)}
                          className="px-3 py-1.5 rounded-lg bg-cyber-900 border border-cyber-700 hover:border-cyber-600 text-xs font-semibold text-cyber-300 hover:text-white flex items-center gap-1.5 transition-all cursor-pointer"
                        >
                          {copiedIndex === i ? (
                            <Check className="w-3.5 h-3.5 text-neon-green" />
                          ) : (
                            <Copy className="w-3.5 h-3.5" />
                          )}
                          {copiedIndex === i ? "Copied!" : "Copy Payload"}
                        </button>

                        <Link
                          href={exploitUrl}
                          className="px-4 py-1.5 rounded-lg bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30 text-xs font-bold flex items-center gap-1.5 transition-all shadow-md glow-green"
                        >
                          <Target className="w-3.5 h-3.5" />
                          Launch Exploit in Lab
                          <ExternalLink className="w-3 h-3" />
                        </Link>
                      </div>
                    </div>

                    {/* Remediation */}
                    <div className="p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
                      <span className="text-[10px] uppercase tracking-wider text-neon-green font-bold block mb-1">
                        Blue Team Remediation
                      </span>
                      <p className="text-xs text-cyber-300 leading-relaxed">
                        {finding.remediation}
                      </p>
                    </div>
                  </div>
                );
              })}
            </div>
          </div>
        )}
      </div>

      {/* Scan History Section */}
      {scanHistory.length > 0 && (
        <div className="glass rounded-xl p-6 border border-cyber-800">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-base font-bold text-white flex items-center gap-2">
              <Clock className="w-4 h-4 text-cyber-400" />
              Scan History ({scanHistory.length} Scans)
            </h2>
            <span className="text-xs text-cyber-500 font-mono">
              Click any scan to inspect findings
            </span>
          </div>

          <div className="space-y-2">
            {scanHistory.map((scan) => {
              const isSelected = activeScanMeta.scanId === scan.id;
              const hasFindings = scan.results.length > 0;

              return (
                <div
                  key={scan.id}
                  onClick={() => loadFromHistory(scan)}
                  className={`flex items-center justify-between p-3 rounded-xl border transition-all cursor-pointer ${
                    isSelected
                      ? "bg-neon-blue/15 border-neon-blue/60 text-white glow-blue"
                      : "bg-cyber-900/40 border-cyber-800/80 hover:border-cyber-700 hover:bg-cyber-900"
                  }`}
                >
                  <div className="flex items-center gap-3 min-w-0">
                    {hasFindings ? (
                      <AlertTriangle className="w-4 h-4 text-neon-red flex-shrink-0" />
                    ) : (
                      <CheckCircle className="w-4 h-4 text-neon-green flex-shrink-0" />
                    )}
                    <div className="min-w-0">
                      <p className="text-xs text-white font-mono truncate">
                        {scan.targetUrl}
                      </p>
                      <p className="text-[10px] text-cyber-500 font-mono">
                        {new Date(scan.createdAt).toLocaleString()}
                      </p>
                    </div>
                  </div>

                  <div className="flex items-center gap-3 flex-shrink-0">
                    <span
                      className={`text-xs font-bold font-mono ${
                        hasFindings ? "text-neon-red" : "text-neon-green"
                      }`}
                    >
                      {scan.results.length} finding{scan.results.length !== 1 ? "s" : ""}
                    </span>
                    <span className="text-xs text-neon-blue hidden sm:inline font-semibold">
                      {isSelected ? "Active" : "View"} &rarr;
                    </span>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
