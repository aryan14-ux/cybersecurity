/**
 * INTENTIONALLY VULNERABLE — DOM-Based XSS Lab
 *
 * This page demonstrates DOM-based XSS where client-side JavaScript
 * reads from location.hash (source) and writes to innerHTML (sink).
 */
"use client";

import { useEffect, useState } from "react";
import { AlertTriangle, Terminal, Zap, Shield, Play, Copy, Check } from "lucide-react";

export default function DOMXSSLab() {
  const [loaded, setLoaded] = useState(false);
  const [customHash, setCustomHash] = useState("<img src=x onerror=alert(1)>");
  const [copied, setCopied] = useState(false);

  useEffect(() => {
    setLoaded(true);

    // VULNERABILITY: DOM-based XSS
    // Source: location.hash
    // Sink: innerHTML
    const updateContent = () => {
      const rawHash = window.location.hash ? window.location.hash.slice(1) : "";
      const hash = decodeURIComponent(rawHash);
      const output = document.getElementById("dom-output");
      if (output) {
        if (hash) {
          // DANGEROUS SINK: assigning directly to innerHTML invokes HTML parser & triggers event handlers
          output.innerHTML = hash;
        } else {
          output.innerHTML = '<span class="text-cyber-600 italic">Enter a note in the URL hash above or test a payload below...</span>';
        }
      }
    };

    updateContent();
    window.addEventListener("hashchange", updateContent);
    return () => window.removeEventListener("hashchange", updateContent);
  }, []);

  const triggerPayload = (payload: string) => {
    window.location.hash = payload;
    // Explicit call to ensure immediate DOM update
    const output = document.getElementById("dom-output");
    if (output) {
      output.innerHTML = payload;
    }
  };

  const handleCopy = (text: string) => {
    navigator.clipboard.writeText(text);
    setCopied(true);
    setTimeout(() => setCopied(false), 2000);
  };

  return (
    <div className="max-w-4xl mx-auto px-4 py-8 text-cyber-100">
      {/* App Header Card */}
      <div className="glass rounded-xl p-6 mb-6 border border-cyber-800 shadow-xl">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-cyan/10 border border-neon-cyan/30 text-neon-cyan text-xs font-mono mb-3">
          <Terminal className="w-3.5 h-3.5" />
          CLIENT-SIDE SINK DEMONSTRATION
        </div>
        <h1 className="text-3xl font-extrabold text-white mb-2 flex items-center gap-2">
          📋 QuickNotes App
        </h1>
        <p className="text-cyber-400 text-sm leading-relaxed">
          Share client-side notes via URL. Content is dynamically extracted from the URL fragment (hash)
          and rendered into the webpage DOM.
        </p>
      </div>

      {/* How to Solve & Interactive Hash Controls */}
      <div className="glass rounded-xl p-6 mb-6 border border-cyber-700 shadow-xl glow-blue">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center gap-2">
          <Zap className="w-5 h-5 text-neon-yellow" />
          How to Solve This Lab
        </h2>
        <p className="text-cyber-300 text-xs sm:text-sm mb-4 leading-relaxed">
          This application reads user input from the URL fragment (<code className="font-mono text-neon-cyan">location.hash</code>)
          and writes it directly into the DOM using <code className="font-mono text-neon-red">element.innerHTML</code> without sanitization.
        </p>

        {/* Note on HTML5 innerHTML execution */}
        <div className="p-3 bg-neon-yellow/10 border border-neon-yellow/30 rounded-xl mb-4 text-xs text-cyber-200 space-y-1">
          <div className="font-bold text-neon-yellow flex items-center gap-1.5">
            <AlertTriangle className="w-4 h-4" />
            Important HTML5 Execution Rule:
          </div>
          <p className="leading-relaxed">
            The HTML5 specification states that <code className="font-mono text-white">&lt;script&gt;</code> tags
            inserted via <code className="font-mono text-white">innerHTML</code> are <strong>not executed</strong>.
            To exploit this DOM sink, you must use an HTML element with an inline event handler such as:
          </p>
          <div className="mt-2 flex items-center gap-2">
            <code className="bg-cyber-950 px-3 py-1 rounded font-mono text-neon-green text-xs border border-cyber-800">
              &lt;img src=x onerror=alert(1)&gt;
            </code>
            <button
              type="button"
              onClick={() => handleCopy("<img src=x onerror=alert(1)>")}
              className="px-2.5 py-1 bg-cyber-900 border border-cyber-700 hover:border-cyber-600 rounded text-[11px] font-semibold text-cyber-300 flex items-center gap-1 cursor-pointer"
            >
              {copied ? <Check className="w-3 h-3 text-neon-green" /> : <Copy className="w-3 h-3" />}
              {copied ? "Copied" : "Copy"}
            </button>
          </div>
        </div>

        {/* Interactive Hash Trigger */}
        <div className="space-y-3 pt-2">
          <label className="block text-xs font-bold uppercase tracking-wider text-cyber-400">
            Method A: Interactive Payload Trigger (1-Click)
          </label>
          <div className="flex flex-col sm:flex-row gap-2">
            <input
              type="text"
              value={customHash}
              onChange={(e) => setCustomHash(e.target.value)}
              placeholder="<img src=x onerror=alert(1)>"
              className="flex-1 px-3.5 py-2.5 bg-cyber-900 border border-cyber-700 rounded-xl text-white placeholder-cyber-600 font-mono text-xs focus:outline-none focus:border-neon-cyan focus:ring-1 focus:ring-neon-cyan"
            />
            <button
              type="button"
              onClick={() => triggerPayload(customHash)}
              className="px-5 py-2.5 bg-gradient-to-r from-neon-green/20 to-neon-green/30 text-neon-green border border-neon-green/50 hover:bg-neon-green/35 rounded-xl text-xs font-bold flex items-center justify-center gap-1.5 transition-all shadow-md glow-green cursor-pointer flex-shrink-0"
            >
              <Play className="w-3.5 h-3.5 fill-current" />
              Inject Hash &amp; Solve Lab
            </button>
          </div>

          <div className="flex flex-wrap items-center gap-2 pt-1">
            <span className="text-[11px] text-cyber-500 font-semibold uppercase">Presets:</span>
            <button
              type="button"
              onClick={() => triggerPayload("<img src=x onerror=alert(1)>")}
              className="px-3 py-1 bg-neon-red/10 border border-neon-red/30 hover:bg-neon-red/20 text-neon-red rounded-lg text-xs font-mono font-bold cursor-pointer transition-all"
            >
              🎯 &lt;img onerror=alert(1)&gt;
            </button>
            <button
              type="button"
              onClick={() => triggerPayload("<svg onload=alert(1)>")}
              className="px-3 py-1 bg-neon-cyan/10 border border-neon-cyan/30 hover:bg-neon-cyan/20 text-neon-cyan rounded-lg text-xs font-mono font-bold cursor-pointer transition-all"
            >
              🎯 &lt;svg onload=alert(1)&gt;
            </button>
            <button
              type="button"
              onClick={() => triggerPayload("Hello World")}
              className="px-3 py-1 bg-cyber-900 border border-cyber-700 text-cyber-400 hover:text-white rounded-lg text-xs font-mono cursor-pointer transition-all"
            >
              Sample Text Note
            </button>
          </div>
        </div>

        {/* Address Bar instruction */}
        <div className="mt-5 pt-4 border-t border-cyber-800/80">
          <label className="block text-xs font-bold uppercase tracking-wider text-cyber-400 mb-1.5">
            Method B: Address Bar Execution
          </label>
          <p className="text-xs text-cyber-400 leading-relaxed mb-2">
            Alternatively, edit your browser URL bar at the top, append the payload after the hash, and press <strong>Enter</strong>:
          </p>
          <code className="text-neon-cyan text-xs font-mono bg-cyber-950 px-3 py-1.5 rounded-lg border border-cyber-800 block truncate">
            http://localhost:3000/labs/dom#&lt;img src=x onerror=alert(1)&gt;
          </code>
        </div>
      </div>

      {/* VULNERABLE SINK: Content rendered via innerHTML from hash */}
      <div className="glass rounded-xl p-6 border border-cyber-800 shadow-xl">
        <h2 className="text-lg font-bold text-white mb-2 flex items-center justify-between">
          <span>📝 Note Content (Active DOM Sink)</span>
          <span className="text-[10px] font-mono text-neon-red bg-neon-red/10 border border-neon-red/30 px-2 py-0.5 rounded">
            UNSANITIZED INNERHTML SINK
          </span>
        </h2>
        <div
          id="dom-output"
          className="min-h-[110px] p-4 bg-cyber-950/80 rounded-xl text-cyber-200 border border-cyber-800 font-mono text-sm break-all"
        >
          {loaded
            ? "Enter a note in the URL hash to display it here..."
            : "Loading..."}
        </div>
        <div className="mt-4 p-3 bg-cyber-900/60 rounded-xl border border-cyber-800/80">
          <p className="text-xs text-cyber-400 font-mono">
            <strong>Data Flow:</strong> <span className="text-neon-yellow">Source</span>: <code className="text-cyber-300">window.location.hash</code> &rarr; <span className="text-neon-red">Sink</span>: <code className="text-cyber-300">element.innerHTML = hash</code>
          </p>
        </div>
      </div>
    </div>
  );
}
