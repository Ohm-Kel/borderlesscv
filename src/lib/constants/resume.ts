import type { CountryPreset, ExperienceLevel } from "@prisma/client";

export const SECTION_KEYS = [
  "education",
  "experience",
  "internships",
  "projects",
  "leadership",
  "volunteer",
  "certifications",
  "awards",
  "skills",
  "languages",
  "links",
] as const;

export type SectionKey = (typeof SECTION_KEYS)[number];

export const SECTION_LABELS: Record<SectionKey, string> = {
  education: "Education",
  experience: "Work Experience",
  internships: "Internships",
  projects: "Projects",
  leadership: "Leadership & Activities",
  volunteer: "Volunteer Experience",
  certifications: "Certifications",
  awards: "Awards",
  skills: "Skills",
  languages: "Languages",
  links: "Links",
};

export type CountryGuidance = {
  headline: string;
  summaryStyle: string;
  atsPriority: string;
  pageTarget: string;
  recruiterNote: string;
  doNotInclude: string;
  preferredOrder: SectionKey[];
};

export const COUNTRY_GUIDANCE: Record<CountryPreset, CountryGuidance> = {
  GHANA: {
    headline: "Use a direct summary and keep credentials, leadership, and practical exposure visible.",
    summaryStyle: "Explain impact clearly, with plain language and credible proof from school or internships.",
    atsPriority: "Highlight software, certifications, communication, and project ownership.",
    pageTarget: "1 page for students, 2 pages only when evidence is strong.",
    recruiterNote: "School leadership, volunteering, and training programs are often valuable signals.",
    doNotInclude: "Do not inflate job titles or add metrics you cannot defend.",
    preferredOrder: ["education", "projects", "internships", "experience", "leadership", "skills", "certifications", "awards", "volunteer", "languages", "links"],
  },
  UK: {
    headline: "Keep the CV concise, factual, and tailored to the role requirements.",
    summaryStyle: "A short profile is fine, but let evidence in bullets do most of the work.",
    atsPriority: "Mirror job-description skills and use outcome-led bullet points.",
    pageTarget: "1 page for graduate roles, sometimes 2 when experience justifies it.",
    recruiterNote: "Avoid a photo and keep personal details minimal and professional.",
    doNotInclude: "Do not add date of birth, nationality, or unnecessary personal details.",
    preferredOrder: ["experience", "internships", "projects", "education", "skills", "leadership", "certifications", "awards", "volunteer", "languages", "links"],
  },
  USA: {
    headline: "Optimize for ATS readability with strong section labels and measurable outcomes.",
    summaryStyle: "Use a sharp professional summary only when it adds context the bullets do not cover.",
    atsPriority: "Keywords, impact verbs, and clean chronology matter more than visual flair.",
    pageTarget: "1 page is the default for early-career resumes.",
    recruiterNote: "Lead with the strongest proof of execution, even if it came from projects.",
    doNotInclude: "Do not include photos, marital status, or non-essential personal details.",
    preferredOrder: ["experience", "projects", "internships", "education", "skills", "certifications", "leadership", "awards", "volunteer", "languages", "links"],
  },
  CANADA: {
    headline: "Stay factual and balanced, showing both practical skills and community contribution.",
    summaryStyle: "Combine ATS clarity with a professional, friendly tone.",
    atsPriority: "Relevant tools, certifications, and collaboration examples matter.",
    pageTarget: "1 page is preferred until experience becomes clearly deeper.",
    recruiterNote: "Volunteer work can meaningfully support employability for early-career applicants.",
    doNotInclude: "Do not include a headshot or unsupported claims of expertise.",
    preferredOrder: ["experience", "internships", "projects", "education", "skills", "volunteer", "leadership", "certifications", "awards", "languages", "links"],
  },
  EUROPE: {
    headline: "Adapt carefully by employer and country, but keep the base version ATS-safe and conservative.",
    summaryStyle: "Use a brief profile and clear sectioning; add depth only when it improves relevance.",
    atsPriority: "Language ability, international exposure, and role-fit keywords can matter strongly.",
    pageTarget: "1 page for graduate applications, 2 pages for more established profiles.",
    recruiterNote: "Some markets accept more detail, but the default version should remain clean and modern.",
    doNotInclude: "Do not assume every European employer wants the same format or personal details.",
    preferredOrder: ["experience", "education", "projects", "skills", "internships", "languages", "certifications", "leadership", "awards", "volunteer", "links"],
  },
  REMOTE: {
    headline: "Emphasize communication, self-direction, async work habits, and visible proof of output.",
    summaryStyle: "Be explicit about tools, scope, and the environments where you delivered work.",
    atsPriority: "Remote collaboration tools, documentation habits, and project ownership matter.",
    pageTarget: "1 page unless portfolio depth strongly supports a second.",
    recruiterNote: "A strong links section and project evidence improve trust quickly.",
    doNotInclude: "Do not use vague claims like 'hard-working' without evidence.",
    preferredOrder: ["projects", "experience", "internships", "skills", "education", "links", "leadership", "certifications", "awards", "volunteer", "languages"],
  },
};

export function getDefaultSectionOrder(country: CountryPreset, experienceLevel: ExperienceLevel) {
  const countryOrder = COUNTRY_GUIDANCE[country].preferredOrder;

  if (experienceLevel === "STUDENT" || experienceLevel === "GRADUATE") {
    const earlyCareerOrder: SectionKey[] = [
      "education",
      "projects",
      "internships",
      "experience",
      "skills",
      "leadership",
      "certifications",
      "awards",
      "volunteer",
      "languages",
      "links",
    ];

    return earlyCareerOrder
      .filter((section) => countryOrder.includes(section))
      .concat(countryOrder.filter((section) => !earlyCareerOrder.includes(section)));
  }

  return countryOrder;
}
