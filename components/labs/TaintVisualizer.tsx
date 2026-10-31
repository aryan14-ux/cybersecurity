"use client";

import { useState } from "react";
import {
  ArrowRight,
  Shield,
  AlertTriangle,
  Code2,
  Layers,
  Sparkles,
  Terminal,
  Info,
  CheckCircle2,
  XCircle,
} from "lucide-react";

interface TaintVisualizerProps {
  category: string;
  defaultPayload?: string;
  contextType?: string;
}

export function TaintVisualizer({
  category,
  defaultPayload = "<script>alert(1)</script>",
  contextType = "HTML Body Context",
}: TaintVisualizerProps) {
  const [inputPayload, setInputPayload] = useState(defaultPayload);
  const [activePreset, setActivePreset] = useState("script");

  const presets = [
    {
      id: "script",
      label: "<script> tag",
      payload: "<script>alert(document.cookie)</script>",
    },
    {
      id: "img",
      label: "<img> onerror",
      payload: "<img src=x onerror=alert('DOM_XSS')>",
    },
    {
      id: "attribute",
      label: 'Attribute breakout (" onfocus=...)',
      payload: '" onfocus="alert(1)" autofocus="',
    },
    {
      id: "svg",
      label: "<svg> onload",
      payload: "<svg onload=alert(1)>",
    },
  ];

  // Analyze filter stage
  const filterOutput = (() => {
    if (category === "FILTER_BYPASS") {
      // Weak regex filter removes <script> tags
      return inputPayload
        .replace(/<script[^>]*>/gi, "")
        .replace(/<\/script>/gi, "");
    }
    return inputPayload;
  })();

  const isScriptFiltered =
    category === "FILTER_BYPASS" &&
    (/<script/i.test(inputPayload) && !/<script/i.test(filterOutput));

  // Analyze execution feasibility
  const isDangerousInContext = (() => {
    if (category === "REFLECTED" || category === "STORED") {
      return (
        /<script/i.test(filterOutput) ||
        /onerror|onload|onclick|onfocus/i.test(filterOutput)
      );
    }
    if (category === "FILTER_BYPASS") {
      // Bypasses if it uses event handlers or SVG even though script tags are removed
      return (
        /onerror|onload|onclick|onfocus/i.test(filterOutput) ||
        /<svg|<img|<iframe/i.test(filterOutput)
      );
    }
    if (category === "CONTEXT") {
      return /"|'|onfocus|onerror|onload/i.test(filterOutput);
    }
    if (category === "DOM") {
      return /<script|<img|<svg|onerror|onload/i.test(filterOutput);
    }
    return /<|>|"|'/.test(filterOutput);
  })();

  return (
    <div className="glass rounded-xl p-6 border border-cyber-700/80 space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 border-b border-cyber-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Layers className="w-5 h-5 text-neon-cyan" />
            <h2 className="text-lg font-bold text-white">
              Live Taint & Data-Flow Visualizer (X-Ray Mode)
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neon-cyan/20 text-neon-cyan border border-neon-cyan/30">
              Interactive
            </span>
          </div>
          <p className="text-cyber-400 text-xs mt-1">
            See in real-time how your payload travels from source, through filters, into HTML contexts, and triggers the browser execution sink.
          </p>
        </div>

        {/* Preset Selector */}
        <div className="flex flex-wrap gap-1.5">
          {presets.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setInputPayload(p.payload);
                setActivePreset(p.id);
              }}
              className={`px-2.5 py-1 text-xs rounded-md border transition-all ${
                inputPayload === p.payload
                  ? "bg-neon-cyan/20 text-neon-cyan border-neon-cyan/40"
                  : "bg-cyber-900 text-cyber-400 border-cyber-800 hover:text-white"
              }`}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>

      {/* Interactive Payload Input */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-cyber-400 mb-2">
          Test Payload Input (Edit to observe transformations)
        </label>
        <div className="relative">
          <input
            type="text"
            value={inputPayload}
            onChange={(e) => setInputPayload(e.target.value)}
            className="w-full px-4 py-3 bg-cyber-950 border border-cyber-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-neon-cyan/60"
            placeholder="Type your exploit payload..."
          />
        </div>
      </div>

      {/* 4-Stage Visual Pipeline */}
      <div className="grid grid-cols-1 md:grid-cols-4 gap-4 relative">
        {/* Stage 1: Source */}
        <div className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neon-blue">
                Stage 1: Source
              </span>
              <Terminal className="w-4 h-4 text-neon-blue" />
            </div>
            <p className="text-xs text-cyber-400 mb-2">
              User input passed via HTTP request:
            </p>
            <div className="p-2.5 bg-cyber-950 rounded-lg border border-cyber-800 font-mono text-xs text-cyber-200 break-all">
              {inputPayload || "(empty string)"}
            </div>
          </div>
          <div className="mt-3 text-[10px] text-cyber-500 font-mono">
            Origin: Untrusted User Input
          </div>
        </div>

        {/* Stage 2: Filter */}
        <div className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neon-yellow">
                Stage 2: Sanitizer
              </span>
              <Shield className="w-4 h-4 text-neon-yellow" />
            </div>
            <p className="text-xs text-cyber-400 mb-2">
              {category === "FILTER_BYPASS"
                ? "Regex: stripped <script> tags:"
                : "No server-side encoding applied:"}
            </p>
            <div className="p-2.5 bg-cyber-950 rounded-lg border border-cyber-800 font-mono text-xs break-all text-cyber-200">
              {filterOutput || "(empty string)"}
            </div>
          </div>
          <div className="mt-3">
            {isScriptFiltered ? (
              <span className="text-[10px] text-neon-yellow font-mono">
                ⚠️ &lt;script&gt; stripped, remaining HTML survives!
              </span>
            ) : (
              <span className="text-[10px] text-neon-green font-mono">
                ✓ Passed through unescaped
              </span>
            )}
          </div>
        </div>

        {/* Stage 3: Context */}
        <div className="p-4 rounded-xl bg-cyber-900/60 border border-cyber-800 flex flex-col justify-between">
          <div>
            <div className="flex items-center justify-between mb-2">
              <span className="text-[11px] font-bold uppercase tracking-wider text-neon-purple">
                Stage 3: Context
              </span>
              <Code2 className="w-4 h-4 text-neon-purple" />
            </div>
            <p className="text-xs text-cyber-400 mb-2">
              Inserted into DOM structure:
            </p>
            <div className="p-2.5 bg-cyber-950 rounded-lg border border-cyber-800 font-mono text-xs text-cyber-200 break-all">
              {category === "CONTEXT"
                ? `<input value="${filterOutput}" />`
                : category === "DOM"
                ? `output.innerHTML = "${filterOutput}"`
                : `<div>${filterOutput}</div>`}
            </div>
          </div>
          <div className="mt-3 text-[10px] text-cyber-400 font-mono">
            {category === "CONTEXT"
              ? "HTML Attribute Context"
              : category === "DOM"
              ? "Client DOM Sink"
              : "Raw HTML Body Context"}
          </div>
        </div>

        {/* Stage 4: Sink & Result */}
        <div
          className={`p-4 rounded-xl border flex flex-col justify-between ${
            isDangerousInContext
              ? "bg-neon-red/10 border-neon-red/40 glow-red"
              : "bg-neon-green/10 border-neon-green/40 glow-green"
          }`}
        >
          <div>
            <div className="flex items-center justify-between mb-2">
              <span
                className={`text-[11px] font-bold uppercase tracking-wider ${
                  isDangerousInContext ? "text-neon-red" : "text-neon-green"
                }`}
              >
                Stage 4: Browser Sink
              </span>
              {isDangerousInContext ? (
                <AlertTriangle className="w-4 h-4 text-neon-red" />
              ) : (
                <CheckCircle2 className="w-4 h-4 text-neon-green" />
              )}
            </div>
            <p className="text-xs text-cyber-400 mb-2">
              HTML Parser Interpretation:
            </p>
            <div className="p-2.5 bg-cyber-950 rounded-lg border border-cyber-800 font-mono text-xs text-white break-all">
              {isDangerousInContext ? (
                <span className="text-neon-red font-bold">
                  ⚠️ EXECUTABLE JAVASCRIPT DETECTED
                </span>
              ) : (
                <span className="text-neon-green font-bold">
                  SAFE TEXT NODE (NOT EXECUTABLE)
                </span>
              )}
            </div>
          </div>
          <div className="mt-3 text-[10px] font-mono">
            {isDangerousInContext ? (
              <span className="text-neon-red">
                Browser executes injected payload context!
              </span>
            ) : (
              <span className="text-neon-green">
                Payload rendered inert as harmless text.
              </span>
            )}
          </div>
        </div>
      </div>

      {/* Exploit Mechanics Insight */}
      <div className="p-4 rounded-xl bg-cyber-950/80 border border-cyber-800 text-xs space-y-2">
        <div className="flex items-center gap-2 text-white font-semibold">
          <Info className="w-4 h-4 text-neon-cyan" />
          Why this matters (Key Takeaway for Technical Interviews):
        </div>
        <p className="text-cyber-300 leading-relaxed">
          {category === "FILTER_BYPASS" &&
            "Blacklist filters that strip <script> tags fail because the HTML parser parses elements like <img>, <svg>, and <details> whose event handlers (onerror, onload, ontoggle) invoke JavaScript without needing a <script> tag."}
          {category === "CONTEXT" &&
            'When user input is placed inside an attribute (e.g. value="..."), an attacker does not need to introduce a new <script> tag. Closing the quotes (" onfocus="alert(1)) breaks out of the attribute and creates an active event handler.'}
          {category === "DOM" &&
            "In DOM-based XSS, the data flows entirely client-side without touching the backend server. The JavaScript engine executes innerHTML assignments directly inside the DOM tree."}
          {category === "REFLECTED" &&
            "Reflected XSS occurs when unencoded GET/POST parameters are immediately reflected back in the server HTTP response markup."}
          {category === "STORED" &&
            "Stored XSS is the most dangerous tier because malicious payloads persist in the database, detonating in the browser of every visitor who loads the page."}
        </p>
      </div>
    </div>
  );
}
