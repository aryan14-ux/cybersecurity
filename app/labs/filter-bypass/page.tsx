/**
 * INTENTIONALLY VULNERABLE — Filter Bypass XSS Lab
 *
 * This page demonstrates why simple regex-based XSS filters are
 * insufficient. The filter removes <script> tags but can be bypassed
 * with event handlers, SVG elements, and other techniques.
 */

export default async function FilterBypassLab({
  searchParams,
}: {
  searchParams: Promise<{ q?: string }>;
}) {
  const { q } = await searchParams;
  const rawInput = q || "";

  // WEAK FILTER: Only removes <script> tags
  function weakFilter(input: string): string {
    return input
      .replace(/<script[^>]*>/gi, "")
      .replace(/<\/script>/gi, "");
  }

  const filtered = weakFilter(rawInput);

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          🛡️ SafeInput™ Protected Form
        </h1>
        <p className="text-cyber-400 text-sm">
          &quot;Enterprise-grade XSS protection&quot; — All script tags are
          blocked!
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
            placeholder="Enter your feedback..."
            className="flex-1 px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-blue/50"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 transition-all"
          >
            Submit
          </button>
        </form>
      </div>

      {rawInput && (
        <div className="glass rounded-xl p-6">
          <div className="flex items-center gap-2 mb-4">
            <span className="badge-low px-2 py-0.5 rounded-full text-xs">
              FILTERED
            </span>
            <h2 className="text-lg font-semibold text-white">
              Your Feedback
            </h2>
          </div>
          {/* VULNERABILITY: Filtered but bypassed via event handlers etc. */}
          <div
            className="p-4 bg-cyber-900/50 rounded-lg text-cyber-300"
            dangerouslySetInnerHTML={{ __html: filtered }}
          />
          <div className="mt-4 p-3 bg-neon-yellow/5 border border-neon-yellow/20 rounded-lg">
            <p className="text-xs text-neon-yellow font-mono">
              Filter applied: Removed &lt;script&gt; tags. Other HTML
              is &quot;safe&quot;... right?
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
