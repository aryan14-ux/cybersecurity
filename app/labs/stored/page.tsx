import { prisma } from "@/lib/db/prisma";
import { StoredXSSClient } from "./client";

/**
 * INTENTIONALLY VULNERABLE — Stored XSS Lab
 *
 * This page demonstrates stored XSS where user comments are saved to the
 * database and rendered without sanitization using dangerouslySetInnerHTML.
 */

export const dynamic = "force-dynamic";

export default async function StoredXSSLab() {
  let comments: Array<{ id: string; username: string; content: string; createdAt: Date }> = [];
  try {
    const lab = await prisma.lab.findFirst({
      where: { slug: "stored-xss-comments" },
    });
    comments = await prisma.labComment.findMany({
      where: {
        OR: [
          { labId: "stored-xss-comments" },
          ...(lab ? [{ labId: lab.id }] : []),
        ],
      },
      orderBy: { createdAt: "desc" },
      take: 50,
    });
  } catch (error) {
    console.warn("Could not fetch comments from DB, using fallback mock data:", error);
    comments = [
      {
        id: "mock-1",
        username: "Alex_Security",
        content: "Great product, very secure!",
        createdAt: new Date(),
      },
    ];
  }

  return (
    <div className="max-w-4xl mx-auto px-4 py-8">
      <div className="glass rounded-xl p-6 mb-6">
        <h1 className="text-2xl font-bold text-white mb-2">
          💬 ProductReview Hub
        </h1>
        <p className="text-cyber-400 text-sm">
          Community Product Reviews — Share your experience
        </p>
      </div>

      <StoredXSSClient
        comments={JSON.parse(JSON.stringify(comments))}
      />
    </div>
  );
}
