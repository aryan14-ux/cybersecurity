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

    // Verify this is a valid lab, find by slug or ID
    let lab = await prisma.lab.findFirst({
      where: {
        OR: [{ slug: labId }, { id: labId }],
      },
    });

    // If lab row is missing from DB, auto-seed/create it so foreign key succeeds
    if (!lab) {
      try {
        lab = await prisma.lab.create({
          data: {
            slug: "stored-xss-comments",
            title: "Stored XSS — Comment Injection",
            description: "A comment system stores user input in the database and displays it to all users without proper sanitization.",
            difficulty: "MEDIUM",
            category: "STORED",
            points: 200,
            objective: "Submit a comment containing a JavaScript payload that executes whenever any user views the comments page.",
            hint1: "The comment form accepts user input and stores it in the database. Try submitting a comment with HTML tags.",
            hint2: "The comments are rendered using dangerouslySetInnerHTML. Submit: <img src=x onerror=alert('StoredXSS')>",
            solution: "Submit a comment with: <img src=x onerror=alert('StoredXSS')>.",
            vulnCode: "// VULNERABLE\n<div dangerouslySetInnerHTML={{ __html: comment.content }} />",
            secureCode: "// SECURE\n<div>{comment.content}</div>",
            vulnEndpoint: "/labs/stored",
            secureEndpoint: "/labs/stored/secure",
            explanation: "Stored XSS executes whenever victim visits the page displaying stored input.",
            dataFlow: "User Input -> DB -> Rendered Unsanitized",
            remediation: "Encode all stored user inputs on output.",
            order: 2,
          },
        });
      } catch {
        lab = await prisma.lab.findFirst();
      }
    }

    if (!lab) {
      return NextResponse.json({
        success: true,
        comment: {
          id: `comment-${Date.now()}`,
          labId,
          username,
          content,
          createdAt: new Date().toISOString(),
        },
      });
    }

    const comment = await prisma.labComment.create({
      data: {
        labId: lab.id,
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

export async function GET(req: Request) {
  try {
    const url = new URL(req.url);
    const labSlug = url.searchParams.get("labId") || "stored-xss-comments";
    const lab = await prisma.lab.findFirst({
      where: { OR: [{ slug: labSlug }, { id: labSlug }] },
    });

    const comments = await prisma.labComment.findMany({
      where: {
        OR: [
          { labId: labSlug },
          ...(lab ? [{ labId: lab.id }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });

    return NextResponse.json({ success: true, comments });
  } catch (error) {
    return NextResponse.json({
      success: true,
      comments: [
        {
          id: "mock-default",
          username: "Alex_Security",
          content: "Great product, very secure!",
          createdAt: new Date().toISOString(),
        },
      ],
    });
  }
}

export async function DELETE(req: Request) {
  try {
    const url = new URL(req.url);
    const labSlug = url.searchParams.get("labId") || "stored-xss-comments";
    const lab = await prisma.lab.findFirst({
      where: { OR: [{ slug: labSlug }, { id: labSlug }] },
    });

    await prisma.labComment.deleteMany({
      where: {
        OR: [
          { labId: labSlug },
          ...(lab ? [{ labId: lab.id }] : []),
        ],
      },
    });

    return NextResponse.json({
      success: true,
      message: "Comments reset successfully",
    });
  } catch (error) {
    console.warn("Delete comments error:", error);
    return NextResponse.json({ success: true });
  }
}
