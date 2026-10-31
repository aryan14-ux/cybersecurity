import { prisma } from "@/lib/db/prisma";
import { Users, Shield, User } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminUsersPage() {
  let users: any[] = [];
  try {
    users = await prisma.user.findMany({
      orderBy: { createdAt: "desc" },
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
        createdAt: true,
        _count: { select: { attempts: true, progress: true, scans: true } },
      },
    });
  } catch (err) {
    console.warn("Failed to load users from DB:", err);
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <Users className="w-8 h-8 text-neon-blue" />
          User Management
        </h1>
        <p className="text-cyber-400">View registered users and their activity</p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyber-700 bg-cyber-900/50">
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">User</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Email</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Role</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Attempts</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Labs Done</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Scans</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Joined</th>
            </tr>
          </thead>
          <tbody>
            {users.map((user) => (
              <tr key={user.id} className="border-b border-cyber-800/50 hover:bg-cyber-800/30 transition-colors">
                <td className="py-3 px-4">
                  <div className="flex items-center gap-2">
                    <div className="w-7 h-7 rounded-full bg-neon-green/10 border border-neon-green/20 flex items-center justify-center">
                      <span className="text-neon-green text-xs font-bold">
                        {user.name?.[0]?.toUpperCase() || "U"}
                      </span>
                    </div>
                    <span className="text-white">{user.name || "Anonymous"}</span>
                  </div>
                </td>
                <td className="py-3 px-4 text-cyber-400 font-mono text-xs">{user.email}</td>
                <td className="py-3 px-4">
                  <span className={`px-2 py-0.5 rounded-full text-xs font-semibold ${user.role === "ADMIN" ? "badge-critical" : "badge-low"}`}>
                    {user.role}
                  </span>
                </td>
                <td className="py-3 px-4 text-cyber-300">{user._count.attempts}</td>
                <td className="py-3 px-4 text-neon-green">{user._count.progress}</td>
                <td className="py-3 px-4 text-cyber-300">{user._count.scans}</td>
                <td className="py-3 px-4 text-cyber-500 text-xs">
                  {new Date(user.createdAt).toLocaleDateString()}
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}
