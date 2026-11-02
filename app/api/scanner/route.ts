import { NextResponse } from "next/server";
import { auth, AUTH_BYPASS, BYPASS_USER } from "@/lib/auth/auth";
import { prisma } from "@/lib/db/prisma";
import { scanEndpoint, isAllowedTarget, isLabEndpoint } from "@/lib/scanner/engine";
import { scanRequestSchema } from "@/lib/security/validation";
import { rateLimit } from "@/lib/security/rate-limit";

export async function POST(req: Request) {
  try {
    const session = await auth();
    if (!AUTH_BYPASS && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id || BYPASS_USER.id;
    const ip = req.headers.get("x-forwarded-for") || "unknown";

    // Rate limit scanner - generous limit in dev
    const limit = process.env.NODE_ENV === "production" 
      ? parseInt(process.env.SCANNER_RATE_LIMIT_PER_HOUR || "30", 10) 
      : 100;
    const { success: rateLimitOk } = rateLimit(
      `scanner:${userId}`,
      limit,
      3600000
    );
    if (!rateLimitOk) {
      return NextResponse.json(
        {
          error:
            "Scanner rate limit exceeded. Please wait a few minutes before scanning again.",
        },
        { status: 429 }
      );
    }

    const body = await req.json();
    const result = scanRequestSchema.safeParse(body);
    if (!result.success) {
      return NextResponse.json(
        { error: result.error.issues[0]?.message || "Validation failed" },
        { status: 400 }
      );
    }

    const { targetUrl, labId } = result.data;

    // Get base URL from request
    const url = new URL(req.url);
    const baseUrl = `${url.protocol}//${url.host}`;

    const fullUrl = targetUrl.startsWith("http")
      ? targetUrl
      : `${baseUrl}${targetUrl}`;

    // Validate target
    if (!isAllowedTarget(fullUrl, baseUrl)) {
      return NextResponse.json(
        {
          error:
            "Target is not authorized. Scanner can only scan lab endpoints belonging to this platform.",
        },
        { status: 403 }
      );
    }

    if (!isLabEndpoint(fullUrl)) {
      return NextResponse.json(
        {
          error:
            "Scanner can only scan lab environment endpoints (/labs/*).",
        },
        { status: 403 }
      );
    }

    // Create scan record safely
    let scanId = `scan-${Date.now()}`;
    try {
      const scan = await prisma.scan.create({
        data: {
          userId,
          targetUrl: fullUrl,
          labId: labId || null,
          status: "RUNNING",
        },
      });
      scanId = scan.id;

      await prisma.securityEvent.create({
        data: {
          type: "SCANNER_EXECUTED",
          severity: "LOW",
          details: `XSS scan initiated against: ${fullUrl}`,
          userId,
          ip,
        },
      });
    } catch (dbErr) {
      console.warn("Could not record scan in database:", dbErr);
    }

    // Run scan
    try {
      const findings = await scanEndpoint({ targetUrl: fullUrl, labId }, baseUrl);

      // Save results safely if DB is active
      try {
        for (const finding of findings) {
          await prisma.scanResult.create({
            data: {
              scanId,
              type: finding.type as "REFLECTED" | "STORED" | "DOM" | "FILTER_BYPASS" | "CONTEXT",
              severity: finding.severity,
              confidence: finding.confidence,
              parameter: finding.parameter,
              context: finding.context,
              evidence: finding.evidence,
              remediation: finding.remediation,
            },
          });
        }

        await prisma.scan.update({
          where: { id: scanId },
          data: { status: "COMPLETED" },
        });
      } catch (saveErr) {
        console.warn("Could not persist scan results in DB:", saveErr);
      }

      return NextResponse.json({
        scanId,
        status: "COMPLETED",
        findings,
        totalFindings: findings.length,
      });
    } catch (scanError) {
      try {
        await prisma.scan.update({
          where: { id: scanId },
          data: { status: "FAILED" },
        });
      } catch {
        // ignore
      }
      throw scanError;
    }
  } catch (error) {
    console.error("Scanner error:", error);
    return NextResponse.json(
      {
        error:
          error instanceof Error ? error.message : "Internal server error",
      },
      { status: 500 }
    );
  }
}

export async function GET(req: Request) {
  try {
    const session = await auth();
    if (!AUTH_BYPASS && !session?.user) {
      return NextResponse.json({ error: "Unauthorized" }, { status: 401 });
    }

    const userId = session?.user?.id || BYPASS_USER.id;

    const scans = await prisma.scan.findMany({
      where: { userId },
      include: { results: true },
      orderBy: { createdAt: "desc" },
      take: 20,
    });

    return NextResponse.json({ scans });
  } catch (error) {
    console.error("Scanner history error:", error);
    return NextResponse.json(
      { error: "Internal server error" },
      { status: 500 }
    );
  }
}
