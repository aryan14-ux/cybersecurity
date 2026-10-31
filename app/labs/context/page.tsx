/**
 * INTENTIONALLY VULNERABLE — Context-Based XSS Lab
 *
 * This page demonstrates XSS in an HTML attribute context where user
 * input is placed inside a value="" attribute without proper encoding.
 */

export default async function ContextXSSLab({
  searchParams,
}: {
  searchParams: Promise<{ user?: string }>;
}) {
  const { user } = await searchParams;
  const username = user || "";

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          👤 UserProfile Settings
        </h1>
        <p className="text-cyber-400 text-sm">
          Customize your profile — Enter your username to preview
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
            placeholder="Enter username..."
            className="flex-1 px-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-blue/50"
          />
          <button
            type="submit"
            className="px-6 py-3 bg-neon-blue/20 text-neon-blue border border-neon-blue/30 rounded-lg hover:bg-neon-blue/30 transition-all"
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
          {/* VULNERABILITY: Input placed in attribute context without encoding */}
          <div
            className="space-y-4"
            dangerouslySetInnerHTML={{
              __html: `
                <div style="padding: 16px; background: rgba(2,6,23,0.5); border-radius: 8px;">
                  <label style="display: block; color: #94a3b8; font-size: 14px; margin-bottom: 4px;">
                    Username
                  </label>
                  <input type="text" 
                         value="${username}" 
                         style="width: 100%; padding: 8px 12px; background: #0a0f1e; border: 1px solid #334155; border-radius: 6px; color: white;" 
                         readonly />
                  <p style="margin-top: 12px; color: #e2e8f0;">
                    Welcome, ${username}!
                  </p>
                </div>
              `,
            }}
          />
          <div className="mt-4 p-3 bg-cyber-900/50 rounded-lg">
            <p className="text-xs text-cyber-600 font-mono">
              Input placed in: HTML attribute context (value=&quot;...&quot;)
            </p>
          </div>
        </div>
      )}
    </div>
  );
}
