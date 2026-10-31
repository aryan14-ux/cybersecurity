import { PortSwiggerLabHeader } from "@/components/labs/PortSwiggerLabHeader";
import { ExploitOracleHook } from "@/components/labs/ExploitOracleHook";
import { Suspense } from "react";

export default function LabsLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <div className="min-h-screen bg-cyber-950 text-cyber-100">
      {/* PortSwigger-Style Animated Lab Header & Differentiator Suite */}
      <Suspense fallback={<div className="h-14 bg-cyber-950 border-b border-cyber-800" />}>
        <PortSwiggerLabHeader />
      </Suspense>

      {/* Main Lab Target Viewport */}
      <main className="pt-16 pb-12">
        {children}
      </main>

      {/* Active Exploit Telemetry Oracle */}
      <ExploitOracleHook />
    </div>
  );
}
