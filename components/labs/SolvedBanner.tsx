"use client";

import { CheckCircle2, Sparkles, Trophy, Zap, AlertCircle } from "lucide-react";

interface SolvedBannerProps {
  completed: boolean;
  labTitle: string;
  points: number;
  lastPayload?: string;
  justSolved?: boolean;
}

export function SolvedBanner({
  completed,
  labTitle,
  points,
  lastPayload,
  justSolved = false,
}: SolvedBannerProps) {
  if (!completed) {
    return (
      <div className="mb-6 p-4 bg-cyber-900/60 border border-cyber-700/60 rounded-xl flex items-center justify-between shadow-lg">
        <div className="flex items-center gap-3">
          <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-cyber-800 text-cyber-400 border border-cyber-700 font-mono text-xs font-bold">
            01
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="text-xs uppercase font-bold tracking-wider px-2 py-0.5 rounded bg-cyber-800 text-cyber-400 border border-cyber-700">
                STATUS: UNSOLVED
              </span>
              <span className="text-cyber-400 text-xs hidden sm:inline">•</span>
              <span className="text-cyber-300 text-xs hidden sm:inline">
                Trigger JavaScript execution to solve
              </span>
            </div>
            <p className="text-white text-sm font-semibold mt-0.5">
              Target: <span className="text-cyber-200">{labTitle}</span>
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <div className="w-2.5 h-2.5 rounded-full bg-neon-yellow animate-ping" />
          <span className="text-xs text-cyber-400 font-mono hidden md:inline">
            Listening for exploit...
          </span>
        </div>
      </div>
    );
  }

  return (
    <div
      className={`mb-6 p-5 rounded-xl border-2 transition-all duration-500 shadow-2xl ${
        justSolved
          ? "bg-gradient-to-r from-neon-green/25 via-neon-cyan/20 to-neon-green/25 border-neon-green glow-green animate-pulse"
          : "bg-gradient-to-r from-neon-green/15 via-cyber-900 to-neon-green/15 border-neon-green/60"
      }`}
    >
      <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          <div className="flex items-center justify-center w-12 h-12 rounded-xl bg-neon-green/20 border border-neon-green/40 text-neon-green flex-shrink-0">
            <Trophy className="w-6 h-6 animate-bounce" />
          </div>
          <div>
            <div className="flex items-center gap-2">
              <span className="px-2.5 py-0.5 rounded-full text-xs font-bold uppercase tracking-wider bg-neon-green text-cyber-950 flex items-center gap-1">
                <CheckCircle2 className="w-3.5 h-3.5" />
                LAB SOLVED
              </span>
              <span className="text-xs font-semibold text-neon-green flex items-center gap-1">
                <Sparkles className="w-3.5 h-3.5" />
                +{points} Points Earned
              </span>
            </div>
            <h3 className="text-lg sm:text-xl font-bold text-white mt-1">
              Congratulations, you successfully exploited this vulnerability!
            </h3>
            {lastPayload && (
              <p className="text-cyber-300 text-xs font-mono mt-1 flex items-center gap-1.5">
                <Zap className="w-3.5 h-3.5 text-neon-green" />
                Executed Payload:{" "}
                <span className="text-neon-green bg-cyber-950/80 px-2 py-0.5 rounded border border-cyber-800">
                  {lastPayload}
                </span>
              </p>
            )}
          </div>
        </div>

        <div className="text-right flex-shrink-0 self-end sm:self-center">
          <span className="px-3 py-1.5 rounded-lg bg-cyber-950/90 border border-neon-green/40 text-neon-green font-mono text-xs font-bold">
            VERIFIED BY EXPLOIT ORACLE
          </span>
        </div>
      </div>
    </div>
  );
}
