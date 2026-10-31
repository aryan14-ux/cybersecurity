import { prisma } from "@/lib/db/prisma";
import { StoredXSSClient } from "../client";

/**
 * SECURE version of the Stored XSS Lab
 *
 * This page retrieves user comments from the database and renders them
 * safely using React JSX text encoding, preventing persistent XSS.
 */

export const dynamic = "force-dynamic";

export default async function StoredXSSSecure() {
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
      <div className="glass rounded-xl p-6 mb-6 glow-green">
        <div className="flex items-center gap-2 mb-2">
          <span className="badge-low px-3 py-1 rounded-full text-xs font-semibold">
            SECURE
          </span>
        </div>
        <h1 className="text-2xl font-bold text-white mb-2">
          💬 Secure ProductReview Hub
        </h1>
        <p className="text-cyber-400 text-sm">
          Community Product Reviews — This is the secure version: all stored content is safely encoded on render
        </p>
      </div>

      <StoredXSSClient
        comments={JSON.parse(JSON.stringify(comments))}
        isSecure={true}
      />
    </div>
  );
}
