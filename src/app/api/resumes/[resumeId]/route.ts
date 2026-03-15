import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { updateResumeSchema } from "@/lib/validations/resume";

export async function PATCH(
  request: Request,
  context: { params: Promise<{ resumeId: string }> },
) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { resumeId } = await context.params;
  const json = await request.json();
  const parsed = updateResumeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const resume = await prisma.resume.updateMany({
    where: {
      id: resumeId,
      userId: user.id,
    },
    data: {
      title: parsed.data.title,
      targetRole: parsed.data.targetRole || undefined,
      targetCountry: parsed.data.targetCountry,
      templateKey: parsed.data.templateKey,
      emphasisMode: parsed.data.emphasisMode,
      visibility: parsed.data.visibility,
    },
  });

  if (!resume.count) {
    return NextResponse.json({ error: "Resume not found." }, { status: 404 });
  }

  return NextResponse.json({ success: true });
}
