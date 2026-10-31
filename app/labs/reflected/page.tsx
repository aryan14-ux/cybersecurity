import Link from "next/link";
import { Search, Flame, Shield, ArrowRight } from "lucide-react";

/**
 * INTENTIONALLY VULNERABLE — Reflected XSS Target App (CyberPulse Search)
 *
 * Designed in our application's unified Dark Cyber aesthetic.
 * The search parameter 'q' is reflected into the HTML without sanitization or encoding.
 */

export const dynamic = "force-dynamic";

export default async function ReflectedXSSLab({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const query = q || "";

  return (
    <div className="max-w-5xl mx-auto px-4 py-8 text-cyber-100 font-sans">
      {/* Target App Hero Branding */}
      <div className="text-center mb-10 pt-4">
        <div className="inline-flex items-center gap-2 px-3 py-1 rounded-full bg-neon-green/10 border border-neon-green/30 text-neon-green text-xs font-mono mb-4">
          <Flame className="w-3.5 h-3.5" />
          CYBERPULSE INTELLIGENCE ENGINE
        </div>

        <h1 className="text-4xl sm:text-5xl font-extrabold text-white tracking-tight mb-3">
          Cyber<span className="text-neon-green">Pulse</span> Feed
        </h1>
        <p className="text-cyber-400 text-sm max-w-lg mx-auto leading-relaxed">
          Search latest vulnerability disclosures, threat intelligence reports, and security updates.
        </p>

        {/* Search Bar */}
        <div className="max-w-2xl mx-auto mt-8">
          <form method="GET" action="/labs/reflected" className="flex gap-2">
            <div className="relative flex-1">
              <Search className="w-5 h-5 text-cyber-500 absolute left-4 top-1/2 -translate-y-1/2" />
              <input
                type="text"
                name="q"
                defaultValue={query}
                placeholder="Search CVEs, threat actors, zero-days..."
                className="w-full pl-12 pr-4 py-3 bg-cyber-900 border border-cyber-700 rounded-xl text-white placeholder-cyber-500 focus:outline-none focus:border-neon-green/60 focus:ring-1 focus:ring-neon-green/60 text-sm shadow-lg transition-all"
              />
            </div>
            <button
              type="submit"
              className="px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/40 hover:bg-neon-green/30 font-bold rounded-xl text-sm transition-all shadow-lg glow-green flex-shrink-0"
            >
              Search
            </button>
          </form>
        </div>
      </div>

      {/* VULNERABILITY: Reflected unencoded query string */}
      {query && (
        <div className="max-w-3xl mx-auto mb-10 glass rounded-xl p-6 border border-cyber-700 shadow-xl">
          <div
            className="text-lg text-white font-semibold mb-2"
            dangerouslySetInnerHTML={{
              __html: `<h2>0 search results for &apos;${query}&apos;</h2>`,
            }}
          />
          <p className="text-cyber-400 text-xs mt-2">
            No intelligence advisories matched your query parameter. Try searching for &quot;CVE-2024&quot; or &quot;Zero-Day&quot;.
          </p>
        </div>
      )}

      {/* Realistic Security Articles Feed */}
      <div className="max-w-3xl mx-auto space-y-4">
        <h3 className="text-xs font-bold uppercase tracking-wider text-cyber-500 mb-2">
          Latest Intelligence Reports
        </h3>

        {/* Card 1 */}
        <div className="glass rounded-xl p-5 border border-cyber-800 hover:border-cyber-700 transition-all">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-neon-red/10 text-neon-red border border-neon-red/30 uppercase">
              Critical Advisory
            </span>
            <span className="text-xs text-cyber-500 font-mono">2 hours ago</span>
          </div>
          <h4 className="text-base font-bold text-white mb-1.5 hover:text-neon-green transition-colors cursor-pointer">
            Unauthenticated Remote Code Execution in Legacy Middleware Stacks
          </h4>
          <p className="text-xs text-cyber-400 leading-relaxed">
            Security researchers have demonstrated an exploit chain leveraging unescaped user inputs in session serialization pipelines. Patch deployment recommended immediately.
          </p>
        </div>

        {/* Card 2 */}
        <div className="glass rounded-xl p-5 border border-cyber-800 hover:border-cyber-700 transition-all">
          <div className="flex items-center justify-between gap-2 mb-2">
            <span className="text-[10px] font-bold font-mono px-2 py-0.5 rounded bg-neon-cyan/10 text-neon-cyan border border-neon-cyan/30 uppercase">
              Threat Report
            </span>
            <span className="text-xs text-cyber-500 font-mono">Yesterday</span>
          </div>
          <h4 className="text-base font-bold text-white mb-1.5 hover:text-neon-cyan transition-colors cursor-pointer">
            Defending Modern Single Page Applications Against DOM Injections
          </h4>
          <p className="text-xs text-cyber-400 leading-relaxed">
            Analysis of 50 enterprise Next.js applications reveals common pitfalls in URL fragment parsing and dynamic innerHTML sinks.
          </p>
        </div>
      </div>
    </div>
  );
}
