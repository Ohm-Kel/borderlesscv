import Link from "next/link";

import type { ResumeTemplateKey } from "@prisma/client";

import {
  formatMetaPieces,
  getSectionHeading,
  getTemplateSectionGroups,
  getVisibleSections,
  TEMPLATE_THEMES,
} from "@/lib/resume-presentation";
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

type LayoutVariant = "atlas" | "horizon" | "ember";

export function ResumePreview({
  personalDetails,
  document,
  templateKey,
}: {
  personalDetails: PersonalDetails;
  document: ResumeDocument;
  templateKey: ResumeTemplateKey;
}) {
  const theme = TEMPLATE_THEMES[templateKey];
  const visibleSections = getVisibleSections(document);
  const sectionGroups = getTemplateSectionGroups(templateKey, visibleSections);
  const contactLine = formatMetaPieces([personalDetails.location, personalDetails.phone]);

  if (templateKey === "HORIZON") {
    return (
      <div className={cn("surface-card min-h-[1122px] overflow-hidden rounded-[32px] border", theme.preview.shell)}>
        <div className="grid min-h-[1122px] lg:grid-cols-[320px_minmax(0,1fr)]">
          <aside className={cn("flex flex-col gap-6 px-7 py-8 lg:px-8 lg:py-10", theme.preview.sidebar)}>
            <div>
              <h1 className={cn("text-4xl font-semibold tracking-tight", theme.preview.title)}>{personalDetails.name || "Your Name"}</h1>
              <p className={cn("mt-3 text-base leading-7", theme.preview.muted)}>{personalDetails.headline || "Professional headline"}</p>
            </div>
            <div className="rounded-[28px] border border-white/70 bg-white/80 p-5 shadow-sm">
              <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">Contact</p>
              <div className="mt-3 space-y-2 text-sm leading-6 text-slate-700">
                <p>{personalDetails.location || "City, Country"}</p>
                <p>{personalDetails.phone || "Phone number"}</p>
              </div>
            </div>
            {document.summary ? (
              <div className="rounded-[28px] border border-white/70 bg-white p-5 shadow-sm">
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-emerald-800">Profile</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{document.summary}</p>
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
              />
            ))}
          </aside>

          <main className="px-7 py-8 lg:px-10 lg:py-10">
            <div className="space-y-8">
              {sectionGroups.mainSections.map((section) => (
                <PreviewSection
                  key={section}
                  section={section}
                  content={document.sections}
                  layout="horizon"
                  accentClass={theme.preview.accent}
                  accentSoftClass={theme.preview.accentSoft}
                  badgeClass={theme.preview.badge}
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
      <div className={cn("surface-card min-h-[1122px] rounded-[32px] border p-6 lg:p-8", theme.preview.shell)}>
        <header className="rounded-[30px] bg-slate-950 px-6 py-7 text-white lg:px-8">
          <div className="flex flex-wrap items-start justify-between gap-5">
            <div className="max-w-2xl">
              <h1 className="text-4xl font-semibold tracking-tight">{personalDetails.name || "Your Name"}</h1>
              <p className="mt-3 text-base leading-7 text-slate-300">{personalDetails.headline || "Professional headline"}</p>
            </div>
            <div className="space-y-2 text-right text-sm leading-6 text-slate-300">
              <p>{personalDetails.location || "City, Country"}</p>
              <p>{personalDetails.phone || "Phone number"}</p>
            </div>
          </div>
          <div className="mt-5 h-px bg-white/15" />
          <p className="mt-4 text-sm leading-7 text-slate-300">
            {contactLine || "Add your contact details to strengthen recruiter trust."}
          </p>
        </header>

        <div className="mt-6 grid gap-6 lg:grid-cols-[minmax(0,1.55fr)_minmax(250px,0.85fr)]">
          <div className="space-y-6">
            {document.summary ? (
              <section className={cn("rounded-[28px] border p-5", theme.preview.badge)}>
                <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-orange-900">Professional summary</p>
                <p className="mt-3 text-sm leading-7 text-slate-700">{document.summary}</p>
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
              />
            ))}
          </div>
          <aside className="space-y-4">
            {sectionGroups.sidebarSections.map((section) => (
              <PreviewSection
                key={section}
                section={section}
                content={document.sections}
                layout="ember"
                accentClass={theme.preview.accent}
                accentSoftClass={theme.preview.accentSoft}
                badgeClass={theme.preview.badge}
              />
            ))}
          </aside>
        </div>
      </div>
    );
  }

  return (
    <div className={cn("surface-card min-h-[1122px] rounded-[32px] border bg-white p-8 lg:p-10", theme.preview.shell)}>
      <header className={cn("border-b pb-6", theme.preview.divider)}>
        <div className="flex flex-wrap items-start justify-between gap-6">
          <div className="max-w-2xl">
            <h1 className={cn("text-4xl font-semibold tracking-tight", theme.preview.title)}>{personalDetails.name || "Your Name"}</h1>
            <p className={cn("mt-3 text-lg leading-7", theme.preview.muted)}>{personalDetails.headline || "Professional headline"}</p>
          </div>
          <div className="max-w-xs space-y-2 text-right text-sm leading-6 text-slate-500">
            <p>{personalDetails.location || "City, Country"}</p>
            <p>{personalDetails.phone || "Phone number"}</p>
          </div>
        </div>
      </header>

      {document.summary ? (
        <section className={cn("mt-7 rounded-[28px] border p-6", theme.preview.badge)}>
          <p className="text-[11px] font-semibold uppercase tracking-[0.24em] text-slate-700">Professional summary</p>
          <p className="mt-3 text-sm leading-7 text-slate-700">{document.summary}</p>
        </section>
      ) : null}

      <div className="mt-8 space-y-8">
        {sectionGroups.mainSections.map((section) => (
          <PreviewSection
            key={section}
            section={section}
            content={document.sections}
            layout="atlas"
            accentClass={theme.preview.accent}
            accentSoftClass={theme.preview.accentSoft}
            badgeClass={theme.preview.badge}
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
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: LayoutVariant;
  accentClass: string;
  accentSoftClass: string;
  badgeClass: string;
}) {
  const heading = getSectionHeading(section);
  const isSidebarSection = layout !== "atlas" && ["skills", "languages", "certifications", "awards", "links"].includes(section);

  return (
    <section
      className={cn(
        layout === "atlas" ? "" : "rounded-[28px] border border-slate-200/70 bg-white p-5 shadow-sm",
        layout === "ember" && isSidebarSection ? "bg-stone-50" : "",
      )}
    >
      <SectionHeading layout={layout} accentClass={accentClass} accentSoftClass={accentSoftClass}>
        {heading}
      </SectionHeading>
      <div className={cn(layout === "atlas" ? "mt-3" : "mt-4")}>
        <SectionContent section={section} content={content} layout={layout} badgeClass={badgeClass} />
      </div>
    </section>
  );
}

function SectionHeading({
  children,
  layout,
  accentClass,
  accentSoftClass,
}: {
  children: React.ReactNode;
  layout: LayoutVariant;
  accentClass: string;
  accentSoftClass: string;
}) {
  if (layout === "atlas") {
    return (
      <div className="flex items-center gap-3">
        <div className={cn("h-2.5 w-2.5 rounded-full", accentClass)} />
        <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{children}</h2>
      </div>
    );
  }

  if (layout === "horizon") {
    return (
      <div>
        <div className={cn("h-1.5 w-12 rounded-full", accentClass)} />
        <h2 className="mt-3 text-sm font-semibold uppercase tracking-[0.22em] text-slate-700">{children}</h2>
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
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: LayoutVariant;
  badgeClass: string;
}) {
  if (section === "skills") {
    return (
      <div className="flex flex-wrap gap-2">
        {content.skills.map((skill) => (
          <span key={skill} className={cn("rounded-full border px-3 py-1.5 text-xs font-medium", badgeClass)}>
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
          <div key={item.id} className="flex items-center justify-between gap-3 text-sm text-slate-700">
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
          <Link key={item.id} href={item.url} className="block text-sm leading-6 text-slate-700 underline-offset-4 hover:underline">
            {item.label}
            <span className="block text-xs text-slate-500">{item.url}</span>
          </Link>
        ))}
      </div>
    );
  }

  if (section === "certifications") {
    return <CredentialList items={content.certifications} layout={layout} />;
  }

  if (section === "awards") {
    return <AwardList items={content.awards} layout={layout} />;
  }

  const items = content[section];

  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <div className={cn(layout === "ember" ? "space-y-5" : "space-y-4")}>
      {items.map((item) => (
        <EntryCard key={item.id} item={item} layout={layout} />
      ))}
    </div>
  );
}

function EntryCard({ item, layout }: { item: ProfileListEntry; layout: LayoutVariant }) {
  return (
    <article className={cn(layout === "ember" ? "border-b border-stone-200 pb-5 last:border-b-0 last:pb-0" : "")}>
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <p className="font-semibold text-slate-900">{item.title}</p>
          <p className="text-sm leading-6 text-slate-500">{formatMetaPieces([item.organization, item.location])}</p>
        </div>
        <p className="text-sm font-medium text-slate-500">{item.date}</p>
      </div>
      {item.description ? <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p> : null}
      {item.bullets.filter(Boolean).length ? (
        <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
          {item.bullets.filter(Boolean).map((bullet, index) => (
            <li key={`${item.id}-${index}`} className="list-disc">
              {bullet}
            </li>
          ))}
        </ul>
      ) : null}
      {item.url ? (
        <Link href={item.url} className="mt-2 inline-block text-sm font-medium text-slate-600 underline-offset-4 hover:underline">
          {item.url}
        </Link>
      ) : null}
    </article>
  );
}

function CredentialList({ items, layout }: { items: CertificationEntry[]; layout: LayoutVariant }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className={cn(layout === "ember" ? "rounded-[22px] border border-stone-200 bg-white p-4" : "")}>
          <p className="font-semibold text-slate-900">{item.title}</p>
          <p className="text-sm leading-6 text-slate-500">{formatMetaPieces([item.issuer, item.date])}</p>
          {item.credentialId ? <p className="text-sm leading-6 text-slate-700">Credential ID: {item.credentialId}</p> : null}
          {item.url ? (
            <Link href={item.url} className="text-sm font-medium text-slate-600 underline-offset-4 hover:underline">
              {item.url}
            </Link>
          ) : null}
        </article>
      ))}
    </div>
  );
}

function AwardList({ items, layout }: { items: AwardEntry[]; layout: LayoutVariant }) {
  return (
    <div className="space-y-3">
      {items.map((item) => (
        <article key={item.id} className={cn(layout === "ember" ? "rounded-[22px] border border-stone-200 bg-white p-4" : "")}>
          <p className="font-semibold text-slate-900">{item.title}</p>
          <p className="text-sm leading-6 text-slate-500">{formatMetaPieces([item.issuer, item.date])}</p>
          {item.description ? <p className="mt-1 text-sm leading-6 text-slate-700">{item.description}</p> : null}
        </article>
      ))}
    </div>
  );
}
