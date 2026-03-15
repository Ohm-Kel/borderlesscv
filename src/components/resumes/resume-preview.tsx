import Link from "next/link";

import type { ResumeTemplateKey } from "@prisma/client";

import { Badge } from "@/components/ui/badge";
import { cn } from "@/lib/utils";
import type { ProfileContent } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

type PersonalDetails = {
  name: string;
  headline: string;
  location: string;
  phone: string;
};

const templateStyles: Record<ResumeTemplateKey, { wrapper: string; accent: string; chip: string }> = {
  ATLAS: {
    wrapper: "border-slate-200",
    accent: "bg-slate-950 text-white",
    chip: "bg-slate-100 text-slate-700",
  },
  HORIZON: {
    wrapper: "border-emerald-100",
    accent: "bg-emerald-900 text-white",
    chip: "bg-emerald-50 text-emerald-800",
  },
  EMBER: {
    wrapper: "border-amber-100",
    accent: "bg-amber-900 text-white",
    chip: "bg-amber-50 text-amber-800",
  },
};

function hasSectionContent(section: keyof ProfileContent, content: ProfileContent) {
  const value = content[section];
  return Array.isArray(value) ? value.length > 0 : false;
}

export function ResumePreview({
  personalDetails,
  document,
  templateKey,
  targetRole,
  targetCountry,
}: {
  personalDetails: PersonalDetails;
  document: ResumeDocument;
  templateKey: ResumeTemplateKey;
  targetRole?: string | null;
  targetCountry?: string | null;
}) {
  const styles = templateStyles[templateKey];
  const visibleSections = document.sectionOrder.filter(
    (section) => !document.hiddenSections.includes(section) && hasSectionContent(section, document.sections),
  );

  return (
    <div className={cn("surface-card min-h-[1122px] rounded-[32px] border bg-white p-8", styles.wrapper)}>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-slate-100 pb-6">
        <div>
          <h1 className="text-4xl font-semibold tracking-tight text-slate-950">{personalDetails.name || "Your Name"}</h1>
          <p className="mt-2 text-lg text-slate-600">{personalDetails.headline || "Professional headline"}</p>
        </div>
        <div className="space-y-2 text-right text-sm leading-6 text-slate-500">
          <p>{personalDetails.location}</p>
          <p>{personalDetails.phone}</p>
          {document.sections.links.map((link) => (
            <Link key={link.id} href={link.url} className="block font-medium text-slate-700">
              {link.label}
            </Link>
          ))}
        </div>
      </div>

      <div className="mt-5 flex flex-wrap gap-2">
        {targetRole ? <Badge className={styles.chip}>{targetRole}</Badge> : null}
        {targetCountry ? <Badge className={styles.chip}>{targetCountry}</Badge> : null}
        <Badge className={styles.chip}>{templateKey.toLowerCase()}</Badge>
      </div>

      {document.summary ? (
        <section className="mt-6">
          <SectionTitle accentClass={styles.accent}>Professional Summary</SectionTitle>
          <p className="mt-3 text-sm leading-7 text-slate-700">{document.summary}</p>
        </section>
      ) : null}

      <div className="mt-6 space-y-6">
        {visibleSections.map((section) => (
          <section key={section}>
            <SectionTitle accentClass={styles.accent}>
              {section === "experience"
                ? "Work Experience"
                : section === "leadership"
                  ? "Leadership & Activities"
                  : section === "volunteer"
                    ? "Volunteer Experience"
                    : section.charAt(0).toUpperCase() + section.slice(1)}
            </SectionTitle>
            <div className="mt-3">
              <SectionContent section={section} content={document.sections} chipClass={styles.chip} />
            </div>
          </section>
        ))}
      </div>
    </div>
  );
}

function SectionTitle({ children, accentClass }: { children: React.ReactNode; accentClass: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className={cn("h-2.5 w-2.5 rounded-full", accentClass)} />
      <h2 className="text-xs font-semibold uppercase tracking-[0.24em] text-slate-500">{children}</h2>
    </div>
  );
}

function SectionContent({
  section,
  content,
  chipClass,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  chipClass: string;
}) {
  if (section === "skills") {
    return (
      <div className="flex flex-wrap gap-2">
        {content.skills.map((skill) => (
          <Badge key={skill} className={chipClass}>
            {skill}
          </Badge>
        ))}
      </div>
    );
  }

  if (section === "languages") {
    return (
      <div className="space-y-2">
        {content.languages.map((item) => (
          <div key={item.id} className="flex items-center justify-between text-sm text-slate-700">
            <span>{item.name}</span>
            <span className="text-slate-500">{item.proficiency}</span>
          </div>
        ))}
      </div>
    );
  }

  if (section === "links") {
    return (
      <div className="space-y-2">
        {content.links.map((item) => (
          <Link key={item.id} href={item.url} className="block text-sm font-medium text-slate-700">
            {item.label} - {item.url}
          </Link>
        ))}
      </div>
    );
  }

  if (section === "certifications") {
    return (
      <div className="space-y-3">
        {content.certifications.map((item) => (
          <div key={item.id}>
            <p className="font-medium text-slate-900">
              {item.title} <span className="text-slate-500">· {item.issuer}</span>
            </p>
            <p className="text-sm text-slate-500">{item.date}</p>
          </div>
        ))}
      </div>
    );
  }

  if (section === "awards") {
    return (
      <div className="space-y-3">
        {content.awards.map((item) => (
          <div key={item.id}>
            <p className="font-medium text-slate-900">
              {item.title} <span className="text-slate-500">· {item.issuer}</span>
            </p>
            <p className="text-sm text-slate-500">{item.date}</p>
            {item.description ? <p className="mt-1 text-sm leading-6 text-slate-700">{item.description}</p> : null}
          </div>
        ))}
      </div>
    );
  }

  const items = content[section];

  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <div className="space-y-4">
      {items.map((item) => (
        <div key={item.id}>
          <div className="flex flex-wrap items-start justify-between gap-3">
            <div>
              <p className="font-medium text-slate-900">{item.title}</p>
              <p className="text-sm text-slate-500">
                {item.organization}
                {item.location ? ` • ${item.location}` : ""}
              </p>
            </div>
            <p className="text-sm text-slate-500">{item.date}</p>
          </div>
          {item.description ? <p className="mt-2 text-sm leading-6 text-slate-700">{item.description}</p> : null}
          {item.bullets.length ? (
            <ul className="mt-2 space-y-1.5 pl-5 text-sm leading-6 text-slate-700">
              {item.bullets.filter(Boolean).map((bullet, index) => (
                <li key={`${item.id}-${index}`} className="list-disc">
                  {bullet}
                </li>
              ))}
            </ul>
          ) : null}
        </div>
      ))}
    </div>
  );
}
