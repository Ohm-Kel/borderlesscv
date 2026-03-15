import { z } from "zod";

import { SECTION_KEYS } from "@/lib/constants/resume";
import { profileContentSchema } from "@/lib/validations/profile";

const countryEnum = z.enum(["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"]);

export const resumeDocumentSchema = z.object({
  summary: z.string().trim().max(1200).default(""),
  sectionOrder: z.array(z.enum(SECTION_KEYS)).default([...SECTION_KEYS]),
  hiddenSections: z.array(z.enum(SECTION_KEYS)).default([]),
  sections: profileContentSchema,
});

export const createResumeSchema = z.object({
  title: z.string().trim().min(2, "Resume title is required.").max(120),
  targetRole: z.string().trim().max(120).optional().default(""),
  targetCountry: countryEnum,
  templateKey: z.enum(["ATLAS", "HORIZON", "EMBER"]),
  emphasisMode: z.enum(["AUTO", "EDUCATION_FIRST", "SKILLS_FIRST", "EXPERIENCE_FIRST"]),
});

export const updateResumeSchema = createResumeSchema.extend({
  visibility: z.enum(["PRIVATE", "PUBLIC"]).default("PRIVATE"),
});

export const createResumeVersionSchema = z.object({
  title: z.string().trim().min(2, "Version title is required.").max(120),
  jobTitle: z.string().trim().max(120).optional().default(""),
  companyName: z.string().trim().max(120).optional().default(""),
  jobDescription: z.string().trim().max(8000).optional().default(""),
  changeSummary: z.string().trim().max(240).optional().default(""),
  tone: z.enum(["INTERNSHIP", "GRADUATE", "PROFESSIONAL"]).default("GRADUATE"),
  sourceVersionId: z.string().trim().optional(),
  content: resumeDocumentSchema,
});

export type ResumeDocument = z.infer<typeof resumeDocumentSchema>;
