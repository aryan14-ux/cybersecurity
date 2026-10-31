import { prisma } from "@/lib/db/prisma";
import { AlertTriangle, Clock, Shield } from "lucide-react";

export const dynamic = "force-dynamic";

export default async function AdminEventsPage() {
  let events: any[] = [];
  try {
    events = await prisma.securityEvent.findMany({
      orderBy: { createdAt: "desc" },
      take: 100,
      include: { user: { select: { name: true, email: true } } },
    });
  } catch (err) {
    console.warn("Failed to fetch security events from DB:", err);
  }

  const severityColors: Record<string, string> = {
    LOW: "text-neon-green",
    MEDIUM: "text-neon-yellow",
    HIGH: "text-neon-orange",
    CRITICAL: "text-neon-red",
  };

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8">
        <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
          <AlertTriangle className="w-8 h-8 text-neon-yellow" />
          Security Events
        </h1>
        <p className="text-cyber-400">
          Audit log of all platform security events
        </p>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <div className="overflow-x-auto">
          <table className="w-full text-sm">
            <thead>
              <tr className="border-b border-cyber-700 bg-cyber-900/50">
                <th className="text-left py-3 px-4 text-cyber-400 font-medium">
                  Timestamp
                </th>
                <th className="text-left py-3 px-4 text-cyber-400 font-medium">
                  Type
                </th>
                <th className="text-left py-3 px-4 text-cyber-400 font-medium">
                  Severity
                </th>
                <th className="text-left py-3 px-4 text-cyber-400 font-medium">
                  User
                </th>
                <th className="text-left py-3 px-4 text-cyber-400 font-medium">
                  Details
                </th>
                <th className="text-left py-3 px-4 text-cyber-400 font-medium">
                  IP
                </th>
              </tr>
            </thead>
            <tbody>
              {events.map((event) => (
                <tr
                  key={event.id}
                  className="border-b border-cyber-800/50 hover:bg-cyber-800/30 transition-colors"
                >
                  <td className="py-3 px-4 text-cyber-500 text-xs font-mono whitespace-nowrap">
                    {new Date(event.createdAt).toLocaleString()}
                  </td>
                  <td className="py-3 px-4">
                    <span className="text-neon-blue font-mono text-xs">
                      {event.type}
                    </span>
                  </td>
                  <td className="py-3 px-4">
                    <span
                      className={`${
                        severityColors[event.severity] || "text-cyber-400"
                      } text-xs font-semibold`}
                    >
                      {event.severity}
                    </span>
                  </td>
                  <td className="py-3 px-4 text-cyber-300 text-xs">
                    {event.user?.name || event.user?.email || "—"}
                  </td>
                  <td className="py-3 px-4 text-cyber-400 text-xs max-w-md truncate">
                    {event.details}
                  </td>
                  <td className="py-3 px-4 text-cyber-600 text-xs font-mono">
                    {event.ip || "—"}
                  </td>
                </tr>
              ))}
              {events.length === 0 && (
                <tr>
                  <td
                    colSpan={6}
                    className="py-12 text-center text-cyber-500"
                  >
                    <Shield className="w-12 h-12 mx-auto mb-3 text-cyber-700" />
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
