import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { parseProfileContent } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import { onboardingSchema } from "@/lib/validations/profile";

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = onboardingSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const existingProfile = await prisma.masterProfile.findUnique({
    where: { userId: user.id },
    select: { content: true },
  });

  const nextContent = parseProfileContent(existingProfile);
  nextContent.links = parsed.data.links;

  await prisma.user.update({
    where: { id: user.id },
    data: {
      name: parsed.data.name,
      headline: parsed.data.headline,
      location: parsed.data.location,
      phone: parsed.data.phone,
      links: parsed.data.links,
      targetCountries: parsed.data.targetCountries,
      targetRoles: parsed.data.targetRoles,
      experienceLevel: parsed.data.experienceLevel,
      onboardingStep: 100,
      onboardedAt: new Date(),
      masterProfile: {
        upsert: {
          create: {
            content: nextContent,
          },
          update: {
            content: nextContent,
          },
        },
      },
    },
  });

  return NextResponse.json({ success: true });
}
