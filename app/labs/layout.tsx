import { PortSwiggerLabHeader } from "@/components/labs/PortSwiggerLabHeader";
import { ExploitOracleHook } from "@/components/labs/ExploitOracleHook";
import { LabExploitObserver } from "@/components/labs/LabExploitObserver";
import { Suspense } from "react";

const EARLY_ORACLE_SCRIPT = `
(function() {
  if (typeof window === 'undefined') return;
  if (window.__EARLY_ORACLE_INITIALIZED__) return;
  window.__EARLY_ORACLE_INITIALIZED__ = true;

  var originalAlert = window.alert;
  var originalConfirm = window.confirm;
  var originalPrompt = window.prompt;

  function handleExploit(type, msg) {
    var pathname = window.location.pathname;
    var slug = "reflected-xss-search";
    if (pathname.indexOf("/labs/stored") !== -1) slug = "stored-xss-comments";
    else if (pathname.indexOf("/labs/dom") !== -1) slug = "dom-xss-client";
    else if (pathname.indexOf("/labs/filter-bypass") !== -1) slug = "filter-bypass-xss";
    else if (pathname.indexOf("/labs/context") !== -1) slug = "context-xss-attribute";

    var detail = {
      type: type,
      labSlug: slug,
      payload: String(msg || "XSS"),
      timestamp: Date.now()
    };

    window.__XSS_LAST_EXPLOIT__ = detail;
    try {
      localStorage.setItem("xss_last_exploit", JSON.stringify(detail));
      localStorage.setItem("xss_solved_" + slug, "true");
      sessionStorage.setItem("xss_just_solved_" + slug, JSON.stringify(detail));
    } catch(e) {}

    window.dispatchEvent(new CustomEvent("xss-exploit-success", { detail: detail }));
  }

  window.alert = function(msg) {
    handleExploit("alert", msg);
    setTimeout(function() {
      try { originalAlert.call(window, msg); } catch(e) {}
    }, 50);
  };
  window.confirm = function(msg) {
    handleExploit("confirm", msg);
    setTimeout(function() {
      try { originalConfirm.call(window, msg); } catch(e) {}
    }, 50);
    return true;
  };
  window.prompt = function(msg, def) {
    handleExploit("prompt", msg);
    setTimeout(function() {
      try { originalPrompt.call(window, msg, def); } catch(e) {}
    }, 50);
    return "";
  };
})();
`;

export default function LabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cyber-950 text-cyber-100">
      {/* Early Exploit Synchronous Interceptor: Runs before child HTML / images parse */}
      <script
        id="early-exploit-oracle"
        dangerouslySetInnerHTML={{ __html: EARLY_ORACLE_SCRIPT }}
      />

      {/* PortSwigger-Style Animated Lab Header & Differentiator Suite */}
      <Suspense fallback={<div className="h-14 bg-cyber-950 border-b border-cyber-800" />}>
        <PortSwiggerLabHeader />
      </Suspense>

      {/* Main Lab Target Viewport */}
      <main className="pt-16 pb-12">
        {children}
      </main>

      {/* Ensures <script> tags inside vulnerable lab targets execute */}
      <LabExploitObserver />

      {/* Active Exploit Telemetry Oracle */}
      <ExploitOracleHook />
    </div>
  );
}
