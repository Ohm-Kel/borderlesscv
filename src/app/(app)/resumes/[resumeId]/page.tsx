import { notFound } from "next/navigation";

import { ResumeBuilder } from "@/components/resumes/resume-builder";
import { parseResumeDocument, parseTailoringGuidance } from "@/lib/serializers";
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
        aiGuidance: parseTailoringGuidance(version),
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
  );
}
