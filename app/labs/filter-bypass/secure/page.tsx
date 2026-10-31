/**
 * SECURE version of the Filter Bypass XSS Lab
 *
 * Rather than attempting blacklist filtering with regex (which is inherently flawed),
 * this secure version uses context-aware output encoding (React JSX auto-escaping).
 */

export default async function FilterBypassSecure({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rawInput = q || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-xl p-6 mb-6 glow-green">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-low px-3 py-1 rounded-full text-xs font-semibold">
            SECURE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          🛡️ SafeInput™ — Output Encoded Protection
        </h1>
        <p className="text-cyber-400 text-sm">
          Instead of unreliable regex blacklists, output is strictly encoded by default
        </p>
      </div>

      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Submit Feedback
        </h2>
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="q"
            defaultValue={rawInput}
            placeholder="Enter feedback or payload (e.g. <img src=x onerror=alert(1)>)..."
            className="flex-1 px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-green/50"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all"
          >
            Submit
          </button>
        </form>
      </div>

      {rawInput && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-low px-2 py-0.5 rounded-full text-xs">
              ENCODED
            </span>
            <h2 className="text-lg font-semibold text-white">
              Your Feedback (Safely Displayed)
            </h2>
          </div>
          {/* SECURE: Rendered directly as text in JSX, neutralising all HTML & JavaScript payloads */}
          <div className="p-4 bg-cyber-900/50 rounded-lg text-cyber-300 font-mono text-sm whitespace-pre-wrap">
            {rawInput}
          </div>
          <div className="mt-4 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
            <p className="text-xs text-neon-green font-mono">
              ✅ Remediation: Context-aware output encoding. Characters like &lt;, &gt;, &quot;, and &amp; are rendered as safe text entities.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
