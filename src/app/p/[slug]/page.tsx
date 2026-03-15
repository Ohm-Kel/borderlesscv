import Link from "next/link";
import { notFound } from "next/navigation";

import { Badge } from "@/components/ui/badge";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { Logo } from "@/components/shared/logo";
import { parseProfileContent } from "@/lib/serializers";
import { buildResumeDocumentFromProfile } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";

const countryFlags: Record<string, string> = {
  GHANA: "🇬🇭",
  UK: "🇬🇧",
  USA: "🇺🇸",
  CANADA: "🇨🇦",
  EUROPE: "🇪🇺",
  REMOTE: "🌐",
};

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await prisma.user.findFirst({
    where: { publicProfileSlug: slug, publicProfileEnabled: true },
    include: { masterProfile: true },
  });

  if (!user) {
    notFound();
  }

  const content = parseProfileContent(user.masterProfile);
  const document = buildResumeDocumentFromProfile(
    content,
    user.masterProfile?.professionalSummary || "",
    user.targetCountries[0] || "REMOTE",
    user.experienceLevel,
  );

  const initials = (user.name || "?")
    .split(" ")
    .slice(0, 2)
    .map((part) => part[0]?.toUpperCase())
    .join("");

  return (
    <div className="mesh-bg min-h-screen">

      {/* ── Top nav bar ─────────────────────────────────────── */}
      <header className="border-b border-slate-200/60 bg-white/85 px-6 py-4 backdrop-blur-sm">
        <div className="mx-auto flex max-w-5xl items-center justify-between gap-4">
          <Logo />
          <Badge className="border border-slate-200 bg-white/85 text-slate-600 shadow-sm">
            Public profile
          </Badge>
        </div>
      </header>

      <div className="mx-auto max-w-5xl space-y-6 px-4 py-10 lg:px-8">

        {/* ── Profile hero card ────────────────────────────────── */}
        <div className="overflow-hidden rounded-[40px] border border-white/80 bg-white/94 p-7 shadow-[0_24px_64px_rgba(15,23,42,0.09)] backdrop-blur-xl lg:p-9">
          <div className="absolute inset-x-16 top-0 h-px bg-gradient-to-r from-transparent via-slate-200/60 to-transparent" />
          <div className="flex flex-col gap-6 lg:flex-row lg:items-start lg:gap-8">

            {/* Avatar initials */}
            <div className="flex h-20 w-20 shrink-0 items-center justify-center rounded-[22px] bg-slate-950 text-xl font-bold tracking-tight text-white shadow-[0_10px_28px_rgba(15,23,42,0.22)]">
              {initials}
            </div>

            <div className="min-w-0 space-y-4">
              <div>
                <h1 className="text-[1.9rem] font-semibold tracking-[-0.025em] text-slate-950">
                  {user.name}
                </h1>
                {user.headline && (
                  <p className="mt-1 text-[1rem] text-slate-500">{user.headline}</p>
                )}
              </div>

              {/* Location + target countries */}
              <div className="flex flex-wrap items-center gap-2">
                {user.location && (
                  <span className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-slate-50 px-3 py-1 text-[0.8rem] text-slate-600">
                    📍 {user.location}
                  </span>
                )}
                {user.targetCountries.slice(0, 3).map((country) => (
                  <span
                    key={country}
                    className="flex items-center gap-1.5 rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.8rem] text-slate-600"
                  >
                    {countryFlags[country] ?? "🌐"} {country}
                  </span>
                ))}
              </div>

              {/* Profile links */}
              {content.links.length > 0 && (
                <div className="flex flex-wrap gap-2">
                  {content.links.map((link) => (
                    <a
                      key={link.url}
                      href={link.url}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="rounded-full border border-slate-200 bg-white px-3 py-1 text-[0.8rem] font-medium text-slate-700 transition-all duration-200 hover:border-slate-300 hover:bg-slate-50 hover:shadow-[0_4px_12px_rgba(15,23,42,0.07)]"
                    >
                      {link.label}
                    </a>
                  ))}
                </div>
              )}
            </div>
          </div>
        </div>

        {/* ── Resume preview ──────────────────────────────────── */}
        <ResumePreview
          personalDetails={{
            name: user.name || "",
            headline: user.headline || "",
            location: user.location || "",
            phone: user.phone || "",
          }}
          document={document}
          templateKey="ATLAS"
        />

        {/* ── Footer ──────────────────────────────────────────── */}
        <div className="flex items-center justify-center gap-3 py-6 text-[0.78rem] text-slate-400">
          <span>Resume built with</span>
          <Link
            href="/"
            className="font-semibold text-slate-600 transition-colors hover:text-slate-950"
          >
            BorderlessCV
          </Link>
          <span>·</span>
          <Link
            href="/sign-up"
            className="text-slate-500 transition-colors hover:text-slate-950"
          >
            Build yours free
          </Link>
        </div>
      </div>
    </div>
  );
}
