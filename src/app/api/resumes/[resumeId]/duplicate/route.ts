import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { parseResumeDocument } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";

export async function POST(
  _request: Request,
  context: { params: Promise<{ resumeId: string }> },
) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { resumeId } = await context.params;
  const sourceResume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  if (!sourceResume || !sourceResume.versions[0]) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const latestVersion = sourceResume.versions[0];

  const duplicated = await prisma.resume.create({
    data: {
      userId: user.id,
      baseResumeId: sourceResume.id,
      title: `${sourceResume.title} Copy`,
      targetRole: sourceResume.targetRole || undefined,
      targetCountry: sourceResume.targetCountry,
      templateKey: sourceResume.templateKey,
      emphasisMode: sourceResume.emphasisMode,
      visibility: sourceResume.visibility,
      sectionOrder: sourceResume.sectionOrder ?? undefined,
      hiddenSections: sourceResume.hiddenSections ?? undefined,
      versions: {
        create: {
          versionNumber: 1,
          title: `${sourceResume.title} Copy v1`,
          tone: latestVersion.tone,
          content: parseResumeDocument(latestVersion),
          aiGuidance: latestVersion.aiGuidance ?? undefined,
          sourceVersionId: latestVersion.id,
        },
      },
    },
  });

  const duplicatedVersion = await prisma.resumeVersion.findFirst({
    where: { resumeId: duplicated.id },
    orderBy: { versionNumber: "desc" },
    select: { id: true },
  });

  return NextResponse.json({
    resumeId: duplicated.id,
    versionId: duplicatedVersion?.id,
  });
}
