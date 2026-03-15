import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { masterProfileSchema } from "@/lib/validations/profile";

function calculateProfileCompleteness(input: ReturnType<typeof masterProfileSchema.parse>) {
  const weightedChecks = [
    Boolean(input.personalDetails.name),
    Boolean(input.professionalSummary),
    input.content.education.length > 0,
    input.content.experience.length > 0 || input.content.internships.length > 0,
    input.content.projects.length > 0,
    input.content.skills.length > 0,
    input.content.links.length > 0,
  ];

  return Math.round((weightedChecks.filter(Boolean).length / weightedChecks.length) * 100);
}

export async function PUT(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = masterProfileSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const profile = await prisma.masterProfile.upsert({
    where: { userId: user.id },
    create: {
      userId: user.id,
      professionalSummary: parsed.data.professionalSummary,
      profileCompleteness: calculateProfileCompleteness(parsed.data),
      content: parsed.data.content,
      lastAutosavedAt: new Date(),
    },
    update: {
      professionalSummary: parsed.data.professionalSummary,
      profileCompleteness: calculateProfileCompleteness(parsed.data),
      content: parsed.data.content,
      lastAutosavedAt: new Date(),
    },
  });

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.personalDetails.name,
      headline: parsed.data.personalDetails.headline,
      location: parsed.data.personalDetails.location,
      phone: parsed.data.personalDetails.phone,
      links: parsed.data.content.links,
    },
  });

  return NextResponse.json({ profile });
}
