import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createResumeVersionSchema } from "@/lib/validations/resume";

export async function POST(
  request: Request,
  context: { params: Promise<{ resumeId: string }> },
) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { resumeId } = await context.params;
  const json = await request.json();
  const parsed = createResumeVersionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    select: {
      id: true,
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
        select: { versionNumber: true },
      },
    },
  });

  if (!resume) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  const version = await prisma.resumeVersion.create({
    data: {
      resumeId,
      sourceVersionId: parsed.data.sourceVersionId,
      versionNumber: (resume.versions[0]?.versionNumber ?? 0) + 1,
      title: parsed.data.title,
      jobTitle: parsed.data.jobTitle || undefined,
      companyName: parsed.data.companyName || undefined,
      jobDescription: parsed.data.jobDescription || undefined,
      changeSummary: parsed.data.changeSummary || undefined,
      tone: parsed.data.tone,
      aiGuidance: parsed.data.aiGuidance,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ versionId: version.id });
}
