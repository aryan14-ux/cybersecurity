import { prisma } from "@/lib/db/prisma";
import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { LAB_DEFINITIONS } from "@/lib/labs/definitions";
import { LabsClientView } from "./LabsClientView";

export const dynamic = "force-dynamic";

export default async function LabsPage() {
  const session = await auth();
  let labs: any[] = [];
  let userProgress: any[] = [];

  try {
    labs = await prisma.lab.findMany({
      where: { enabled: true },
      orderBy: { order: "asc" },
    });

    const currentUserId = session?.user?.id || (AUTH_BYPASS ? BYPASS_USER.id : null);
    if (currentUserId) {
      userProgress = await prisma.userProgress.findMany({
        where: { userId: currentUserId },
      });
    }
  } catch (err) {
    console.warn("Failed to fetch labs from DB, using fallback definitions:", err);
    labs = LAB_DEFINITIONS.map((def, idx) => ({
      id: `lab-${def.slug}`,
      ...def,
      enabled: true,
      order: idx + 1,
    }));
  }

  if (labs.length === 0) {
    labs = LAB_DEFINITIONS.map((def, idx) => ({
      id: `lab-${def.slug}`,
      ...def,
      enabled: true,
      order: idx + 1,
    }));
  }

  const serializableProgress = userProgress.map((p) => ({
    labId: p.labId,
    completed: p.completed,
    bestScore: p.bestScore,
    totalAttempts: p.totalAttempts,
  }));

  const serializableLabs = labs.map((l) => ({
    id: l.id,
    slug: l.slug,
    title: l.title,
    description: l.description,
    difficulty: l.difficulty,
    category: l.category,
    points: l.points,
    objective: l.objective,
    vulnEndpoint: l.vulnEndpoint,
    secureEndpoint: l.secureEndpoint,
  }));

  return (
    <LabsClientView
      labs={serializableLabs}
      initialProgress={serializableProgress}
    />
  );
}
