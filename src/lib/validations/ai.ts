import { z } from "zod";

export const rewriteBulletSchema = z.object({
  bullet: z.string().trim().min(5).max(300),
  tone: z.enum(["INTERNSHIP", "GRADUATE", "PROFESSIONAL"]).default("GRADUATE"),
  role: z.string().trim().max(120).optional().default(""),
});

export const generateSummarySchema = z.object({
  facts: z.array(z.string().trim().min(5).max(300)).min(2),
  country: z.enum(["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"]),
  tone: z.enum(["INTERNSHIP", "GRADUATE", "PROFESSIONAL"]).default("GRADUATE"),
});

export const suggestSkillsSchema = z.object({
  facts: z.array(z.string().trim().min(5).max(300)).min(2),
});

export const tailoringGuidanceSchema = z.object({
  tailoredSummary: z.string().trim().min(1).max(1200),
  matchedKeywords: z
    .array(
      z.object({
        keyword: z.string().trim().min(1).max(120),
        evidence: z.string().trim().min(1).max(240),
      }),
    )
    .max(8)
    .default([]),
  missingKeywords: z.array(z.string().trim().min(1).max(120)).max(8).default([]),
  improvementSuggestions: z.array(z.string().trim().min(1).max(240)).max(5).default([]),
  caution: z.string().trim().min(1).max(240),
});

export const tailorResumeSchema = z.object({
  facts: z.array(z.string().trim().min(5).max(300)).min(3),
  currentSummary: z.string().trim().max(1200).optional().default(""),
  jobDescription: z.string().trim().min(20).max(8000),
  country: z.enum(["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"]),
  tone: z.enum(["INTERNSHIP", "GRADUATE", "PROFESSIONAL"]).default("GRADUATE"),
});

export type TailoringGuidance = z.infer<typeof tailoringGuidanceSchema>;
