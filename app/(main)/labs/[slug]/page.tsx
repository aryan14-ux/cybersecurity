import { prisma } from "@/lib/db/prisma";
import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { notFound } from "next/navigation";
import { LabView } from "@/components/labs/LabView";

import { LAB_DEFINITIONS } from "@/lib/labs/definitions";

export const dynamic = "force-dynamic";

interface LabPageProps {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ mode?: string }>;
}

export default async function LabDetailPage({ params, searchParams }: LabPageProps) {
  const { slug } = await params;
  const { mode } = await searchParams;
  const session = await auth();

  let lab: any = null;
  let progress: any = null;

  try {
    lab = await prisma.lab.findUnique({
      where: { slug },
    });

    const currentUserId = session?.user?.id || (AUTH_BYPASS ? BYPASS_USER.id : null);
    if (lab && currentUserId) {
      progress = await prisma.userProgress.findUnique({
        where: {
          userId_labId: {
            userId: currentUserId,
            labId: lab.id,
          },
        },
      });
    }
  } catch (err) {
    console.warn("Failed to find lab in DB, checking definitions:", err);
  }

  if (!lab) {
    const def = LAB_DEFINITIONS.find((l) => l.slug === slug);
    if (def) {
      lab = {
        id: `lab-${def.slug}`,
        ...def,
        enabled: true,
      };
    }
  }

  if (!lab || !lab.enabled) {
    notFound();
  }

  return (
    <LabView
      lab={JSON.parse(JSON.stringify(lab))}
      progress={progress ? JSON.parse(JSON.stringify(progress)) : null}
      mode={(mode === "challenge" ? "challenge" : "learn") as "learn" | "challenge"}
      isAuthenticated={AUTH_BYPASS || !!session?.user}
    />
  );
}
