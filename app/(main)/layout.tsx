import { Providers } from "@/components/providers";
import { Navbar } from "@/components/ui/navbar";

export default function MainLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <Providers>
      <Navbar />
      <main className="pt-16 min-h-screen">{children}</main>
    </Providers>
  );
}
