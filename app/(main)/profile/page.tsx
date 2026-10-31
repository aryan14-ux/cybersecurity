import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { redirect } from "next/navigation";
import { getUserLevel } from "@/lib/scoring";
import {
  User,
  Trophy,
  Target,
  CheckCircle,
  Star,
  Shield,
  Clock,
  BarChart3,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function ProfilePage() {
  const session = await auth();
  if (!AUTH_BYPASS && !session?.user) redirect("/login");

  const userId = session?.user?.id || BYPASS_USER.id;

  let user: any = null;
  let progress: any[] = [];
  let attempts = 0;
  let score = 0;

  try {
    const [dbUser, dbProgress, dbAttempts, totalScore] = await Promise.all([
      prisma.user.findUnique({
        where: { id: userId },
        select: { name: true, email: true, role: true, createdAt: true },
      }),
      prisma.userProgress.findMany({
        where: { userId },
        include: { lab: true },
        orderBy: { updatedAt: "desc" },
      }),
      prisma.labAttempt.count({ where: { userId } }),
      prisma.userProgress.aggregate({
        where: { userId },
        _sum: { bestScore: true },
      }),
    ]);
    user = dbUser;
    progress = dbProgress;
    attempts = dbAttempts;
    score = totalScore._sum.bestScore || 0;
  } catch (err) {
    console.warn("Failed to load profile data from DB:", err);
    user = {
      name: session?.user?.name || BYPASS_USER.name,
      email: session?.user?.email || BYPASS_USER.email,
      role: (session?.user as any)?.role || BYPASS_USER.role,
      createdAt: new Date(),
    };
  }

  if (!user) {
    user = {
      name: session?.user?.name || BYPASS_USER.name,
      email: session?.user?.email || BYPASS_USER.email,
      role: (session?.user as any)?.role || BYPASS_USER.role,
      createdAt: new Date(),
    };
  }

  const level = getUserLevel(score);
  const completedLabs = progress.filter((p) => p.completed);

  return (
    <div className="max-w-5xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <User className="w-8 h-8 text-neon-green" />
          Profile
        </h1>
      </div>

      {/* Profile Card */}
      <div className="glass rounded-xl p-6 mb-8 glow-green">
        <div className="flex flex-col md:flex-row items-center gap-6">
          <div className="w-20 h-20 rounded-full bg-gradient-to-br from-neon-green/20 to-neon-blue/20 border-2 border-neon-green/30 flex items-center justify-center">
            <span className="text-3xl font-bold text-neon-green">
              {user.name?.[0]?.toUpperCase() || "U"}
            </span>
          </div>
          <div className="text-center md:text-left">
            <h2 className="text-2xl font-bold text-white">
              {user.name || "Anonymous"}
            </h2>
            <p className="text-cyber-400">{user.email}</p>
            <div className="flex items-center gap-3 mt-2">
              <span className="badge-low px-3 py-1 rounded-full text-xs font-semibold">
                {user.role}
              </span>
              <span className="text-neon-purple text-sm font-semibold">
                Level {level.level} • {level.title}
              </span>
            </div>
          </div>
          <div className="md:ml-auto text-center">
            <div className="text-4xl font-bold text-neon-green">{score}</div>
            <div className="text-sm text-cyber-400">Total Points</div>
          </div>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4 mb-8">
        {[
          { label: "Level", value: level.level, icon: Star, color: "neon-purple" },
          { label: "Completed", value: completedLabs.length, icon: CheckCircle, color: "neon-green" },
          { label: "Attempts", value: attempts, icon: Target, color: "neon-blue" },
          { label: "Score", value: score, icon: Trophy, color: "neon-yellow" },
        ].map((s, i) => (
          <div key={i} className="glass rounded-xl p-4 text-center">
            <s.icon className={`w-6 h-6 text-${s.color} mx-auto mb-2`} />
            <div className="text-2xl font-bold text-white">{s.value}</div>
            <div className="text-xs text-cyber-400">{s.label}</div>
          </div>
        ))}
      </div>

      {/* Completed Labs */}
      <div className="glass rounded-xl p-6">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <BarChart3 className="w-5 h-5 text-neon-green" />
          Lab Progress
        </h2>
        {progress.length > 0 ? (
          <div className="space-y-3">
            {progress.map((p) => (
              <div
                key={p.id}
                className="flex items-center justify-between p-3 bg-cyber-900/50 rounded-lg"
              >
                <div className="flex items-center gap-3">
                  {p.completed ? (
                    <CheckCircle className="w-5 h-5 text-neon-green" />
                  ) : (
                    <Clock className="w-5 h-5 text-cyber-500" />
                  )}
                  <div>
                    <p className="text-sm text-white">{p.lab.title}</p>
                    <p className="text-xs text-cyber-500">
                      {p.totalAttempts} attempts • {p.hintsUsed} hints used
                    </p>
                  </div>
                </div>
                <div className="text-right">
                  <span className="text-neon-green font-semibold text-sm">
                    {p.bestScore} pts
                  </span>
                </div>
              </div>
            ))}
          </div>
        ) : (
          <div className="text-center py-8">
            <Shield className="w-12 h-12 text-cyber-600 mx-auto mb-3" />
            <p className="text-cyber-500">
              No labs attempted yet. Start your training!
            </p>
          </div>
        )}
      </div>
    </div>
  );
}
