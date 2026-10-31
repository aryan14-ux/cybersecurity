import { prisma } from "@/lib/db/prisma";
import Link from "next/link";
import { Target, Plus, CheckCircle, XCircle } from "lucide-react";

import { LAB_DEFINITIONS } from "@/lib/labs/definitions";

export const dynamic = "force-dynamic";

export default async function AdminLabsPage() {
  let labs: any[] = [];
  try {
    labs = await prisma.lab.findMany({
      orderBy: { order: "asc" },
      include: {
        _count: { select: { attempts: true, progress: true } },
      },
    });
  } catch (err) {
    console.warn("Failed to load labs from DB, using fallback definitions:", err);
    labs = LAB_DEFINITIONS.map((def, idx) => ({
      id: `lab-${def.slug}`,
      ...def,
      enabled: true,
      order: idx + 1,
      _count: { attempts: 0, progress: 0 },
    }));
  }

  return (
    <div className="max-w-7xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
      <div className="mb-8 flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-white mb-2 flex items-center gap-3">
            <Target className="w-8 h-8 text-neon-green" />
            Manage Labs
          </h1>
          <p className="text-cyber-400">Add, edit, and manage lab challenges</p>
        </div>
      </div>

      <div className="glass rounded-xl overflow-hidden">
        <table className="w-full text-sm">
          <thead>
            <tr className="border-b border-cyber-700 bg-cyber-900/50">
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Order</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Title</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Category</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Difficulty</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Points</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Attempts</th>
              <th className="text-left py-3 px-4 text-cyber-400 font-medium">Status</th>
            </tr>
          </thead>
          <tbody>
            {labs.map((lab) => (
              <tr key={lab.id} className="border-b border-cyber-800/50 hover:bg-cyber-800/30 transition-colors">
                <td className="py-3 px-4 text-cyber-500">{lab.order}</td>
                <td className="py-3 px-4 text-white font-medium">{lab.title}</td>
                <td className="py-3 px-4">
                  <span className="text-neon-blue text-xs font-mono">
                    {lab.category}
                  </span>
                </td>
                <td className="py-3 px-4">
                  <span className={`badge-${lab.difficulty === "EASY" ? "low" : lab.difficulty === "MEDIUM" ? "medium" : lab.difficulty === "HARD" ? "high" : "critical"} px-2 py-0.5 rounded-full text-xs`}>
                    {lab.difficulty}
                  </span>
                </td>
                <td className="py-3 px-4 text-neon-green font-semibold">{lab.points}</td>
                <td className="py-3 px-4 text-cyber-400">{lab._count.attempts}</td>
                <td className="py-3 px-4">
                  {lab.enabled ? (
                    <CheckCircle className="w-4 h-4 text-neon-green" />
                  ) : (
                    <XCircle className="w-4 h-4 text-neon-red" />
                  )}
                </td>
              </tr>
            ))}
            {labs.length === 0 && (
              <tr>
                <td colSpan={7} className="py-8 text-center text-cyber-500">
                  No labs found. Run the database seed to add labs.
                </td>
              </tr>
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
}
