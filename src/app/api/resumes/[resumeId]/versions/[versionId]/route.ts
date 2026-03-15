import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { createResumeVersionSchema } from "@/lib/validations/resume";

export async function PUT(
  request: Request,
  context: { params: Promise<{ resumeId: string; versionId: string }> },
) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { resumeId, versionId } = await context.params;
  const json = await request.json();
  const parsed = createResumeVersionSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const updated = await prisma.resumeVersion.updateMany({
    where: {
      id: versionId,
      resumeId,
      resume: {
        userId: user.id,
      },
    },
    data: {
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

  if (!updated.count) {
    return NextResponse.json({ error: "Version not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
