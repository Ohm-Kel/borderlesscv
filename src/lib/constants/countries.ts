import type { CountryPreset, EmphasisMode, ResumeTemplateKey } from "@prisma/client";

export const COUNTRY_OPTIONS: Array<{ value: CountryPreset; label: string }> = [
  { value: "GHANA", label: "Ghana" },
  { value: "UK", label: "United Kingdom" },
  { value: "USA", label: "United States" },
  { value: "CANADA", label: "Canada" },
  { value: "EUROPE", label: "Europe" },
  { value: "REMOTE", label: "Remote-first roles" },
];

export const EXPERIENCE_LEVEL_OPTIONS = [
  { value: "STUDENT", label: "Student" },
  { value: "GRADUATE", label: "Recent graduate" },
  { value: "EARLY_CAREER", label: "Early career" },
] as const;

export const RESUME_TEMPLATE_OPTIONS: Array<{
  value: ResumeTemplateKey;
  label: string;
  description: string;
}> = [
  {
    value: "ATLAS",
    label: "Atlas",
    description: "A confident, structured layout for international recruiting pipelines.",
  },
  {
    value: "HORIZON",
    label: "Horizon",
    description: "A softer editorial template for graduate and internship applications.",
  },
  {
    value: "EMBER",
    label: "Ember",
    description: "A compact ATS-first template optimized for speed and consistency.",
  },
  {
    value: "CLASSIC",
    label: "Classic",
    description: "A traditional, single-column serif template matching strict ATS layout requirements.",
  },
];

export const EMPHASIS_MODE_OPTIONS: Array<{ value: EmphasisMode; label: string; description: string }> = [
  {
    value: "AUTO",
    label: "Auto",
    description: "Matches the section order to early-career and country-aware defaults.",
  },
  {
    value: "EDUCATION_FIRST",
    label: "Education first",
    description: "Lead with coursework, projects, and academic strength.",
  },
  {
    value: "SKILLS_FIRST",
    label: "Skills first",
    description: "Surface tools, languages, and certifications before full experience.",
  },
  {
    value: "EXPERIENCE_FIRST",
    label: "Experience first",
    description: "Push internships and work history to the top for stronger proof.",
  },
];
