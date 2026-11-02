"use client";

import { useState, useEffect } from "react";
import Link from "next/link";
import {
  Target,
  Shield,
  Clock,
  Award,
  ChevronRight,
  Filter,
  CheckCircle2,
  AlertTriangle,
  Zap,
  Bug,
  Code,
  FileCode,
  Lock,
  ArrowRight,
  Trophy,
  Sparkles,
  Flame,
  RotateCcw,
} from "lucide-react";

interface Lab {
  id: string;
  slug: string;
  title: string;
  description: string;
  difficulty: "EASY" | "MEDIUM" | "HARD" | "EXPERT";
  category: "REFLECTED" | "STORED" | "DOM" | "FILTER_BYPASS" | "CONTEXT";
  points: number;
  objective?: string;
  vulnEndpoint?: string;
  secureEndpoint?: string;
}

interface UserProgress {
  labId: string;
  completed: boolean;
  bestScore: number;
  totalAttempts: number;
}

interface LabsClientViewProps {
  labs: Lab[];
  initialProgress: UserProgress[];
}

const difficultyColors = {
  EASY: "text-neon-green border-neon-green/30 bg-neon-green/10",
  MEDIUM: "text-neon-yellow border-neon-yellow/30 bg-neon-yellow/10",
  HARD: "text-neon-orange border-neon-orange/30 bg-neon-orange/10",
  EXPERT: "text-neon-red border-neon-red/30 bg-neon-red/10",
};

const categoryIcons: Record<string, React.ElementType> = {
  REFLECTED: Zap,
  STORED: Bug,
  DOM: Code,
  FILTER_BYPASS: AlertTriangle,
  CONTEXT: FileCode,
};

const categoryColors: Record<string, string> = {
  REFLECTED: "text-neon-cyan",
  STORED: "text-neon-magenta",
  DOM: "text-neon-green",
  FILTER_BYPASS: "text-neon-orange",
  CONTEXT: "text-neon-yellow",
};

export function LabsClientView({ labs, initialProgress }: LabsClientViewProps) {
  // Map of labId or labSlug -> boolean completed
  const [solvedMap, setSolvedMap] = useState<Record<string, boolean>>({});
  const [resettingAll, setResettingAll] = useState(false);

  const handleResetAllLabs = async () => {
    if (!confirm("Are you sure you want to reset all lab progress and start fresh?")) return;
    setResettingAll(true);
    try {
      for (const lab of labs) {
        localStorage.removeItem(`xss_solved_${lab.slug}`);
      }
      localStorage.removeItem("xss_last_exploit");

      await fetch("/api/labs/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labSlug: "ALL" }),
      });

      setSolvedMap({});
      window.location.reload();
    } catch (err) {
      console.warn("Reset all error:", err);
      setSolvedMap({});
    } finally {
      setResettingAll(false);
    }
  };

  const handleResetSpecificLab = async (slug: string) => {
    try {
      localStorage.removeItem(`xss_solved_${slug}`);
      await fetch("/api/labs/reset", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ labSlug: slug }),
      });

      setSolvedMap((prev) => {
        const next = { ...prev };
        delete next[slug];
        const lab = labs.find((l) => l.slug === slug);
        if (lab) delete next[lab.id];
        return next;
      });
    } catch (err) {
      console.warn("Reset lab error:", err);
    }
  };

  useEffect(() => {
    const map: Record<string, boolean> = {};

    // 1. Seed from database progress
    for (const p of initialProgress) {
      if (p.completed) {
        map[p.labId] = true;
        // Also map by slug if matched
        const matched = labs.find((l) => l.id === p.labId);
        if (matched) {
          map[matched.slug] = true;
        }
      }
    }

    // 2. Hydrate from browser localStorage
    for (const lab of labs) {
      try {
        const localSolved = localStorage.getItem(`xss_solved_${lab.slug}`);
        if (localSolved === "true") {
          map[lab.id] = true;
          map[lab.slug] = true;

          // If not in DB progress yet, silently sync to API
          const inDb = initialProgress.some(
            (p) => (p.labId === lab.id || p.labId === lab.slug) && p.completed
          );
          if (!inDb) {
            fetch("/api/labs/complete", {
              method: "POST",
              headers: { "Content-Type": "application/json" },
              body: JSON.stringify({
                labId: lab.slug,
                mode: "CHALLENGE",
                hintsUsed: 0,
              }),
            }).catch(() => {});
          }
        }
      } catch {
        // ignore localStorage errors
      }
    }

    setSolvedMap(map);
  }, [labs, initialProgress]);

  // Compute overall progress stats
  const totalLabs = labs.length;
  const solvedCount = labs.filter(
    (l) => solvedMap[l.id] || solvedMap[l.slug]
  ).length;
  const progressPercent = totalLabs > 0 ? Math.round((solvedCount / totalLabs) * 100) : 0;
  const totalPoints = labs.reduce((acc, l) => acc + (l.points || 100), 0);
  const earnedPoints = labs
    .filter((l) => solvedMap[l.id] || solvedMap[l.slug])
    .reduce((acc, l) => acc + (l.points || 100), 0);

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8 text-cyber-100">
      {/* Header & Hero */}
      <div className="mb-8">
        <div className="flex flex-col md:flex-row md:items-center justify-between gap-4">
          <div>
            <div className="flex items-center gap-2 mb-2">
              <span className="px-3 py-1 rounded-full text-xs font-bold uppercase tracking-wider bg-neon-green/20 text-neon-green border border-neon-green/40">
                Next-Gen Security Academy
              </span>
              <span className="text-xs font-mono text-cyber-400">
                Dual Red + Blue Team
              </span>
            </div>
            <h1 className="text-3xl md:text-4xl font-extrabold text-white mb-2 flex items-center gap-3">
              <Target className="w-9 h-9 text-neon-green" />
              Advanced XSS Security Labs
            </h1>
            <p className="text-cyber-300 max-w-3xl leading-relaxed text-sm sm:text-base">
              Hands-on Cross-Site Scripting training engineered for modern full-stack web applications.
              Exploit vulnerabilities with real-time in-browser verification, then switch to Blue Team Defense Mode to write and test verified remediation patches.
            </p>
          </div>
        </div>

        {/* Global Academy Solved Progress Banner */}
        <div className="mt-6 p-5 glass rounded-xl border border-cyber-700 bg-cyber-900/60 shadow-xl glow-green">
          <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-3 mb-3">
            <div className="flex items-center gap-3">
              <div className="w-10 h-10 rounded-xl bg-neon-green/15 border border-neon-green/40 flex items-center justify-center text-neon-green shadow-md glow-green flex-shrink-0">
                <Trophy className="w-5 h-5 text-neon-green" />
              </div>
              <div>
                <div className="flex items-center gap-2">
                  <span className="text-sm font-extrabold text-white">Academy Completion Progress</span>
                  {progressPercent === 100 && (
                    <span className="px-2 py-0.5 rounded bg-neon-green/20 text-neon-green text-[10px] font-extrabold uppercase border border-neon-green/40">
                      All Labs Completed! 🎉
                    </span>
                  )}
                </div>
                <span className="text-xs text-cyber-400 font-mono">
                  {solvedCount} of {totalLabs} Labs Solved • {earnedPoints} of {totalPoints} XP Earned
                </span>
              </div>
            </div>

            <div className="flex items-center gap-3">
              {solvedCount > 0 && (
                <button
                  onClick={handleResetAllLabs}
                  disabled={resettingAll}
                  className="px-3 py-1.5 rounded-lg text-xs font-bold border border-neon-yellow/40 bg-neon-yellow/10 text-neon-yellow hover:bg-neon-yellow/20 transition-all flex items-center gap-1.5 shadow"
                  title="Reset all solved labs and start fresh"
                >
                  <RotateCcw className="w-3.5 h-3.5" />
                  <span>{resettingAll ? "Resetting..." : "Reset All Labs"}</span>
                </button>
              )}
              <div className="text-right">
                <span className="text-2xl font-black text-neon-green font-mono">
                  {progressPercent}%
                </span>
                <span className="text-[11px] text-cyber-500 uppercase block font-semibold">
                  Completed
                </span>
              </div>
            </div>
          </div>

          {/* Progress Bar Track */}
          <div className="w-full h-2.5 bg-cyber-950 rounded-full overflow-hidden border border-cyber-800">
            <div
              className="h-full bg-gradient-to-r from-neon-green via-neon-cyan to-neon-blue rounded-full transition-all duration-700 glow-green"
              style={{ width: `${progressPercent}%` }}
            />
          </div>
        </div>

        {/* Feature Highlights Grid */}
        <div className="grid grid-cols-2 md:grid-cols-4 gap-3 mt-6">
          <div className="p-3 bg-cyber-900/60 border border-cyber-800 rounded-xl">
            <span className="text-xs font-bold text-neon-green block">⚡ Exploit Oracle</span>
            <span className="text-[11px] text-cyber-400">Automatic payload detection &amp; live solved verification</span>
          </div>
          <div className="p-3 bg-cyber-900/60 border border-cyber-800 rounded-xl">
            <span className="text-xs font-bold text-neon-cyan block">🔬 Taint Visualizer</span>
            <span className="text-[11px] text-cyber-400">Character-level AST and context execution tracing</span>
          </div>
          <div className="p-3 bg-cyber-900/60 border border-cyber-800 rounded-xl">
            <span className="text-xs font-bold text-neon-yellow block">🛠️ Payload Studio</span>
            <span className="text-[11px] text-cyber-400">In-app multi-encoding &amp; WAF filter bypass analyzer</span>
          </div>
          <div className="p-3 bg-cyber-900/60 border border-cyber-800 rounded-xl">
            <span className="text-xs font-bold text-neon-purple block">🛡️ Blue Team Mode</span>
            <span className="text-[11px] text-cyber-400">Write defensive patches and run automated regression suites</span>
          </div>
        </div>
      </div>

      {/* Lab Categories */}
      {["REFLECTED", "STORED", "DOM", "FILTER_BYPASS", "CONTEXT"].map(
        (category) => {
          const categoryLabs = labs.filter((l) => l.category === category);
          if (categoryLabs.length === 0) return null;

          const Icon = categoryIcons[category] || Target;
          const colorClass = categoryColors[category] || "text-neon-green";

          const categorySolved = categoryLabs.filter(
            (l) => solvedMap[l.id] || solvedMap[l.slug]
          ).length;
          const isCategoryComplete = categorySolved === categoryLabs.length;

          return (
            <div key={category} className="mb-10">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-white flex items-center gap-2">
                  <Icon className={`w-6 h-6 ${colorClass}`} />
                  <span>{category.replace("_", " ")} XSS</span>
                </h2>

                <div className="flex items-center gap-2 font-mono text-xs">
                  <span
                    className={`px-2.5 py-0.5 rounded-full font-bold ${
                      isCategoryComplete
                        ? "bg-neon-green/15 text-neon-green border border-neon-green/40"
                        : "bg-cyber-900 text-cyber-400 border border-cyber-800"
                    }`}
                  >
                    {categorySolved}/{categoryLabs.length} Solved {isCategoryComplete ? "✓" : ""}
                  </span>
                </div>
              </div>

              <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-6">
                {categoryLabs.map((lab) => {
                  const isCompleted = Boolean(
                    solvedMap[lab.id] || solvedMap[lab.slug]
                  );

                  return (
                    <div
                      key={lab.id}
                      className={`glass rounded-xl p-6 transition-all group relative flex flex-col justify-between ${
                        isCompleted
                          ? "border-neon-green/50 bg-neon-green/[0.04] shadow-xl glow-green hover:border-neon-green"
                          : "border-cyber-800 hover:border-cyber-700 glass-hover"
                      }`}
                    >
                      {/* Top Right Solved Indicator */}
                      <div className="absolute top-4 right-4 z-10">
                        {isCompleted ? (
                          <div className="flex items-center gap-1.5">
                            <div
                              className="flex items-center gap-1.5 px-2.5 py-1 rounded-full bg-neon-green/20 border border-neon-green text-neon-green text-xs font-black tracking-wider shadow-lg glow-green animate-in fade-in zoom-in duration-300"
                              title="You have successfully solved this lab!"
                            >
                              <CheckCircle2 className="w-4 h-4 text-neon-green stroke-[3]" />
                              <span>SOLVED</span>
                            </div>
                            <button
                              onClick={(e) => {
                                e.preventDefault();
                                e.stopPropagation();
                                handleResetSpecificLab(lab.slug);
                              }}
                              className="px-2 py-1 rounded-full bg-cyber-900/90 hover:bg-neon-yellow/20 text-cyber-400 hover:text-neon-yellow border border-cyber-700 text-[10px] font-mono transition-colors flex items-center gap-1"
                              title="Reset this lab to unsolved"
                            >
                              <RotateCcw className="w-3 h-3" />
                              <span>Reset</span>
                            </button>
                          </div>
                        ) : (
                          <div className="flex items-center gap-1 px-2 py-0.5 rounded-full bg-cyber-900/80 border border-cyber-700 text-cyber-400 text-[10px] font-mono">
                            <span className="w-1.5 h-1.5 rounded-full bg-neon-red animate-pulse" />
                            <span>UNSOLVED</span>
                          </div>
                        )}
                      </div>

                      <div>
                        {/* Title & Category Icon */}
                        <div className="flex items-start gap-3 mb-4 pr-24">
                          <Icon
                            className={`w-7 h-7 ${colorClass} group-hover:scale-110 transition-transform flex-shrink-0 mt-0.5`}
                          />
                          <div>
                            <h3 className="text-base font-bold text-white leading-snug group-hover:text-neon-green transition-colors">
                              {lab.title}
                            </h3>
                            <div className="flex items-center gap-2 mt-1.5">
                              <span
                                className={`${
                                  difficultyColors[lab.difficulty] || difficultyColors.MEDIUM
                                } px-2 py-0.5 rounded-full text-[10px] font-extrabold uppercase`}
                              >
                                {lab.difficulty}
                              </span>
                              <span className="text-cyber-400 text-xs font-mono">
                                {lab.points} pts
                              </span>
                            </div>
                          </div>
                        </div>

                        <p className="text-cyber-400 text-xs sm:text-sm mb-4 line-clamp-2 leading-relaxed">
                          {lab.description}
                        </p>
                      </div>

                      {/* Action buttons */}
                      <div className="flex gap-2 pt-2 border-t border-cyber-800/60">
                        <Link
                          href={`/labs/${lab.slug}?mode=learn`}
                          className="flex-1 flex items-center justify-center gap-1.5 px-3 py-2 bg-cyber-900 hover:bg-cyber-800 text-cyber-300 hover:text-white border border-cyber-700 rounded-lg text-xs font-semibold transition-all"
                        >
                          <Shield className="w-3.5 h-3.5 text-neon-blue" />
                          Intel &amp; Patch
                        </Link>
                        <Link
                          href={`/labs/${lab.slug}?mode=challenge`}
                          className={`flex-1 flex items-center justify-center gap-1.5 px-3 py-2 rounded-lg text-xs font-bold transition-all ${
                            isCompleted
                              ? "bg-neon-green/15 text-neon-green border border-neon-green/40 hover:bg-neon-green/25"
                              : "bg-gradient-to-r from-neon-green/20 to-neon-green/30 text-neon-green border border-neon-green/50 hover:bg-neon-green/35 shadow-sm glow-green"
                          }`}
                        >
                          {isCompleted ? (
                            <>
                              <CheckCircle2 className="w-3.5 h-3.5 text-neon-green" />
                              <span>Solved • Replay</span>
                            </>
                          ) : (
                            <>
                              <Target className="w-3.5 h-3.5" />
                              <span>Solve Lab</span>
                            </>
                          )}
                        </Link>
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>
          );
        }
      )}

      {labs.length === 0 && (
        <div className="glass rounded-xl p-12 text-center">
          <Lock className="w-16 h-16 text-cyber-600 mx-auto mb-4" />
          <h3 className="text-xl font-semibold text-white mb-2">
            No Labs Available
          </h3>
          <p className="text-cyber-400 mb-4">
            Labs haven&apos;t been seeded yet. Run the database seed to populate labs.
          </p>
          <code className="text-neon-green font-mono text-sm bg-cyber-900 px-4 py-2 rounded">
            npx prisma db seed
          </code>
        </div>
      )}
    </div>
  );
}
