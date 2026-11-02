import { NextResponse } from "next/server";
import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";

const resetSchema = z.object({
  labSlug: z.string().min(1),
});

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!AUTH_BYPASS && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id || BYPASS_USER.id;

    const body = await req.json();
    const result = resetSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { labSlug } = result.data;

    // Reset ALL labs progress
    if (labSlug === "ALL") {
      try {
        await prisma.userProgress.deleteMany({
          where: { userId },
        });
      } catch (err) {
        console.warn("Delete all progress DB error:", err);
      }

      try {
        await prisma.labAttempt.deleteMany({
          where: { userId },
        });
      } catch (err) {
        console.warn("Delete all attempts DB error:", err);
      }

      try {
        await prisma.labComment.deleteMany({});
      } catch (err) {
        console.warn("Delete comments error:", err);
      }

      return NextResponse.json({
        success: true,
        message: "All labs progress and attempts have been reset successfully",
      });
    }

    // Find the single lab
    const lab = await prisma.lab.findFirst({
      where: { OR: [{ slug: labSlug }, { id: labSlug }] },
    });

    if (!lab) {
      // Even if lab not in DB, return success so localStorage can still be cleared
      return NextResponse.json({ success: true, message: "Lab reset (local only)" });
    }

    // Delete user progress for this lab
    try {
      await prisma.userProgress.deleteMany({
        where: { userId, labId: lab.id },
      });
    } catch {
      // Ignore if no progress exists
    }

    // Delete user attempts for this lab
    try {
      await prisma.labAttempt.deleteMany({
        where: { userId, labId: lab.id },
      });
    } catch {
      // Ignore
    }

    // For stored XSS lab, also clear comments
    if (labSlug === "stored-xss-comments") {
      try {
        await prisma.labComment.deleteMany({
          where: { labId: lab.id },
        });
      } catch {
        // Ignore
      }
    }

    return NextResponse.json({
      success: true,
      message: `Lab "${lab.title}" progress reset successfully`,
    });
  } catch (error) {
    console.error("Lab reset error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}

