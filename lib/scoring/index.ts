import type { Difficulty } from "@prisma/client";

const DIFFICULTY_POINTS: Record<Difficulty, number> = {
  EASY: 100,
  MEDIUM: 200,
  HARD: 300,
  EXPERT: 500,
};

const HINT_PENALTIES = [0, 0.125, 0.25]; // 0 hints, 1 hint, 2 hints
const SOLUTION_PENALTY = 0.5;

export function calculateScore(
  difficulty: Difficulty,
  hintsUsed: number,
  solutionRevealed: boolean = false
): number {
  const basePoints = DIFFICULTY_POINTS[difficulty];

  if (solutionRevealed) {
    return Math.floor(basePoints * (1 - SOLUTION_PENALTY));
  }

  const penalty = HINT_PENALTIES[Math.min(hintsUsed, 2)] || 0;
  return Math.floor(basePoints * (1 - penalty));
}

export function getLearnModeScore(difficulty: Difficulty): number {
  return Math.floor(DIFFICULTY_POINTS[difficulty] * 0.5);
}

export function getDifficultyPoints(difficulty: Difficulty): number {
  return DIFFICULTY_POINTS[difficulty];
}

export function getUserLevel(totalScore: number): {
  level: number;
  title: string;
  nextLevelScore: number;
} {
  const levels = [
    { threshold: 0, title: "Script Kiddie" },
    { threshold: 200, title: "Bug Hunter" },
    { threshold: 500, title: "Exploit Developer" },
    { threshold: 1000, title: "Penetration Tester" },
    { threshold: 2000, title: "Security Researcher" },
    { threshold: 3500, title: "Red Team Operator" },
    { threshold: 5000, title: "Elite Hacker" },
  ];

  let currentLevel = 0;
  for (let i = levels.length - 1; i >= 0; i--) {
    if (totalScore >= levels[i].threshold) {
      currentLevel = i;
      break;
    }
  }

  const nextLevel =
    currentLevel < levels.length - 1
      ? levels[currentLevel + 1].threshold
      : levels[currentLevel].threshold;

  return {
    level: currentLevel + 1,
    title: levels[currentLevel].title,
    nextLevelScore: nextLevel,
  };
}
