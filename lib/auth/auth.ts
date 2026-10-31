import NextAuth from "next-auth";
import CredentialsProvider from "next-auth/providers/credentials";
import { PrismaAdapter } from "@auth/prisma-adapter";
import { prisma } from "@/lib/db/prisma";
import bcrypt from "bcryptjs";
import type { Role } from "@prisma/client";

declare module "next-auth" {
  interface Session {
    user: {
      id: string;
      name?: string | null;
      email?: string | null;
      image?: string | null;
      role: Role;
    };
  }
  interface User {
    role: Role;
  }
}

export const AUTH_BYPASS = process.env.AUTH_BYPASS !== "false";

export const BYPASS_USER = {
  id: "cmu1khp2r0000f8lkrsmby4c4",
  name: "Admin",
  email: "admin@xsslab.com",
  role: "ADMIN" as Role,
};

export const BYPASS_SESSION = {
  user: BYPASS_USER,
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

const nextAuthInstance = NextAuth({
  adapter: PrismaAdapter(prisma),
  session: { strategy: "jwt" },
  pages: {
    signIn: "/login",
  },
  providers: [
    CredentialsProvider({
      name: "credentials",
      credentials: {
        email: { label: "Email", type: "email" },
        password: { label: "Password", type: "password" },
      },
      async authorize(credentials) {
        if (!credentials?.email || !credentials?.password) {
          return null;
        }

        const email = credentials.email as string;
        const password = credentials.password as string;

        const user = await prisma.user.findUnique({
          where: { email },
        });

        if (!user || !user.passwordHash) {
          return null;
        }

        const isValid = await bcrypt.compare(password, user.passwordHash);

        if (!isValid) {
          // Log failed attempt
          await prisma.securityEvent.create({
            data: {
              type: "LOGIN_FAILED",
              severity: "MEDIUM",
              details: `Failed login attempt for email: ${email.substring(0, 3)}***`,
              userId: user.id,
            },
          });
          return null;
        }

        // Log successful login
        await prisma.securityEvent.create({
          data: {
            type: "LOGIN_SUCCESS",
            severity: "LOW",
            details: "Successful login",
            userId: user.id,
          },
        });

        return {
          id: user.id,
          name: user.name,
          email: user.email,
          role: user.role,
        };
      },
    }),
  ],
  callbacks: {
    async jwt({ token, user }) {
      if (user) {
        token.id = user.id;
        token.role = user.role;
      }
      return token;
    },
    async session({ session, token }) {
      if (token) {
        session.user.id = token.id as string;
        session.user.role = token.role as Role;
      }
      return session;
    },
  },
});

export const { handlers, signIn, signOut } = nextAuthInstance;
const internalAuth = nextAuthInstance.auth;

export const auth: typeof internalAuth = (async (...args: any[]) => {
  if (AUTH_BYPASS) {
    try {
      const realSession = await (internalAuth as any)(...args);
      if (realSession?.user) return realSession;
    } catch {
      // In bypass mode, ignore auth errors
    }
    return BYPASS_SESSION;
  }
  return (internalAuth as any)(...args);
}) as any;
