import { SECTION_LABELS, type SectionKey } from "@/lib/constants/resume";
import { getVisibleSections } from "@/lib/resume-presentation";
import type {
  AwardEntry,
  CertificationEntry,
  ProfileContent,
  ProfileListEntry,
} from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

export const TARGET_RESUME_LINES = 54;

export type ResumeDensityMode = "balanced" | "compact" | "compressed";
export type ResumeFitStatus = "comfortable" | "balanced" | "tight" | "overflow";

export type ResumeSectionFit = {
  section: SectionKey;
  label: string;
  lines: number;
  visible: boolean;
};

export type ResumeFitSummary = {
  rawLines: number;
  adjustedLines: number;
  targetLines: number;
  remainingLines: number;
  fillPercentage: number;
  density: ResumeDensityMode;
  densityLabel: string;
  status: ResumeFitStatus;
  guidance: string;
  sectionLines: ResumeSectionFit[];
  topSections: ResumeSectionFit[];
};

function estimateTextLines(text: string | null | undefined, charactersPerLine: number) {
  const value = text?.trim() ?? "";

  if (!value) {
    return 0;
  }

  return Math.max(1, Math.ceil(value.length / charactersPerLine));
}

function estimateListEntryLines(item: ProfileListEntry) {
  return (
    2 +
    estimateTextLines(item.description, 88) +
    item.bullets.filter(Boolean).reduce((count, bullet) => count + estimateTextLines(bullet, 84), 0) +
    estimateTextLines(item.url, 60) +
    1
  );
}

function estimateCredentialLines(items: CertificationEntry[]) {
  return items.reduce(
    (count, item) =>
      count +
      2 +
      estimateTextLines(item.credentialId, 70) +
      estimateTextLines(item.url, 60),
    0,
  );
}

function estimateAwardLines(items: AwardEntry[]) {
  return items.reduce((count, item) => count + 2 + estimateTextLines(item.description, 84), 0);
}

function estimateSectionLines(section: SectionKey, content: ProfileContent) {
  if (section === "skills") {
    const skillsText = content.skills.join(", ");
    return content.skills.length ? 1 + estimateTextLines(skillsText, 70) : 0;
  }

  if (section === "languages") {
    return content.languages.length ? 1 + content.languages.length : 0;
  }

  if (section === "links") {
    return content.links.length
      ? 1 + content.links.reduce((count, item) => count + 1 + estimateTextLines(item.url, 58), 0)
      : 0;
  }

  if (section === "certifications") {
    return content.certifications.length ? 1 + estimateCredentialLines(content.certifications) : 0;
  }

  if (section === "awards") {
    return content.awards.length ? 1 + estimateAwardLines(content.awards) : 0;
  }

  const items = content[section] as ProfileListEntry[];
  return items.length ? 1 + items.reduce((count, item) => count + estimateListEntryLines(item), 0) : 0;
}

function getDensityMode(rawLines: number): ResumeDensityMode {
  if (rawLines > 60) {
    return "compressed";
  }

  if (rawLines > TARGET_RESUME_LINES) {
    return "compact";
  }

  return "balanced";
}

function getDensityFactor(density: ResumeDensityMode) {
  if (density === "compressed") {
    return 0.86;
  }

  if (density === "compact") {
    return 0.92;
  }

  return 1;
}

function getStatus(adjustedLines: number): ResumeFitStatus {
  if (adjustedLines <= 44) {
    return "comfortable";
  }

  if (adjustedLines <= TARGET_RESUME_LINES) {
    return "balanced";
  }

  if (adjustedLines <= TARGET_RESUME_LINES + 4) {
    return "tight";
  }

  return "overflow";
}

function getGuidance(status: ResumeFitStatus, remainingLines: number, topSections: ResumeSectionFit[]) {
  if (status === "comfortable") {
    return "You still have room on the page. Add stronger proof, a tighter summary, or one more relevant project if it improves your case.";
  }

  if (status === "balanced") {
    return "Your draft is within a strong one-page range. Keep this density and use the preview to tighten weak sections, not just to add more text.";
  }

  if (status === "tight") {
    return `One page is still realistic, but keep bullets concise. Start trimming ${topSections[0]?.label ?? "the heaviest section"} first.`;
  }

  return `You are about ${Math.abs(remainingLines)} lines over a clean one-page target. Shorten the heaviest sections or hide lower-signal content.`;
}

export function estimateResumeFit(document: ResumeDocument): ResumeFitSummary {
  const visibleSections = new Set(getVisibleSections(document));
  const rawSectionLines = (Object.keys(SECTION_LABELS) as SectionKey[]).map((section) => ({
    section,
    label: SECTION_LABELS[section],
    rawLines: estimateSectionLines(section, document.sections),
    visible: visibleSections.has(section),
  }));

  const rawLines =
    5 +
    (document.summary ? 2 + estimateTextLines(document.summary, 98) : 0) +
    rawSectionLines.filter((section) => section.visible).reduce((count, section) => count + section.rawLines, 0);

  const density = getDensityMode(rawLines);
  const densityFactor = getDensityFactor(density);
  const adjustedLines = Math.max(20, Math.round(rawLines * densityFactor));
  const remainingLines = TARGET_RESUME_LINES - adjustedLines;
  const sectionLines = rawSectionLines.map((section) => ({
    section: section.section,
    label: section.label,
    lines: Math.max(0, Math.round(section.rawLines * densityFactor)),
    visible: section.visible,
  }));
  const topSections = [...sectionLines]
    .filter((section) => section.visible && section.lines > 0)
    .sort((left, right) => right.lines - left.lines)
    .slice(0, 3);
  const status = getStatus(adjustedLines);

  return {
    rawLines,
    adjustedLines,
    targetLines: TARGET_RESUME_LINES,
    remainingLines,
    fillPercentage: Math.max(0, Math.min(100, (adjustedLines / TARGET_RESUME_LINES) * 100)),
    density,
    densityLabel:
      density === "balanced" ? "Balanced spacing" : density === "compact" ? "Compact spacing" : "Compressed spacing",
    status,
    guidance: getGuidance(status, remainingLines, topSections),
    sectionLines,
    topSections,
  };
}
