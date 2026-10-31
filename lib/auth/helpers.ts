import { auth, AUTH_BYPASS, BYPASS_SESSION } from "@/lib/auth/auth";
import { redirect } from "next/navigation";
import type { Role } from "@prisma/client";

export async function getSession() {
  if (AUTH_BYPASS) {
    return BYPASS_SESSION;
  }
  return await auth();
}

export async function requireAuth() {
  if (AUTH_BYPASS) {
    return BYPASS_SESSION;
  }
  const session = await auth();
  if (!session?.user) {
    redirect("/login");
  }
  return session;
}

export async function requireRole(role: Role) {
  if (AUTH_BYPASS) {
    return BYPASS_SESSION;
  }
  const session = await requireAuth();
  if (session.user.role !== role) {
    redirect("/dashboard");
  }
  return session;
}

export async function requireAdmin() {
  return requireRole("ADMIN");
}

