import { NextResponse } from "next/server";
import { prisma } from "@/lib/db/prisma";
import { z } from "zod";
import { rateLimit } from "@/lib/security/rate-limit";

const commentSchema = z.object({
  labId: z.string().min(1),
  username: z.string().min(1).max(200),
  content: z.string().min(1).max(5000),
});

// This endpoint is intentionally "insecure" for the stored XSS lab.
// It stores user input without sanitization to demonstrate stored XSS.
// The comments are stored in an isolated LabComment table.

export async function POST(req: Request) {
  try {
    const ip = req.headers.get("x-forwarded-for") || "unknown";
    const { success } = rateLimit(`comments:${ip}`, 20, 60000);
    if (!success) {
      return NextResponse.json(
        { error: "Too many requests" },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = commentSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { labId, username, content } = result.data;

    // Verify this is a valid lab
    const lab = await prisma.lab.findFirst({
      where: { slug: labId },
    });

    // Allow comments even if lab doesn't exist in DB yet (for initial testing)
    const comment = await prisma.labComment.create({
      data: {
        labId: lab?.id || labId,
        username, // Intentionally not sanitized
        content,  // Intentionally not sanitized
      },
    });

    return NextResponse.json({ success: true, comment });
  } catch (error) {
    console.error("Comment error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
