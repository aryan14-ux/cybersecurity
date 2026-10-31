import { z } from "zod";

export const registerSchema = z.object({
  name: z.string().min(2, "Name must be at least 2 characters").max(50),
  email: z.string().email("Invalid email address"),
  password: z
    .string()
    .min(8, "Password must be at least 8 characters")
    .max(128)
    .regex(/[A-Z]/, "Password must contain an uppercase letter")
    .regex(/[a-z]/, "Password must contain a lowercase letter")
    .regex(/[0-9]/, "Password must contain a number"),
});

export const loginSchema = z.object({
  email: z.string().email("Invalid email address"),
  password: z.string().min(1, "Password is required"),
});

export const labAttemptSchema = z.object({
  labId: z.string().cuid(),
  payload: z.string().max(5000).optional(),
  mode: z.enum(["LEARN", "CHALLENGE"]),
  hintsUsed: z.number().int().min(0).max(3).optional(),
});

export const scanRequestSchema = z.object({
  targetUrl: z.string().min(1, "Target URL is required").refine(
    (val) => {
      if (val.startsWith("/")) return true;
      try {
        const u = new URL(val);
        return u.protocol === "http:" || u.protocol === "https:";
      } catch {
        return false;
      }
    },
    { message: "Invalid URL. Please provide a valid lab endpoint path (e.g. /labs/reflected?q=test) or full URL." }
  ),
  labId: z.string().optional(),
});

export const labCreateSchema = z.object({
  slug: z.string().min(2).max(100).regex(/^[a-z0-9-]+$/),
  title: z.string().min(2).max(200),
  description: z.string().min(10),
  difficulty: z.enum(["EASY", "MEDIUM", "HARD", "EXPERT"]),
  category: z.enum(["REFLECTED", "STORED", "DOM", "FILTER_BYPASS", "CONTEXT"]),
  points: z.number().int().min(50).max(1000),
  objective: z.string().min(10),
  hint1: z.string().min(5),
  hint2: z.string().min(5),
  solution: z.string().min(10),
  vulnCode: z.string().min(10),
  secureCode: z.string().min(10),
  vulnEndpoint: z.string().min(1),
  secureEndpoint: z.string().min(1),
  explanation: z.string().min(10),
  dataFlow: z.string().min(10),
  remediation: z.string().min(10),
  enabled: z.boolean().optional(),
  order: z.number().int().optional(),
});

export type RegisterInput = z.infer<typeof registerSchema>;
export type LoginInput = z.infer<typeof loginSchema>;
export type LabAttemptInput = z.infer<typeof labAttemptSchema>;
export type ScanRequestInput = z.infer<typeof scanRequestSchema>;
