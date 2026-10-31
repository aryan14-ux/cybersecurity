/**
 * SECURE version of the DOM-Based XSS Lab
 *
 * This page safely handles URL fragment (location.hash) data by using
 * React state / textContent instead of innerHTML.
 */
"use client";

import { useEffect, useState } from "react";

export default function DOMXSSSecure() {
  const [noteContent, setNoteContent] = useState<string>("");
  const [loaded, setLoaded] = useState(false);

  useEffect(() => {
    setLoaded(true);

    const updateContent = () => {
      if (typeof window !== "undefined" && window.location.hash) {
        const hash = decodeURIComponent(window.location.hash.slice(1));
        // SECURE SINK: React state / textContent prevents script execution
        setNoteContent(hash);
      } else {
        setNoteContent("");
      }
    };

    updateContent();
    window.addEventListener("hashchange", updateContent);
    return () => window.removeEventListener("hashchange", updateContent);
  }, []);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-xl p-6 mb-6 glow-green">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-low px-3 py-1 rounded-full text-xs font-semibold">
            SECURE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          📋 Secure QuickNotes App
        </h1>
        <p className="text-cyber-400 text-sm">
          Share notes via URL — Content is safely rendered as plain text (safe DOM sink)
        </p>
      </div>

      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-3">
          How to Test
        </h2>
        <p className="text-cyber-400 text-sm mb-3">
          Notice how HTML tags and scripts are safely treated as harmless text strings:
        </p>
        <div className="flex flex-wrap gap-3 mt-4">
          <button
            onClick={() => {
              window.location.hash = "Welcome to SecureNotes!";
            }}
            className="px-4 py-2 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all text-sm"
          >
            Load Sample Note
          </button>
          <button
            onClick={() => {
              window.location.hash = "<img src=x onerror=alert('XSS')>";
            }}
            className="px-4 py-2 bg-cyber-800 text-cyber-300 border border-cyber-700 rounded-lg hover:bg-cyber-750 transition-all text-sm"
          >
            Test XSS Payload
          </button>
        </div>
      </div>

      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          📝 Note Content
        </h2>
        {/* SECURE: Rendered safely as JSX text node */}
        <div
          id="dom-output"
          className="min-h-[100px] p-4 bg-cyber-900/50 rounded-lg text-cyber-300 font-mono text-sm whitespace-pre-wrap"
        >
          {loaded
            ? noteContent || "Enter a note in the URL hash to display it here..."
            : "Loading..."}
        </div>
        <div className="mt-4 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
          <p className="text-xs text-neon-green font-mono">
            ✅ Source: location.hash → Safe Sink: React JSX text rendering / element.textContent. No HTML parser is invoked!
          </p>
        </div>
      </div>
    </div>
  );
}
