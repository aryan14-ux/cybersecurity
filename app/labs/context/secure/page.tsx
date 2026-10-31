/**
 * SECURE version of the Context-Based XSS Lab
 *
 * This page binds user input to React element properties (value={username})
 * rather than concatenating into raw HTML strings, completely preventing
 * attribute breakout attacks.
 */

export default async function ContextXSSSecure({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;
  const username = user || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-xl p-6 mb-6 glow-green">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-low px-3 py-1 rounded-full text-xs font-semibold">
            SECURE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          👤 Secure UserProfile Settings
        </h1>
        <p className="text-cyber-400 text-sm">
          Dynamic values are securely bound to properties without string concatenation
        </p>
      </div>

      <div className="glass rounded-xl p-6 mb-6">
        <h2 className="text-lg font-semibold text-white mb-4">
          Preview Profile
        </h2>
        <form method="GET" className="flex gap-3">
          <input
            type="text"
            name="user"
            defaultValue={username}
            placeholder='Try breakout payload: " onfocus="alert(1)" autofocus="'
            className="flex-1 px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-green/50"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-neon-green/20 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/30 transition-all"
          >
            Preview
          </button>
        </form>
      </div>

      {username && (
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4">
            Profile Preview
          </h2>
          {/* SECURE: Handled natively via React JSX attributes & text interpolation */}
          <div className="p-4 bg-cyber-900/50 rounded-lg border border-cyber-800 space-y-4">
            <div>
              <label className="block text-cyber-400 text-xs font-medium mb-1.5 uppercase tracking-wide">
                Username (Bound Safely as Value Prop)
              </label>
              <input
                type="text"
                value={username}
                readOnly
                className="w-full px-3 py-2 bg-cyber-950 border border-cyber-700 rounded-md text-white font-mono text-sm focus:outline-none"
              />
            </div>
            <p className="text-cyber-200 text-sm">
              Welcome, <span className="font-semibold text-white">{username}</span>!
            </p>
          </div>
          <div className="mt-4 p-3 bg-neon-green/5 border border-neon-green/20 rounded-lg">
            <p className="text-xs text-neon-green font-mono">
              ✅ Secure: React JSX property binding escapes quotes and special characters, preventing attribute breakout.
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
