import Link from "next/link";

import type { ResumeTemplateKey } from "@prisma/client";

import {
  formatMetaPieces,
  getSectionHeading,
  getTemplateSectionGroups,
  getVisibleSections,
  TEMPLATE_THEMES,
} from "@/lib/resume-presentation";
import type { ResumeDensityMode } from "@/lib/resume-fit";
import { cn } from "@/lib/utils";
import type {
  AwardEntry,
  CertificationEntry,
  ProfileContent,
  ProfileListEntry,
} from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

type PersonalDetails = {
  name: string;
  headline: string;
  location: string;
  phone: string;
};

type LayoutVariant = "atlas" | "horizon" | "ember" | "classic";
type PreviewMode = "full" | "builder";

function getPreviewTuning(previewMode: PreviewMode, density: ResumeDensityMode) {
  const isBuilder = previewMode === "builder";
  const isCompact = density === "compact";
  const isCompressed = density === "compressed";

  return {
    shell: isBuilder ? "h-full min-h-0 rounded-[24px]" : "min-h-[1122px] rounded-[32px]",
    atlasPadding: isBuilder ? (isCompressed ? "p-4" : isCompact ? "p-5" : "p-6") : "p-8 lg:p-10",
    emberPadding: isBuilder ? (isCompressed ? "p-3.5" : isCompact ? "p-[1.125rem]" : "p-5") : "p-6 lg:p-8",
    horizonSidebarPadding: isBuilder ? (isCompressed ? "px-4 py-4" : isCompact ? "px-5 py-5" : "px-6 py-6") : "px-7 py-8 lg:px-8 lg:py-10",
    horizonMainPadding: isBuilder ? (isCompressed ? "px-4 py-4" : isCompact ? "px-5 py-5" : "px-6 py-6") : "px-7 py-8 lg:px-10 lg:py-10",
    horizonColumns: isBuilder
      ? isCompressed
        ? "lg:grid-cols-[252px_minmax(0,1fr)]"
        : isCompact
          ? "lg:grid-cols-[278px_minmax(0,1fr)]"
          : "lg:grid-cols-[320px_minmax(0,1fr)]"
      : "lg:grid-cols-[320px_minmax(0,1fr)]",
    emberColumns: isBuilder
      ? isCompressed
        ? "lg:grid-cols-[minmax(0,1.66fr)_minmax(210px,0.74fr)]"
        : isCompact
          ? "lg:grid-cols-[minmax(0,1.6fr)_minmax(224px,0.8fr)]"
          : "lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.85fr)]"
      : "lg:grid-cols-[minmax(0,1.55fr)_minmax(240px,0.85fr)]",
    headerPadding: isBuilder ? "px-5 py-5" : "px-6 py-7 lg:px-8",
    title: isBuilder
      ? isCompressed
        ? "text-[1.82rem] leading-tight"
        : isCompact
          ? "text-[1.96rem] leading-tight"
          : "text-[2.15rem] leading-tight"
      : "text-4xl font-semibold tracking-tight",
    headline: isBuilder
      ? isCompressed
        ? "mt-1.5 text-[0.78rem] leading-[1.45]"
        : isCompact
          ? "mt-2 text-[0.84rem] leading-[1.52]"
          : "mt-2.5 text-[0.92rem] leading-[1.65]"
      : "mt-3 text-base leading-7",
    meta: isBuilder ? (isCompressed ? "text-[0.7rem] leading-[1.4]" : isCompact ? "text-[0.74rem] leading-[1.44]" : "text-[0.76rem] leading-[1.5]") : "text-sm leading-6",
    summaryCard: isBuilder ? (isCompressed ? "rounded-[20px] p-3.5" : isCompact ? "rounded-[21px] p-3.5" : "rounded-[22px] p-4") : "rounded-[28px] p-5 lg:p-6",
    summaryText: isBuilder
      ? isCompressed
        ? "mt-2 text-[0.72rem] leading-[1.48]"
        : isCompact
          ? "mt-2 text-[0.76rem] leading-[1.54]"
          : "mt-2.5 text-[0.8rem] leading-[1.65]"
      : "mt-3 text-sm leading-7",
    sectionCard: isBuilder ? (isCompressed ? "rounded-[20px] p-3.5" : isCompact ? "rounded-[21px] p-3.5" : "rounded-[22px] p-4") : "rounded-[28px] p-5",
    sectionStack: isBuilder ? (isCompressed ? "space-y-3.5" : isCompact ? "space-y-4" : "space-y-5") : "space-y-8",
    atlasHeading: isBuilder ? "text-[0.62rem] font-semibold uppercase tracking-[0.22em] text-slate-500" : "text-xs font-semibold uppercase tracking-[0.24em] text-slate-500",
    otherHeading: isBuilder ? (isCompressed ? "mt-2 text-[0.68rem] font-semibold uppercase tracking-[0.22em] text-slate-700" : "mt-2.5 text-[0.72rem] font-semibold uppercase tracking-[0.22em] text-slate-700") : "mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-700",
    sectionBody: isBuilder ? (isCompressed ? "mt-2.5" : "mt-3") : "mt-4",
    entryStack: isBuilder ? (isCompressed ? "space-y-3" : isCompact ? "space-y-3.5" : "space-y-3.5") : "space-y-4",
    entryHeader: isBuilder ? "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-3 gap-y-1" : "grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-4 gap-y-1.5",
    titleText: isBuilder ? (isCompressed ? "text-[0.82rem] leading-[1.35]" : isCompact ? "text-[0.85rem] leading-[1.38]" : "text-[0.88rem] leading-[1.4]") : "text-base leading-6",
    dateText: isBuilder ? (isCompressed ? "pt-0.5 text-[0.7rem] leading-[1.35] text-right text-slate-500" : "pt-0.5 text-[0.74rem] leading-[1.4] text-right text-slate-500") : "text-sm leading-6 text-right text-slate-500",
    entryMeta: isBuilder ? (isCompressed ? "text-[0.7rem] leading-[1.38] text-slate-500" : isCompact ? "text-[0.74rem] leading-[1.42] text-slate-500" : "text-[0.76rem] leading-[1.5] text-slate-500") : "text-sm leading-6 text-slate-500",
    entryDescription: isBuilder ? (isCompressed ? "mt-1 text-[0.72rem] leading-[1.45] text-slate-700" : isCompact ? "mt-1.5 text-[0.75rem] leading-[1.48] text-slate-700" : "mt-1.5 text-[0.78rem] leading-[1.55] text-slate-700") : "mt-2 text-sm leading-6 text-slate-700",
    bulletList: isBuilder ? (isCompressed ? "mt-1.5 space-y-0.5 pl-4 text-[0.72rem] leading-[1.42] text-slate-700" : isCompact ? "mt-2 space-y-0.5 pl-4 text-[0.75rem] leading-[1.48] text-slate-700" : "mt-2 space-y-1 pl-4 text-[0.78rem] leading-[1.55] text-slate-700") : "mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700",
    chip: isBuilder ? (isCompressed ? "rounded-full border px-2 py-0.5 text-[0.68rem] font-medium" : isCompact ? "rounded-full border px-2.5 py-0.5 text-[0.7rem] font-medium" : "rounded-full border px-2.5 py-1 text-[0.72rem] font-medium") : "rounded-full border px-3 py-1.5 text-xs font-medium",
    statText: isBuilder ? (isCompressed ? "text-[0.72rem] text-slate-700" : isCompact ? "text-[0.75rem] text-slate-700" : "text-[0.78rem] text-slate-700") : "text-sm text-slate-700",
    linkText: isBuilder ? (isCompressed ? "block text-[0.72rem] leading-[1.42] text-slate-700 underline-offset-4 hover:underline" : isCompact ? "block text-[0.75rem] leading-[1.45] text-slate-700 underline-offset-4 hover:underline" : "block text-[0.78rem] leading-[1.5] text-slate-700 underline-offset-4 hover:underline") : "block text-sm leading-6 text-slate-700 underline-offset-4 hover:underline",
    linkMeta: isBuilder ? (isCompressed ? "block text-[0.64rem] text-slate-500" : isCompact ? "block text-[0.67rem] text-slate-500" : "block text-[0.7rem] text-slate-500") : "block text-xs text-slate-500",
  };
}

export function ResumePreview({
  personalDetails,
  document,
  templateKey,
  density = "balanced",
  previewMode = "full",
}: {
  personalDetails: PersonalDetails;
  document: ResumeDocument;
  templateKey: ResumeTemplateKey;
  density?: ResumeDensityMode;
  previewMode?: PreviewMode;
}) {
  const theme = TEMPLATE_THEMES[templateKey];
  const visibleSections = getVisibleSections(document);
  const sectionGroups = getTemplateSectionGroups(templateKey, visibleSections);
  const contactLine = formatMetaPieces([personalDetails.location, personalDetails.phone]);
  const tuning = getPreviewTuning(previewMode, density);

  if (templateKey === "CLASSIC") {
    const visibleSections = getVisibleSections(document);
    const email = "";
    const isBuilder = previewMode === "builder";
    const contactParts = [
      personalDetails.phone,
      personalDetails.location,
    ].filter(Boolean);

    return (
      <div
        className={cn(
          "h-full overflow-hidden border border-gray-400 bg-white font-serif text-black",
          tuning.shell,
          isBuilder ? "p-5" : "p-8 lg:p-10",
        )}
      >
        {/* ── Name ── */}
        <div className="text-center">
          <h1
            className={cn(
              "font-bold leading-tight tracking-normal",
              isBuilder ? "text-[1.15rem]" : "text-[1.6rem]",
            )}
          >
            {personalDetails.name || "Your Name"}
          </h1>
          <p
            className={cn(
              "mt-1 leading-tight text-black",
              isBuilder ? "text-[0.65rem]" : "text-sm",
            )}
          >
            {contactParts.join(" | ") || "City, Country | Phone"}
          </p>
        </div>

        {/* ── Professional Summary ── */}
        {document.summary ? (
          <div className={isBuilder ? "mt-2.5" : "mt-4"}>
            <div className={cn("border-b border-black", isBuilder ? "mb-1" : "mb-1.5")}>
              <p
                className={cn(
                  "font-bold uppercase leading-none",
                  isBuilder ? "text-[0.62rem] pb-0.5" : "text-[0.82rem] pb-1",
                )}
              >
                Professional Summary
              </p>
            </div>
            <p className={cn("leading-snug text-black", isBuilder ? "text-[0.65rem]" : "text-[0.82rem]")}>
              {document.summary}
            </p>
          </div>
        ) : null}

        {/* ── Sections ── */}
        <div className={cn(isBuilder ? "mt-2.5 space-y-2" : "mt-4 space-y-3")}>
          {visibleSections.map((section) => (
            <ClassicPreviewSection
              key={section}
              section={section}
              content={document.sections}
              labelOverrides={document.sectionLabelOverrides}
              isBuilder={isBuilder}
            />
          ))}
        </div>
      </div>
    );
  }

  if (templateKey === "HORIZON") {
    return (
      <div className={cn("surface-card h-full overflow-hidden border", tuning.shell, theme.preview.shell)}>
        <div className={cn("grid h-full min-h-full", tuning.horizonColumns)}>
          <aside className={cn("flex flex-col gap-5", tuning.horizonSidebarPadding, theme.preview.sidebar)}>
            <div>
              <h1 className={cn("font-semibold tracking-tight", tuning.title, theme.preview.title)}>{personalDetails.name || "Your Name"}</h1>
              <p className={cn(tuning.headline, theme.preview.muted)}>{personalDetails.headline || "Professional headline"}</p>
            </div>
            <div className={cn("rounded-[22px] border border-white/70 bg-white/80 shadow-sm", tuning.sectionCard)}>
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">Contact</p>
              <div className={cn("mt-3 space-y-2", tuning.statText)}>
                <p>{personalDetails.location || "City, Country"}</p>
                <p>{personalDetails.phone || "Phone number"}</p>
              </div>
            </div>
            {document.summary ? (
              <div className={cn("rounded-[22px] border border-white/70 bg-white shadow-sm", tuning.sectionCard)}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">Profile</p>
                <p className={cn(tuning.summaryText, "text-slate-700")}>{document.summary}</p>
              </div>
            ) : null}
            {sectionGroups.sidebarSections.map((section) => (
              <PreviewSection
                key={section}
                section={section}
                content={document.sections}
                layout="horizon"
                accentClass={theme.preview.accent}
                accentSoftClass={theme.preview.accentSoft}
                badgeClass={theme.preview.badge}
                previewMode={previewMode}
                density={density}
              />
            ))}
          </aside>

          <main className={tuning.horizonMainPadding}>
            <div className={tuning.sectionStack}>
              {sectionGroups.mainSections.map((section) => (
                <PreviewSection
                  key={section}
                  section={section}
                  content={document.sections}
                  layout="horizon"
                  accentClass={theme.preview.accent}
                  accentSoftClass={theme.preview.accentSoft}
                  badgeClass={theme.preview.badge}
                  previewMode={previewMode}
                  density={density}
                />
              ))}
            </div>
          </main>
        </div>
      </div>
    );
  }

  if (templateKey === "EMBER") {
    return (
      <div className={cn("surface-card h-full border", tuning.shell, tuning.emberPadding, theme.preview.shell)}>
        <header className={cn("rounded-[28px] bg-slate-950 text-white", tuning.headerPadding)}>
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <h1 className={cn("font-semibold tracking-tight", tuning.title)}>{personalDetails.name || "Your Name"}</h1>
              <p className={cn(tuning.headline, "text-slate-300")}>{personalDetails.headline || "Professional headline"}</p>
            </div>
            <div className={cn("space-y-2 text-right text-slate-300", tuning.meta)}>
              <p>{personalDetails.location || "City, Country"}</p>
              <p>{personalDetails.phone || "Phone number"}</p>
            </div>
          </div>
          <div className="mt-5 h-px bg-white/15" />
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {contactLine || "Add your contact details to strengthen recruiter trust."}
          </p>
        </header>

          <div className={cn("mt-5 grid gap-5", tuning.emberColumns)}>
          <div className={tuning.sectionStack}>
            {document.summary ? (
              <section className={cn("border", tuning.summaryCard, theme.preview.badge)}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-900">Professional summary</p>
                <p className={cn(tuning.summaryText, "text-slate-700")}>{document.summary}</p>
              </section>
            ) : null}
            {sectionGroups.mainSections.map((section) => (
              <PreviewSection
                key={section}
                section={section}
                content={document.sections}
                layout="ember"
                accentClass={theme.preview.accent}
                accentSoftClass={theme.preview.accentSoft}
                badgeClass={theme.preview.badge}
                previewMode={previewMode}
                density={density}
              />
            ))}
          </div>
          <aside className={cn(density === "compressed" && previewMode === "builder" ? "space-y-3" : "space-y-4")}>
            {sectionGroups.sidebarSections.map((section) => (
              <PreviewSection
                key={section}
                section={section}
                content={document.sections}
                layout="ember"
                accentClass={theme.preview.accent}
                accentSoftClass={theme.preview.accentSoft}
                badgeClass={theme.preview.badge}
                previewMode={previewMode}
                density={density}
              />
            ))}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("surface-card h-full border bg-white", tuning.shell, tuning.atlasPadding, theme.preview.shell)}>
      <header className={cn("border-b", isBuilderPreviewClass(previewMode) ? "pb-4" : "pb-6", theme.preview.divider)}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className={cn("font-semibold tracking-tight", tuning.title, theme.preview.title)}>{personalDetails.name || "Your Name"}</h1>
            <p className={cn(tuning.headline, theme.preview.muted)}>{personalDetails.headline || "Professional headline"}</p>
          </div>
          <div className={cn("max-w-xs space-y-2 text-right text-slate-500", tuning.meta)}>
            <p>{personalDetails.location || "City, Country"}</p>
            <p>{personalDetails.phone || "Phone number"}</p>
          </div>
        </div>
      </header>

      {document.summary ? (
        <section className={cn("mt-5 border", tuning.summaryCard, theme.preview.badge)}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700">Professional summary</p>
          <p className={cn(tuning.summaryText, "text-slate-700")}>{document.summary}</p>
        </section>
      ) : null}

      <div className={cn("mt-6", tuning.sectionStack)}>
        {sectionGroups.mainSections.map((section) => (
          <PreviewSection
            key={section}
            section={section}
            content={document.sections}
            layout="atlas"
            accentClass={theme.preview.accent}
            accentSoftClass={theme.preview.accentSoft}
            badgeClass={theme.preview.badge}
            previewMode={previewMode}
            density={density}
          />
        ))}
      </div>
    </div>
  );
}

function PreviewSection({
  section,
  content,
  layout,
  accentClass,
  accentSoftClass,
  badgeClass,
  previewMode,
  density,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: LayoutVariant;
  accentClass: string;
  accentSoftClass: string;
  badgeClass: string;
  previewMode: PreviewMode;
  density: ResumeDensityMode;
}) {
  const tuning = getPreviewTuning(previewMode, density);
  const heading = getSectionHeading(section);
  const isSidebarSection = layout !== "atlas" && ["skills", "languages", "certifications", "awards", "links"].includes(section);

  return (
    <section
      className={cn(
        layout === "atlas" ? "" : cn("border border-slate-200/70 bg-white shadow-sm", tuning.sectionCard),
        layout === "ember" && isSidebarSection ? "bg-stone-50" : "",
      )}
    >
      <SectionHeading layout={layout} accentClass={accentClass} accentSoftClass={accentSoftClass} previewMode={previewMode} density={density}>
        {heading}
      </SectionHeading>
      <div className={cn(layout === "atlas" ? "mt-3" : tuning.sectionBody)}>
        <SectionContent section={section} content={content} layout={layout} badgeClass={badgeClass} previewMode={previewMode} density={density} />
      </div>
    </section>
  );
}

function SectionHeading({
  children,
  layout,
  accentClass,
  accentSoftClass,
  previewMode,
  density,
}: {
  children: React.ReactNode;
  layout: LayoutVariant;
  accentClass: string;
  accentSoftClass: string;
  previewMode: PreviewMode;
  density: ResumeDensityMode;
}) {
  const tuning = getPreviewTuning(previewMode, density);

  if (layout === "atlas") {
    return (
      <div className="flex items-center gap-3">
        <div className={cn("h-2.5 w-2.5 rounded-full", accentClass)} />
        <h2 className={tuning.atlasHeading}>{children}</h2>
      </div>
    );
  }

  if (layout === "horizon") {
    return (
      <div>
        <div className={cn("h-1.5 w-12 rounded-full", accentClass)} />
        <h2 className={tuning.otherHeading}>{children}</h2>
      </div>
    );
  }

  return (
    <div className={cn("inline-flex rounded-full px-3 py-1.5", accentSoftClass)}>
      <h2 className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-900">{children}</h2>
    </div>
  );
}

function SectionContent({
  section,
  content,
  layout,
  badgeClass,
  previewMode,
  density,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: LayoutVariant;
  badgeClass: string;
  previewMode: PreviewMode;
  density: ResumeDensityMode;
}) {
  const tuning = getPreviewTuning(previewMode, density);

  if (section === "skills") {
    return (
      <div className="flex flex-wrap gap-2">
        {content.skills.map((skill) => (
          <span key={skill} className={cn(tuning.chip, badgeClass)}>
            {skill}
          </span>
        ))}
      </div>
    );
  }

  if (section === "languages") {
    return (
      <div className="space-y-2.5">
        {content.languages.map((item) => (
          <div key={item.id} className={cn("flex items-center justify-between gap-3", tuning.statText)}>
            <span>{item.name}</span>
            <span className="text-slate-500">{item.proficiency}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section === "links") {
    return (
      <div className="space-y-2.5">
        {content.links.map((item) => (
          <Link key={item.id} href={item.url} className={tuning.linkText}>
            {item.label}
            <span className={tuning.linkMeta}>{item.url}</span>
          </Link>
        ))}
      </div>
    );
  }

  if (section === "certifications") {
    return <CredentialList items={content.certifications} layout={layout} previewMode={previewMode} density={density} />;
  }

  if (section === "awards") {
    return <AwardList items={content.awards} layout={layout} previewMode={previewMode} density={density} />;
  }

  const items = content[section];

  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <div className={cn(layout === "ember" ? (previewMode === "builder" ? "space-y-4" : "space-y-5") : tuning.entryStack)}>
      {items.map((item) => (
        <EntryCard key={item.id} item={item} layout={layout} previewMode={previewMode} density={density} />
      ))}
    </div>
  );
}

function EntryCard({
  item,
  layout,
  previewMode,
  density,
}: {
  item: ProfileListEntry;
  layout: LayoutVariant;
  previewMode: PreviewMode;
  density: ResumeDensityMode;
}) {
  const tuning = getPreviewTuning(previewMode, density);

  return (
    <article className={cn(layout === "ember" ? "border-b border-stone-200 pb-5 last:border-b-0 last:pb-0" : "")}>
      <div className={tuning.entryHeader}>
        <div className="min-w-0">
          <p className={cn("font-semibold text-slate-900", tuning.titleText)}>{item.title}</p>
          <p className={tuning.entryMeta}>{formatMetaPieces([item.organization, item.location])}</p>
        </div>
        <p className={cn("font-medium whitespace-nowrap", tuning.dateText)}>{item.date}</p>
      </div>
      {item.description ? <p className={tuning.entryDescription}>{item.description}</p> : null}
      {item.bullets.filter(Boolean).length ? (
        <ul className={tuning.bulletList}>
          {item.bullets.filter(Boolean).map((bullet, index) => (
            <li key={`${item.id}-${index}`} className="list-disc">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
      {item.url ? (
        <Link href={item.url} className={cn("mt-2 inline-block font-medium text-slate-600 underline-offset-4 hover:underline", previewMode === "builder" ? "text-[0.76rem]" : "text-sm")}>
          {item.url}
        </Link>
      ) : null}
    </article>
  );
}

function CredentialList({
  items,
  layout,
  previewMode,
  density,
}: {
  items: CertificationEntry[];
  layout: LayoutVariant;
  previewMode: PreviewMode;
  density: ResumeDensityMode;
}) {
  const tuning = getPreviewTuning(previewMode, density);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className={cn(layout === "ember" ? cn("rounded-[22px] border border-stone-200 bg-white", previewMode === "builder" ? "p-3.5" : "p-4") : "")}>
          <p className="font-semibold text-slate-900">{item.title}</p>
          <p className={tuning.entryMeta}>{formatMetaPieces([item.issuer, item.date])}</p>
          {item.credentialId ? <p className={tuning.entryDescription}>Credential ID: {item.credentialId}</p> : null}
          {item.url ? (
            <Link href={item.url} className={cn("font-medium text-slate-600 underline-offset-4 hover:underline", previewMode === "builder" ? "text-[0.76rem]" : "text-sm")}>
              {item.url}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function AwardList({
  items,
  layout,
  previewMode,
  density,
}: {
  items: AwardEntry[];
  layout: LayoutVariant;
  previewMode: PreviewMode;
  density: ResumeDensityMode;
}) {
  const tuning = getPreviewTuning(previewMode, density);

  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className={cn(layout === "ember" ? cn("rounded-[22px] border border-stone-200 bg-white", previewMode === "builder" ? "p-3.5" : "p-4") : "")}>
          <p className="font-semibold text-slate-900">{item.title}</p>
          <p className={tuning.entryMeta}>{formatMetaPieces([item.issuer, item.date])}</p>
          {item.description ? <p className={tuning.entryDescription}>{item.description}</p> : null}
        </article>
      ))}
    </div>
  );
}

function isBuilderPreviewClass(previewMode: PreviewMode) {
  return previewMode === "builder";
}

// ─────────────────────────────────────────────────────────────
// CLASSIC template components
// ─────────────────────────────────────────────────────────────

function ClassicPreviewSection({
  section,
  content,
  labelOverrides,
  isBuilder,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  labelOverrides: Record<string, string>;
  isBuilder: boolean;
}) {
  const heading = getSectionHeading(section as Parameters<typeof getSectionHeading>[0], labelOverrides);
  const titleSize = isBuilder ? "text-[0.62rem]" : "text-[0.78rem]";
  const bodySize = isBuilder ? "text-[0.63rem]" : "text-[0.78rem]";
  const metaSize = isBuilder ? "text-[0.6rem]" : "text-[0.73rem]";

  return (
    <section>
      {/* Section heading: BOLD ALL-CAPS with underline rule */}
      <div className={cn("border-b border-black", isBuilder ? "mb-1 pb-0.5" : "mb-1.5 pb-1")}>
        <h2 className={cn("font-bold uppercase tracking-wide", titleSize)}>{heading}</h2>
      </div>

      {/* Skills: "Computer/Technical: skill1, skill2" */}
      {section === "skills" && content.skills.length > 0 && (
        <p className={cn("leading-snug text-black", bodySize)}>
          <strong>Computer/Technical:</strong> {content.skills.join(", ")}
        </p>
      )}

      {/* Languages: "Languages: English [Native]" */}
      {section === "languages" && content.languages.length > 0 && (
        <p className={cn("leading-snug text-black", bodySize)}>
          <strong>Languages:</strong>{" "}
          {content.languages.map((l) => `${l.name}${l.proficiency ? ` [${l.proficiency}]` : ""}`).join(", ")}
        </p>
      )}

      {/* Certifications: grouped as prose */}
      {section === "certifications" && content.certifications.length > 0 && (
        <p className={cn("leading-snug text-black", bodySize)}>
          <strong>Certifications:</strong>{" "}
          {content.certifications
            .map((c) => `${c.issuer ? `${c.issuer} — ` : ""}${c.title}${c.date ? ` [${c.date}]` : ""}`)
            .join("; ")}
        </p>
      )}

      {/* Awards */}
      {section === "awards" && content.awards.length > 0 && (
        <div className={cn("space-y-1", isBuilder ? "mt-0.5" : "mt-1")}>
          {content.awards.map((award) => (
            <div key={award.id} className="grid grid-cols-[minmax(0,1fr)_auto] items-start gap-x-2">
              <div>
                <p className={cn("font-bold leading-snug", bodySize)}>{award.title}</p>
                {award.issuer ? <p className={cn("leading-snug italic", metaSize)}>{award.issuer}</p> : null}
                {award.description ? <p className={cn("leading-snug", metaSize)}>{award.description}</p> : null}
              </div>
              {award.date ? <p className={cn("whitespace-nowrap text-right leading-snug", metaSize)}>{award.date}</p> : null}
            </div>
          ))}
        </div>
      )}

      {/* Links */}
      {section === "links" && content.links.length > 0 && (
        <p className={cn("leading-snug text-black", bodySize)}>
          {content.links.map((l) => l.label || l.url).join(" | ")}
        </p>
      )}

      {/* Entry-based sections: experience, internships, projects, education, leadership, volunteer */}
      {(["experience", "internships", "projects", "education", "leadership", "volunteer"] as const).includes(
        section as "experience",
      ) &&
        Array.isArray(content[section]) &&
        (content[section] as ProfileListEntry[]).map((item) => (
          <ClassicEntryCard key={item.id} item={item} isBuilder={isBuilder} />
        ))}
    </section>
  );
}

function ClassicEntryCard({
  item,
  isBuilder,
}: {
  item: ProfileListEntry;
  isBuilder: boolean;
}) {
  const bodySize = isBuilder ? "text-[0.63rem]" : "text-[0.78rem]";
  const metaSize = isBuilder ? "text-[0.6rem]" : "text-[0.73rem]";

  return (
    <article className={isBuilder ? "mt-1" : "mt-1.5"}>
      {/* Row 1: bold org + date right-aligned */}
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-baseline gap-x-2">
        <p className={cn("font-bold leading-snug", bodySize)}>
          {item.title}
          {item.organization ? (
            <span className="font-normal">, <em>{item.organization}</em></span>
          ) : null}
          {item.location ? <span className="font-normal"> – {item.location}</span> : null}
        </p>
        {item.date ? (
          <p className={cn("whitespace-nowrap text-right leading-snug", metaSize)}>{item.date}</p>
        ) : null}
      </div>

      {/* Description paragraph */}
      {item.description ? (
        <p className={cn("leading-snug", metaSize)}>{item.description}</p>
      ) : null}

      {/* Bullet list */}
      {item.bullets.filter(Boolean).length > 0 && (
        <ul className={cn("list-none leading-snug", isBuilder ? "mt-0.5 space-y-0 pl-3" : "mt-1 space-y-0.5 pl-4")}>
          {item.bullets.filter(Boolean).map((bullet, i) => (
            <li key={i} className={cn("flex gap-1.5", bodySize)}>
              <span className="shrink-0 select-none">•</span>
              <span>{bullet}</span>
            </li>
          ))}
        </ul>
      )}
    </article>
  );
}
