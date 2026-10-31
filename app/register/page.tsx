"use client";

import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { Shield, Mail, Lock, User, AlertCircle, Loader2, Check } from "lucide-react";

export default function RegisterPage() {
  const router = useRouter();
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const passwordChecks = [
    { label: "At least 8 characters", met: password.length >= 8 },
    { label: "Uppercase letter", met: /[A-Z]/.test(password) },
    { label: "Lowercase letter", met: /[a-z]/.test(password) },
    { label: "Number", met: /[0-9]/.test(password) },
  ];

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    try {
      const res = await fetch("/api/auth/register", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ name, email, password }),
      });

      const data = await res.json();

      if (!res.ok) {
        setError(data.error || "Registration failed");
        return;
      }

      router.push("/login?registered=true");
    } catch {
      setError("An error occurred. Please try again.");
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-cyber-950 cyber-grid flex items-center justify-center px-4 py-12">
      <div className="w-full max-w-md">
        <div className="text-center mb-8">
          <Link href="/" className="inline-flex items-center gap-2 mb-6">
            <Shield className="w-10 h-10 text-neon-green" />
            <span className="text-2xl font-bold gradient-text">
              XSS Detection Lab
            </span>
          </Link>
          <h1 className="text-3xl font-bold text-white mb-2">
            Create Account
          </h1>
          <p className="text-cyber-400">
            Join the training platform and start learning
          </p>
        </div>

        <div className="glass rounded-2xl p-8 glow-green">
          <form onSubmit={handleSubmit} className="space-y-5">
            {error && (
              <div className="flex items-center gap-2 p-3 rounded-lg bg-neon-red/10 border border-neon-red/30 text-neon-red text-sm">
                <AlertCircle className="w-4 h-4 flex-shrink-0" />
                {error}
              </div>
            )}

            <div>
              <label className="block text-sm font-medium text-cyber-300 mb-2">
                Name
              </label>
              <div className="relative">
                <User className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-500" />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  placeholder="Your name"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-300 mb-2">
                Email Address
              </label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-500" />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  placeholder="hacker@example.com"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 transition-all"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-cyber-300 mb-2">
                Password
              </label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 -translate-y-1/2 w-5 h-5 text-cyber-500" />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  placeholder="••••••••"
                  required
                  className="w-full pl-11 pr-4 py-3 bg-cyber-900 border border-cyber-700 rounded-lg text-white placeholder-cyber-600 focus:outline-none focus:border-neon-green/50 focus:ring-1 focus:ring-neon-green/20 transition-all"
                />
              </div>
              <div className="mt-3 space-y-1">
                {passwordChecks.map((check, i) => (
                  <div
                    key={i}
                    className={`flex items-center gap-2 text-xs ${
                      check.met ? "text-neon-green" : "text-cyber-500"
                    }`}
                  >
                    <Check className="w-3 h-3" />
                    {check.label}
                  </div>
                ))}
              </div>
            </div>

            <button
              type="submit"
              disabled={loading || !passwordChecks.every((c) => c.met)}
              className="w-full py-3 bg-gradient-to-r from-neon-green/20 to-neon-blue/20 text-neon-green border border-neon-green/40 rounded-lg font-semibold hover:from-neon-green/30 hover:to-neon-blue/30 transition-all disabled:opacity-50 flex items-center justify-center gap-2"
            >
              {loading ? (
                <Loader2 className="w-5 h-5 animate-spin" />
              ) : (
                "Create Account"
              )}
            </button>
          </form>

          <div className="mt-6 text-center">
            <p className="text-cyber-400 text-sm">
              Already have an account?{" "}
              <Link href="/login" className="text-neon-green hover:underline">
                Sign in
              </Link>
            </p>
          </div>
        </div>
      </div>
    </div>
  );
}
