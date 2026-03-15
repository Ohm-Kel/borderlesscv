import { notFound } from "next/navigation";

import { PageHeader } from "@/components/shared/page-header";
import { ResumeBuilder } from "@/components/resumes/resume-builder";
import { parseResumeDocument } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function ResumeBuilderPage({
  params,
}: {
  params: Promise<{ resumeId: string }>;
}) {
  const user = await requireOnboardedUser();
  const { resumeId } = await params;

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    include: {
      versions: {
        orderBy: {
          versionNumber: "desc",
        },
      },
      user: {
        select: {
          name: true,
          headline: true,
          location: true,
          phone: true,
        },
      },
    },
  });

  if (!resume || !resume.targetCountry) {
    notFound();
  }

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Builder"
        title={resume.title}
        description="Tailor sections, keep versions for different jobs and countries, and export directly from the live preview."
      />
      <ResumeBuilder
        resume={{
          id: resume.id,
          title: resume.title,
          targetRole: resume.targetRole,
          targetCountry: resume.targetCountry,
          templateKey: resume.templateKey,
          emphasisMode: resume.emphasisMode,
          visibility: resume.visibility,
        }}
        versions={resume.versions.map((version) => ({
          id: version.id,
          versionNumber: version.versionNumber,
          title: version.title,
          jobTitle: version.jobTitle,
          companyName: version.companyName,
          jobDescription: version.jobDescription,
          changeSummary: version.changeSummary,
          tone: version.tone,
          content: parseResumeDocument(version),
          createdAt: version.createdAt.toISOString(),
        }))}
        personalDetails={{
          name: resume.user.name || "",
          headline: resume.user.headline || "",
          location: resume.user.location || "",
          phone: resume.user.phone || "",
        }}
      />
    </div>
  );
}
