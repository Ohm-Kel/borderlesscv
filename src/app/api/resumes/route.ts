import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { buildResumeDocumentFromProfile, createEmptyProfileContent } from "@/lib/defaults";
import { parseProfileContent } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import { createResumeSchema } from "@/lib/validations/resume";

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = createResumeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      experienceLevel: true,
      masterProfile: {
        select: {
          professionalSummary: true,
          content: true,
        },
      },
    },
  });

  const profileContent = currentUser?.masterProfile ? parseProfileContent(currentUser.masterProfile) : createEmptyProfileContent();
  const document = buildResumeDocumentFromProfile(
    profileContent,
    currentUser?.masterProfile?.professionalSummary ?? "",
    parsed.data.targetCountry,
    currentUser?.experienceLevel ?? "STUDENT",
  );

  const resume = await prisma.resume.create({
    data: {
      userId: user.id,
      title: parsed.data.title,
      targetRole: parsed.data.targetRole || undefined,
      targetCountry: parsed.data.targetCountry,
      templateKey: parsed.data.templateKey,
      emphasisMode: parsed.data.emphasisMode,
      sectionOrder: document.sectionOrder,
      hiddenSections: document.hiddenSections,
      versions: {
        create: {
          versionNumber: 1,
          title: `${parsed.data.title} v1`,
          tone: "GRADUATE",
          content: document,
        },
      },
    },
    include: {
      versions: {
        orderBy: { versionNumber: "desc" },
        take: 1,
      },
    },
  });

  return NextResponse.json({
    resumeId: resume.id,
    versionId: resume.versions[0]?.id,
  });
}
