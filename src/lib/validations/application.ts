import { z } from "zod";

const optionalId = z
  .string()
  .trim()
  .optional()
  .transform((value) => value?.trim() || undefined);

export const applicationSchema = z.object({
  company: z.string().trim().min(2, "Company is required.").max(120),
  role: z.string().trim().min(2, "Role is required.").max(120),
  location: z.string().trim().max(120).optional().default(""),
  country: z
    .string()
    .trim()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || ["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"].includes(value), "Select a valid country.")
    .transform((value) => value as "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE" | undefined),
  jobUrl: z
    .string()
    .trim()
    .optional()
    .transform((value) => value?.trim() || undefined)
    .refine((value) => !value || z.url().safeParse(value).success, "Enter a valid job URL."),
  source: z.string().trim().max(120).optional().default(""),
  notes: z.string().trim().max(2000).optional().default(""),
  status: z.enum(["SAVED", "APPLIED", "INTERVIEW", "OFFER", "REJECTED", "WITHDRAWN"]).default("SAVED"),
  appliedAt: z.string().optional().default(""),
  nextStepAt: z.string().optional().default(""),
  resumeId: optionalId,
  resumeVersionId: optionalId,
});

export const coverLetterSchema = z.object({
  resumeVersionId: z.string().min(1),
  title: z.string().trim().min(2, "Title is required.").max(120),
  companyName: z.string().trim().max(120).optional().default(""),
  jobTitle: z.string().trim().max(120).optional().default(""),
  jobDescription: z.string().trim().max(8000).optional().default(""),
  content: z.string().trim().min(50, "Cover letter content is required.").max(8000),
});
