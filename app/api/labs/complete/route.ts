import { NextResponse } from "next/server";
import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { calculateScore, getLearnModeScore } from "@/lib/scoring";
import { rateLimit } from "@/lib/security/rate-limit";
import { z } from "zod";

const completeSchema = z.object({
  labId: z.string().min(1),
  mode: z.enum(["LEARN", "CHALLENGE"]),
  hintsUsed: z.number().int().min(0).max(3).default(0),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!AUTH_BYPASS && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id || BYPASS_USER.id;
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`complete:${userId}`, 30, 60000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = completeSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { labId, mode, hintsUsed } = result.data;

    // Verify lab exists by either CUID id or slug
    const lab = await prisma.lab.findFirst({
      where: {
        OR: [{ id: labId }, { slug: labId }],
      },
    });
    if (!lab) {
      return NextResponse.json({ error: "Lab not found" }, { status: 404 });
    }

    const realLabId = lab.id;

    // Calculate score
    const score =
      mode === "LEARN"
        ? getLearnModeScore(lab.difficulty)
        : calculateScore(lab.difficulty, hintsUsed, hintsUsed >= 3);

    // Create attempt record
    await prisma.labAttempt.create({
      data: {
        userId,
        labId: realLabId,
        mode,
        success: true,
        hintsUsed,
        score,
      },
    });

    // Update or create progress
    const existingProgress = await prisma.userProgress.findUnique({
      where: { userId_labId: { userId, labId: realLabId } },
    });

    if (existingProgress) {
      await prisma.userProgress.update({
        where: { userId_labId: { userId, labId: realLabId } },
        data: {
          completed: true,
          bestScore: Math.max(existingProgress.bestScore, score),
          totalAttempts: existingProgress.totalAttempts + 1,
          hintsUsed: Math.min(existingProgress.hintsUsed, hintsUsed),
          completedAt: existingProgress.completedAt || new Date(),
        },
      });
    } else {
      await prisma.userProgress.create({
        data: {
          userId,
          labId: realLabId,
          completed: true,
          bestScore: score,
          totalAttempts: 1,
          hintsUsed,
          completedAt: new Date(),
        },
      });
    }

    // Log security event
    await prisma.securityEvent.create({
      data: {
        type: "LAB_COMPLETED",
        severity: "LOW",
        details: `Lab "${lab.title}" completed in ${mode} mode with score ${score}`,
        userId,
        ip,
      },
    });

    return NextResponse.json({ success: true, score });
  } catch (error) {
    console.error("Lab complete error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
