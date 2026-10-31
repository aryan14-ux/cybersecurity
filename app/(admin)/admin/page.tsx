import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import {
  Settings,
  Users,
  Target,
  Shield,
  Search,
  BarChart3,
  AlertTriangle,
  CheckCircle,
  Clock,
  Activity,
} from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminDashboard() {
  let totalUsers = 0;
  let totalLabs = 5;
  let totalAttempts = 0;
  let totalScans = 0;
  let recentEvents: any[] = [];
  let completionStats: any[] = [];

  try {
    const [
      dbUsers,
      dbLabs,
      dbAttempts,
      dbScans,
      dbEvents,
      dbCompletion,
    ] = await Promise.all([
      prisma.user.count(),
      prisma.lab.count(),
      prisma.labAttempt.count(),
      prisma.scan.count(),
      prisma.securityEvent.findMany({
        orderBy: { createdAt: "desc" },
        take: 10,
        include: { user: { select: { name: true, email: true } } },
      }),
      prisma.labAttempt.groupBy({
        by: ["success"],
        _count: true,
      }),
    ]);
    totalUsers = dbUsers;
    totalLabs = dbLabs;
    totalAttempts = dbAttempts;
    totalScans = dbScans;
    recentEvents = dbEvents;
    completionStats = dbCompletion;
  } catch (err) {
    console.warn("Failed to load admin stats from DB:", err);
  }

  const successCount =
    completionStats.find((s) => s.success)?._count || 0;
  const failCount =
    completionStats.find((s) => !s.success)?._count || 0;

  const statCards = [
    { label: "Total Users", value: totalUsers, icon: Users, color: "neon-blue" },
    { label: "Active Labs", value: totalLabs, icon: Target, color: "neon-green" },
    { label: "Total Attempts", value: totalAttempts, icon: BarChart3, color: "neon-purple" },
    { label: "Scans Run", value: totalScans, icon: Search, color: "neon-yellow" },
  ];

  const severityColors: Record<string, string> = {
    LOW: "text-neon-green",
    MEDIUM: "text-neon-yellow",
    HIGH: "text-neon-orange",
    CRITICAL: "text-neon-red",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Settings className="w-8 h-8 text-neon-purple" />
            Admin Dashboard
          </h1>
          <p className="text-cyber-400">
            Platform administration and security monitoring
          </p>
        </div>
        <div className="flex gap-3">
          <Link
            href="/admin/labs"
            className="px-4 py-2 bg-neon-green/10 text-neon-green border border-neon-green/30 rounded-lg text-sm hover:bg-neon-green/20 transition-all"
          >
            Manage Labs
          </Link>
          <Link
            href="/admin/users"
            className="px-4 py-2 bg-neon-blue/10 text-neon-blue border border-neon-blue/30 rounded-lg text-sm hover:bg-neon-blue/20 transition-all"
          >
            Manage Users
          </Link>
          <Link
            href="/admin/events"
            className="px-4 py-2 bg-neon-yellow/10 text-neon-yellow border border-neon-yellow/30 rounded-lg text-sm hover:bg-neon-yellow/20 transition-all"
          >
            Security Events
          </Link>
        </div>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 lg:grid-cols-4 gap-4 mb-8">
        {statCards.map((stat, i) => (
          <div key={i} className="glass rounded-xl p-6">
            <div className="flex items-start justify-between mb-4">
              <stat.icon className={`w-8 h-8 text-${stat.color}`} />
            </div>
            <div className="text-3xl font-bold text-white">{stat.value}</div>
            <div className="text-sm text-cyber-400 mt-1">{stat.label}</div>
          </div>
        ))}
      </div>

      <div className="grid lg:grid-cols-2 gap-8">
        {/* Completion Stats */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <BarChart3 className="w-5 h-5 text-neon-green" />
            Completion Statistics
          </h2>
          <div className="flex items-center gap-8">
            <div className="text-center">
              <CheckCircle className="w-8 h-8 text-neon-green mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-green">
                {successCount}
              </div>
              <div className="text-xs text-cyber-400">Successful</div>
            </div>
            <div className="text-center">
              <AlertTriangle className="w-8 h-8 text-neon-red mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-red">{failCount}</div>
              <div className="text-xs text-cyber-400">Failed</div>
            </div>
            <div className="text-center">
              <Activity className="w-8 h-8 text-neon-blue mx-auto mb-2" />
              <div className="text-2xl font-bold text-neon-blue">
                {totalAttempts > 0
                  ? Math.round((successCount / totalAttempts) * 100)
                  : 0}
                %
              </div>
              <div className="text-xs text-cyber-400">Success Rate</div>
            </div>
          </div>
        </div>

        {/* Quick Links */}
        <div className="glass rounded-xl p-6">
          <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
            <Shield className="w-5 h-5 text-neon-purple" />
            Admin Actions
          </h2>
          <div className="space-y-2">
            <Link
              href="/admin/labs"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-800 transition-all text-cyber-300 hover:text-white"
            >
              <Target className="w-5 h-5 text-neon-green" />
              Add / Edit Labs
            </Link>
            <Link
              href="/admin/users"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-800 transition-all text-cyber-300 hover:text-white"
            >
              <Users className="w-5 h-5 text-neon-blue" />
              User Management
            </Link>
            <Link
              href="/admin/events"
              className="flex items-center gap-3 p-3 rounded-lg hover:bg-cyber-800 transition-all text-cyber-300 hover:text-white"
            >
              <Clock className="w-5 h-5 text-neon-yellow" />
              View All Security Events
            </Link>
          </div>
        </div>
      </div>

      {/* Recent Security Events */}
      <div className="glass rounded-xl p-6 mt-8">
        <h2 className="text-lg font-semibold text-white mb-4 flex items-center gap-2">
          <AlertTriangle className="w-5 h-5 text-neon-yellow" />
          Recent Security Events
        </h2>
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-700">
                <th className="text-left py-3 px-3 text-cyber-400 font-medium">
                  Time
                </th>
                <th className="text-left py-3 px-3 text-cyber-400 font-medium">
                  Type
                </th>
                <th className="text-left py-3 px-3 text-cyber-400 font-medium">
                  Severity
                </th>
                <th className="text-left py-3 px-3 text-cyber-400 font-medium">
                  User
                </th>
                <th className="text-left py-3 px-3 text-cyber-400 font-medium">
                  Details
                </th>
              </tr>
            </thead>
            <tbody>
              {recentEvents.map((event) => (
                <tr key={event.id} className="border-b border-cyber-800/50">
                  <td className="py-3 px-3 text-cyber-500 text-xs font-mono">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-3">
                    <span className="text-neon-blue font-mono text-xs">
                      {event.type}
                    </span>
                  </td>
                  <td className="py-3 px-3">
                    <span
                      className={`${
                        severityColors[event.severity] || "text-cyber-400"
                      } text-xs font-semibold`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 px-3 text-cyber-300 text-xs">
                    {event.user?.name || event.user?.email || "System"}
                  </td>
                  <td className="py-3 px-3 text-cyber-400 text-xs max-w-xs truncate">
                    {event.details}
                  </td>
                </tr>
              ))}
              {recentEvents.length === 0 && (
                <tr>
                  <td colSpan={5} className="py-8 text-center text-cyber-500">
                    No security events recorded yet
                  </td>
                </tr>
              )}
            </tbody>
          </table>
        </div>
      </div>
    </div>
  );
}
