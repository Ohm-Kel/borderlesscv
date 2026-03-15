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
