import { Providers } from "@/components/providers";
import { Navbar } from "@/components/ui/navbar";
import { auth, AUTH_BYPASS } from "@/lib/auth/auth";
import { redirect } from "next/navigation";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await auth();
  if (!AUTH_BYPASS) {
    if (!session?.user) redirect("/login");
    if (session.user.role !== "ADMIN") redirect("/dashboard");
  }

  return (
    <Providers>
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
    </Providers>
  );
}
