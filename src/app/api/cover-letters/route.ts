import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { coverLetterSchema } from "@/lib/validations/application";

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = coverLetterSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const version = await prisma.resumeVersion.findFirst({
    where: {
      id: parsed.data.resumeVersionId,
      resume: {
        userId: user.id,
      },
    },
    select: { id: true },
  });

  if (!version) {
    return NextResponse.json({ error: "Resume version not found." }, { status: 404 });
  }

  const coverLetter = await prisma.coverLetter.create({
    data: {
      userId: user.id,
      resumeVersionId: parsed.data.resumeVersionId,
      title: parsed.data.title,
      companyName: parsed.data.companyName || undefined,
      jobTitle: parsed.data.jobTitle || undefined,
      jobDescription: parsed.data.jobDescription || undefined,
      content: parsed.data.content,
    },
  });

  return NextResponse.json({ coverLetterId: coverLetter.id });
}
