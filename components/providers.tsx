"use client";

import { SessionProvider } from "next-auth/react";

const CLIENT_BYPASS_SESSION = {
  user: {
    id: "cmu1khp2r0000f8lkrsmby4c4",
    name: "Admin",
    email: "admin@xsslab.com",
    role: "ADMIN" as const,
  },
  expires: new Date(Date.now() + 30 * 24 * 60 * 60 * 1000).toISOString(),
};

export function Providers({ children }: { children: React.ReactNode }) {
  return (
    <SessionProvider session={CLIENT_BYPASS_SESSION as any}>
      {children}
    </SessionProvider>
  );
}

