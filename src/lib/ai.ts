import OpenAI from "openai";

import type { CountryPreset, ResumeTone } from "@prisma/client";

const client = process.env.OPENAI_API_KEY ? new OpenAI({ apiKey: process.env.OPENAI_API_KEY }) : null;
const model = process.env.OPENAI_MODEL ?? "gpt-4.1-mini";

async function createStructuredOutput<T>({
  system,
  user,
  fallback,
}: {
  system: string;
  user: string;
  fallback: T;
}) {
  if (!client) {
    return fallback;
  }

  const response = await client.chat.completions.create({
    model,
    temperature: 0.2,
    response_format: { type: "json_object" },
    messages: [
      { role: "system", content: system },
      { role: "user", content: user },
    ],
  });

  const content = response.choices[0]?.message?.content;

  if (!content) {
    return fallback;
  }

  try {
    return JSON.parse(content) as T;
  } catch {
    return fallback;
  }
}

function appendMetricPlaceholder(text: string) {
  return /\d/.test(text) ? text : `${text.replace(/\.$/, "")}. Add a measurable outcome if available.`;
}

function fallbackRewriteBullet(bullet: string) {
  const trimmed = bullet.trim();
  const sentence = /^[A-Z]/.test(trimmed) ? trimmed : `${trimmed.charAt(0).toUpperCase()}${trimmed.slice(1)}`;
  return appendMetricPlaceholder(sentence);
}

export async function rewriteBullet(input: { bullet: string; tone: ResumeTone; role?: string }) {
  return createStructuredOutput({
    system:
      "You rewrite resume bullets for BorderlessCV. You may only transform the user-provided fact. Never invent metrics, dates, tools, qualifications, scope, or achievements. If the fact lacks measurable evidence, include the exact phrase 'Add a measurable outcome if available.' Respond as JSON with keys rewrittenBullet and note.",
    user: JSON.stringify(input),
    fallback: {
      rewrittenBullet: fallbackRewriteBullet(input.bullet),
      note: "Transformed only from the provided fact.",
    },
  });
}

export async function generateSummary(input: {
  facts: string[];
  country: CountryPreset;
  tone: ResumeTone;
}) {
  const fallbackSummary = `${input.facts.slice(0, 3).join(". ")}. Add a measurable outcome if available.`;

  return createStructuredOutput({
    system:
      "You write concise professional summaries for BorderlessCV. You may only transform the provided facts. Never invent achievements, years, tools, or seniority. If the facts are thin, stay modest and include 'Add a measurable outcome if available.' Respond as JSON with keys summary and note.",
    user: JSON.stringify(input),
    fallback: {
      summary: fallbackSummary,
      note: "Summary was generated only from the supplied facts.",
    },
  });
}

const KNOWN_SKILLS = [
  "Excel",
  "Power BI",
  "SQL",
  "Python",
  "JavaScript",
  "TypeScript",
  "React",
  "Next.js",
  "Node.js",
  "Figma",
  "Canva",
  "Google Sheets",
  "Data analysis",
  "Project management",
  "Customer service",
  "Research",
  "Communication",
  "Presentation",
  "Leadership",
  "Teamwork",
  "Public speaking",
  "Microsoft Office",
  "Notion",
  "Git",
  "PostgreSQL",
];

export async function suggestSkills(input: { facts: string[] }) {
  const fallbackSkills = KNOWN_SKILLS.filter((skill) =>
    input.facts.some((fact) => fact.toLowerCase().includes(skill.toLowerCase())),
  ).slice(0, 12);

  return createStructuredOutput({
    system:
      "You normalize skills for BorderlessCV. Only return skills directly supported by the provided facts. Never infer experience with tools or qualifications that are not explicitly mentioned. Respond as JSON with keys skills and note.",
    user: JSON.stringify(input),
    fallback: {
      skills: fallbackSkills,
      note: "Skills were extracted only from explicit facts.",
    },
  });
}

export async function generateCoverLetter(input: {
  facts: string[];
  companyName?: string;
  jobTitle?: string;
  jobDescription?: string;
  country: CountryPreset;
}) {
  const intro = `Dear Hiring Team,\n\nI am applying for the ${input.jobTitle || "role"}${input.companyName ? ` at ${input.companyName}` : ""}.`;
  const body = `\n\nMy background includes ${input.facts.slice(0, 3).join(", ")}. I have focused on presenting only verified experience and would be glad to discuss how those experiences align with your needs.`;
  const close = "\n\nThank you for your time and consideration.\n\nSincerely,\n[Your Name]";

  return createStructuredOutput({
    system:
      "You write cover letters for BorderlessCV. You may only use the user's facts and the job description. Never invent achievements, responsibilities, years, tools, or metrics. Keep the tone professional and early-career appropriate. Respond as JSON with keys content and note.",
    user: JSON.stringify(input),
    fallback: {
      content: `${intro}${body}${close}`,
      note: "Cover letter drafted from supplied facts only.",
    },
  });
}
