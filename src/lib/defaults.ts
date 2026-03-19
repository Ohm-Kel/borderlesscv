import type { CountryPreset, ExperienceLevel } from "@prisma/client";

import { getDefaultSectionOrder } from "@/lib/constants/resume";
import type { ResumeDocument } from "@/lib/validations/resume";
import type { ProfileContent } from "@/lib/validations/profile";
import { slugify } from "@/lib/utils";

export function createEmptyProfileContent(): ProfileContent {
  return {
    education: [],
    experience: [],
    internships: [],
    projects: [],
    leadership: [],
    volunteer: [],
    certifications: [],
    awards: [],
    skills: [],
    languages: [],
    links: [],
  };
}

export function buildResumeDocumentFromProfile(
  content: ProfileContent,
  professionalSummary: string,
  country: CountryPreset,
  experienceLevel: ExperienceLevel,
): ResumeDocument {
  return {
    summary: professionalSummary,
    sectionOrder: getDefaultSectionOrder(country, experienceLevel),
    hiddenSections: [],
    sectionLabelOverrides: {},
    sections: content,
  };
}

export function makePublicProfileSlug(name: string, userId: string) {
  const base = slugify(name) || "candidate";
  return `${base}-${userId.slice(-6)}`;
}
