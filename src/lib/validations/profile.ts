import { z } from "zod";

import { SECTION_KEYS } from "@/lib/constants/resume";

const optionalUrl = z
  .string()
  .trim()
  .max(2048, "URL is too long.")
  .optional()
  .transform((value) => value?.trim() || undefined)
  .refine((value) => !value || z.url().safeParse(value).success, "Enter a valid URL.");

export const bulletSchema = z.string().trim().min(2, "Bullet content is required.").max(240, "Keep bullets concise.");

export const listEntrySchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Title is required."),
  organization: z.string().trim().min(1, "Organization is required."),
  location: z.string().trim().max(120).optional().default(""),
  date: z.string().trim().min(1, "Date range is required.").max(80),
  description: z.string().trim().max(300).optional().default(""),
  bullets: z.array(bulletSchema).max(8, "Use up to 8 bullets per entry.").default([]),
  url: optionalUrl,
});

export const awardSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Award title is required."),
  issuer: z.string().trim().min(1, "Issuer is required."),
  date: z.string().trim().min(1, "Date is required."),
  description: z.string().trim().max(200).optional().default(""),
});

export const certificationSchema = z.object({
  id: z.string().min(1),
  title: z.string().trim().min(1, "Certification title is required."),
  issuer: z.string().trim().min(1, "Issuer is required."),
  date: z.string().trim().min(1, "Date is required."),
  credentialId: z.string().trim().max(120).optional().default(""),
  url: optionalUrl,
});

export const languageSchema = z.object({
  id: z.string().min(1),
  name: z.string().trim().min(1, "Language is required."),
  proficiency: z.string().trim().min(1, "Proficiency is required."),
});

export const linkSchema = z.object({
  id: z.string().min(1),
  label: z.string().trim().min(1, "Link label is required."),
  url: z.url("Enter a valid URL."),
});

export const profileContentSchema = z.object({
  education: z.array(listEntrySchema).default([]),
  experience: z.array(listEntrySchema).default([]),
  internships: z.array(listEntrySchema).default([]),
  projects: z.array(listEntrySchema).default([]),
  leadership: z.array(listEntrySchema).default([]),
  volunteer: z.array(listEntrySchema).default([]),
  certifications: z.array(certificationSchema).default([]),
  awards: z.array(awardSchema).default([]),
  skills: z.array(z.string().trim().min(1).max(80)).default([]),
  languages: z.array(languageSchema).default([]),
  links: z.array(linkSchema).default([]),
});

export const onboardingSchema = z.object({
  name: z.string().trim().min(2, "Full name is required."),
  headline: z.string().trim().min(2, "Headline is required.").max(120),
  location: z.string().trim().min(2, "Location is required.").max(120),
  phone: z.string().trim().min(7, "Phone number is required.").max(30),
  links: z.array(linkSchema).max(6).default([]),
  targetCountries: z.array(z.enum(["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"])).min(1, "Pick at least one target country."),
  targetRoles: z.array(z.string().trim().min(2).max(80)).min(1, "Add at least one target role."),
  experienceLevel: z.enum(["STUDENT", "GRADUATE", "EARLY_CAREER"]),
});

export const personalDetailsSchema = z.object({
  name: z.string().trim().min(2, "Full name is required."),
  headline: z.string().trim().min(2, "Headline is required.").max(120),
  location: z.string().trim().min(2, "Location is required.").max(120),
  phone: z.string().trim().min(7, "Phone number is required.").max(30),
});

export const masterProfileSchema = z.object({
  personalDetails: personalDetailsSchema,
  professionalSummary: z.string().trim().max(1200).optional().default(""),
  content: profileContentSchema,
});

export const sectionKeySchema = z.enum(SECTION_KEYS);

export type ProfileContent = z.infer<typeof profileContentSchema>;
export type ProfileListEntry = z.infer<typeof listEntrySchema>;
export type CertificationEntry = z.infer<typeof certificationSchema>;
export type AwardEntry = z.infer<typeof awardSchema>;
export type LanguageEntry = z.infer<typeof languageSchema>;
export type LinkEntry = z.infer<typeof linkSchema>;
