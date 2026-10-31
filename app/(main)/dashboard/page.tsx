import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getUserLevel } from "@/lib/scoring";
import {
  Target,
  Trophy,
  Zap,
  TrendingUp,
  CheckCircle,
  Clock,
  ArrowRight,
  BarChart3,
  Shield,
  Star,
} from "lucide-react";
import Link from "next/link";

export const dynamic = "force-dynamic";

export default async function DashboardPage() {
  const session = await auth();
  if (!AUTH_BYPASS && !session?.user) redirect("/login");

  const userId = session?.user?.id || BYPASS_USER.id;

  // Fetch user stats
  let totalLabs = 5;
  let progress: any[] = [];
  let recentAttempts: any[] = [];
  let score = 0;
  let nextLab: any = null;

  try {
    const [dbTotalLabs, dbProgress, dbRecentAttempts, totalScore] = await Promise.all([
      prisma.lab.count({ where: { enabled: true } }),
      prisma.userProgress.findMany({ where: { userId } }),
      prisma.labAttempt.findMany({
        where: { userId },
        orderBy: { createdAt: "desc" },
        take: 5,
        include: { lab: true },
      }),
      prisma.userProgress.aggregate({
        where: { userId },
        _sum: { bestScore: true },
      }),
    ]);
    totalLabs = dbTotalLabs;
    progress = dbProgress;
    recentAttempts = dbRecentAttempts;
    score = totalScore._sum.bestScore || 0;

    const completedLabIds = progress
      .filter((p) => p.completed)
      .map((p) => p.labId);
    nextLab = await prisma.lab.findFirst({
      where: {
        enabled: true,
        id: { notIn: completedLabIds.length > 0 ? completedLabIds : ["none"] },
      },
      orderBy: { order: "asc" },
    });
  } catch (err) {
    console.warn("Failed to load dashboard data from database:", err);
  }

  const completedLabs = progress.filter((p) => p.completed).length;
  const totalAttempts = progress.reduce((sum, p) => sum + p.totalAttempts, 0);
  const successRate =
    totalAttempts > 0
      ? Math.round((completedLabs / Math.max(totalAttempts, 1)) * 100)
      : 0;
  const level = getUserLevel(score);

  const statCards = [
    {
      label: "Total Labs",
      value: totalLabs,
      icon: Target,
      color: "neon-blue",
    },
    {
      label: "Completed",
      value: completedLabs,
      icon: CheckCircle,
      color: "neon-green",
    },
    {
      label: "Current Level",
      value: level.level,
      icon: Star,
      color: "neon-purple",
      subtitle: level.title,
    },
    {
      label: "Total Score",
      value: score,
      icon: Trophy,
      color: "neon-yellow",
    },
  ];

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      {/* Welcome */}
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2">
          Welcome back,{" "}
          <span className="gradient-text">{session?.user?.name || BYPASS_USER.name}</span>
        </h1>
        <p className="text-cyber-400">
          Continue your XSS training journey. Current rank:{" "}
          <span className="text-neon-green font-semibold">{level.title}</span>
        </p>
      </div>

      {/* Stats Grid */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div
            key={i}
            className="glass rounded-xl p-6 glass-hover transition-all"
          >
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`w-8 h-8 text-${stat.color}`} />
              <span className="text-xs text-cyber-500 uppercase tracking-wide">
                {stat.label}
              </span>
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            {stat.subtitle && (
              <div className={`text-sm text-${stat.color} mt-1`}>
                {stat.subtitle}
              </div>
            )}
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-3 gap-8">
        {/* Progress & Next Lab */}
        <div className="lg:col-span-2 space-y-6">
          {/* Progress Bar */}
          <div className="glass rounded-xl p-6">
            <div className="flex items-center justify-between mb-4">
              <h2 className="text-lg font-semibold text-white flex items-center gap-2">
                <BarChart3 className="w-5 h-5 text-neon-green" />
                Learning Progress
              </h2>
              <span className="text-sm text-cyber-400">
                {completedLabs} / {totalLabs} labs
              </span>
            </div>
            <div className="w-full h-3 bg-cyber-800 rounded-full overflow-hidden">
              <div
                className="h-full bg-gradient-to-r from-neon-green to-neon-blue rounded-full transition-all duration-1000"
                style={{
                  width: `${
                    totalLabs > 0 ? (completedLabs / totalLabs) * 100 : 0
                  }%`,
                }}
              />
            </div>
            <div className="flex justify-between mt-2">
              <span className="text-xs text-cyber-500">
                Success Rate: {successRate}%
              </span>
              <span className="text-xs text-cyber-500">
                Next Level: {level.nextLevelScore} pts
              </span>
            </div>
          </div>

          {/* Recommended Next Lab */}
          {nextLab && (
            <div className="glass rounded-xl p-6 glow-green">
              <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
                <Zap className="w-5 h-5 text-neon-yellow" />
                Recommended Next Lab
              </h2>
              <div className="flex items-center justify-between">
                <div>
                  <h3 className="text-white font-medium mb-1">
                    {nextLab.title}
                  </h3>
                  <div className="flex items-center gap-3 text-sm">
                    <span
                      className={`badge-${
                        nextLab.difficulty === "EASY"
                          ? "low"
                          : nextLab.difficulty === "MEDIUM"
                          ? "medium"
                          : nextLab.difficulty === "HARD"
                          ? "high"
                          : "critical"
                      } px-2 py-0.5 rounded-full text-xs`}
                    >
                      {nextLab.difficulty}
                    </span>
                    <span className="text-cyber-400">
                      {nextLab.points} points
                    </span>
                  </div>
                </div>
                <Link
                  href={`/labs/${nextLab.slug}`}
                  className="flex items-center gap-2 px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg hover:bg-neon-green/20 transition-all"
                >
                  Start Lab
                  <ArrowRight className="w-4 h-4" />
                </Link>
              </div>
            </div>
          )}

          {/* Recent Activity */}
          <div className="glass rounded-xl p-6">
            <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
              <Clock className="w-5 h-5 text-neon-blue" />
              Recent Activity
            </h2>
            {recentAttempts.length > 0 ? (
              <div className="space-y-3">
                {recentAttempts.map((attempt) => (
                  <div
                    key={attempt.id}
                    className="flex items-center justify-between p-3 bg-cyber-900/50 rounded-lg"
                  >
                    <div className="flex items-center gap-3">
                      {attempt.success ? (
                        <CheckCircle className="w-5 h-5 text-neon-green" />
                      ) : (
                        <Target className="w-5 h-5 text-neon-red" />
                      )}
                      <div>
                        <p className="text-sm text-white">
                          {attempt.lab.title}
                        </p>
                        <p className="text-xs text-cyber-500">
                          {attempt.mode} mode •{" "}
                          {new Date(attempt.createdAt).toLocaleDateString()}
                        </p>
                      </div>
                    </div>
                    <div className="text-right">
                      <span
                        className={`text-sm font-semibold ${
                          attempt.success ? "text-neon-green" : "text-neon-red"
                        }`}
                      >
                        {attempt.success ? `+${attempt.score}` : "Failed"}
                      </span>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-cyber-500 text-center py-8">
                No activity yet. Start your first lab!
              </p>
            )}
          </div>
        </div>

        {/* Sidebar */}
        <div className="space-y-6">
          {/* Level Card */}
          <div className="glass rounded-xl p-6 glow-purple">
            <div className="text-center">
              <Shield className="w-12 h-12 text-neon-purple mx-auto mb-3" />
              <h3 className="text-2xl font-bold text-white">
                Level {level.level}
              </h3>
              <p className="text-neon-purple font-semibold mb-4">
                {level.title}
              </p>
              <div className="w-full h-2 bg-cyber-800 rounded-full overflow-hidden mb-2">
                <div
                  className="h-full bg-gradient-to-r from-neon-purple to-neon-blue rounded-full"
                  style={{
                    width: `${Math.min(
                      (score / level.nextLevelScore) * 100,
                      100
                    )}%`,
                  }}
                />
              </div>
              <p className="text-xs text-cyber-500">
                {score} / {level.nextLevelScore} XP to next level
              </p>
            </div>
          </div>

          {/* Quick Actions */}
          <div className="glass rounded-xl p-6">
            <h3 className="text-lg font-semibold text-white mb-4">
              Quick Actions
            </h3>
            <div className="space-y-2">
              <Link
                href="/labs"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-800 transition-all text-cyber-300 hover:text-white"
              >
                <Target className="w-5 h-5 text-neon-green" />
                Browse All Labs
              </Link>
              <Link
                href="/scanner"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-800 transition-all text-cyber-300 hover:text-white"
              >
                <TrendingUp className="w-5 h-5 text-neon-blue" />
                Run Scanner
              </Link>
              <Link
                href="/learn"
                className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-800 transition-all text-cyber-300 hover:text-white"
              >
                <Zap className="w-5 h-5 text-neon-yellow" />
                Learning Resources
              </Link>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}
