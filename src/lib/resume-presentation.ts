import type { ResumeTemplateKey } from "@prisma/client";

import { SECTION_LABELS, type SectionKey } from "@/lib/constants/resume";
import type { ProfileContent } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

type TemplateTheme = {
  preview: {
    shell: string;
    accent: string;
    accentSoft: string;
    badge: string;
    sidebar: string;
    divider: string;
    title: string;
    muted: string;
  };
  pdf: {
    accent: string;
    accentSoft: string;
    accentMuted: string;
    surface: string;
    border: string;
    title: string;
    text: string;
    muted: string;
  };
};

const DETAIL_SECTION_ORDER: SectionKey[] = ["skills", "languages", "certifications", "awards", "links"];
const COMPACT_DETAIL_SECTION_ORDER: SectionKey[] = ["skills", "languages", "links"];

export const TEMPLATE_THEMES: Record<ResumeTemplateKey, TemplateTheme> = {
  ATLAS: {
    preview: {
      shell: "border-slate-200 bg-white",
      accent: "bg-slate-950",
      accentSoft: "bg-slate-100",
      badge: "border-slate-200 bg-slate-50 text-slate-700",
      sidebar: "bg-slate-50",
      divider: "border-slate-200",
      title: "text-slate-950",
      muted: "text-slate-500",
    },
    pdf: {
      accent: "#0f172a",
      accentSoft: "#f8fafc",
      accentMuted: "#e2e8f0",
      surface: "#ffffff",
      border: "#e2e8f0",
      title: "#0f172a",
      text: "#334155",
      muted: "#64748b",
    },
  },
  HORIZON: {
    preview: {
      shell: "border-emerald-100 bg-white",
      accent: "bg-emerald-900",
      accentSoft: "bg-emerald-50",
      badge: "border-emerald-200 bg-emerald-50 text-emerald-800",
      sidebar: "bg-emerald-50/70",
      divider: "border-emerald-100",
      title: "text-slate-950",
      muted: "text-slate-600",
    },
    pdf: {
      accent: "#065f46",
      accentSoft: "#ecfdf5",
      accentMuted: "#d1fae5",
      surface: "#ffffff",
      border: "#d1fae5",
      title: "#0f172a",
      text: "#334155",
      muted: "#4b5563",
    },
  },
  EMBER: {
    preview: {
      shell: "border-orange-100 bg-white",
      accent: "bg-orange-900",
      accentSoft: "bg-orange-50",
      badge: "border-orange-200 bg-orange-50 text-orange-900",
      sidebar: "bg-stone-50",
      divider: "border-stone-200",
      title: "text-slate-950",
      muted: "text-slate-600",
    },
    pdf: {
      accent: "#9a3412",
      accentSoft: "#fff7ed",
      accentMuted: "#fed7aa",
      surface: "#ffffff",
      border: "#e7e5e4",
      title: "#1c1917",
      text: "#44403c",
      muted: "#78716c",
    },
  },
  CLASSIC: {
    preview: {
      shell: "border-gray-400 bg-white",
      accent: "bg-black",
      accentSoft: "bg-white",
      badge: "border-gray-300 bg-white text-black",
      sidebar: "bg-white",
      divider: "border-black",
      title: "text-black",
      muted: "text-black",
    },
    pdf: {
      accent: "#000000",
      accentSoft: "#ffffff",
      accentMuted: "#d4d4d4",
      surface: "#ffffff",
      border: "#000000",
      title: "#000000",
      text: "#000000",
      muted: "#374151",
    },
  },
};

function hasSectionContent(section: keyof ProfileContent, content: ProfileContent) {
  const value = content[section];
  return Array.isArray(value) ? value.length > 0 : false;
}

function orderVisibleSections(visibleSections: SectionKey[], preferredOrder: SectionKey[]) {
  return preferredOrder.filter((section) => visibleSections.includes(section));
}

export function getVisibleSections(document: ResumeDocument) {
  return document.sectionOrder.filter(
    (section) => !document.hiddenSections.includes(section) && hasSectionContent(section, document.sections),
  );
}

export function getSectionHeading(section: SectionKey, overrides?: Record<string, string>) {
  return overrides?.[section]?.trim() || SECTION_LABELS[section];
}

export function getTemplateSectionGroups(templateKey: ResumeTemplateKey, visibleSections: SectionKey[]) {
  if (templateKey === "ATLAS" || templateKey === "CLASSIC") {
    return {
      mainSections: visibleSections,
      sidebarSections: [] as SectionKey[],
    };
  }

  if (templateKey === "HORIZON") {
    const sidebarSections = orderVisibleSections(visibleSections, DETAIL_SECTION_ORDER);
    return {
      mainSections: visibleSections.filter((section) => !sidebarSections.includes(section)),
      sidebarSections,
    };
  }

  const sidebarSections = orderVisibleSections(visibleSections, COMPACT_DETAIL_SECTION_ORDER);
  return {
    mainSections: visibleSections.filter((section) => !sidebarSections.includes(section)),
    sidebarSections,
  };
}

export function formatMetaPieces(parts: Array<string | null | undefined>) {
  return parts.filter(Boolean).join(" | ");
}
