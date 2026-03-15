import type { ProfileContent } from "@/lib/validations/profile";

export function buildFactsFromProfile(content: ProfileContent, professionalSummary?: string | null) {
  const facts: string[] = [];

  if (professionalSummary?.trim()) {
    facts.push(professionalSummary.trim());
  }

  for (const section of [
    ...content.education,
    ...content.experience,
    ...content.internships,
    ...content.projects,
    ...content.leadership,
    ...content.volunteer,
  ]) {
    facts.push(`${section.title} at ${section.organization} (${section.date})`);

    if (section.description) {
      facts.push(section.description);
    }

    facts.push(...section.bullets);
  }

  for (const certification of content.certifications) {
    facts.push(`${certification.title} by ${certification.issuer} (${certification.date})`);
  }

  for (const award of content.awards) {
    facts.push(`${award.title} from ${award.issuer} (${award.date})`);
  }

  facts.push(...content.skills);
  facts.push(...content.languages.map((language) => `${language.name} - ${language.proficiency}`));

  return Array.from(new Set(facts.filter(Boolean))).slice(0, 60);
}
