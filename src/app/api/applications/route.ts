import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { prisma } from "@/lib/prisma";
import { applicationSchema } from "@/lib/validations/application";

function parseOptionalDate(value?: string) {
  return value ? new Date(value) : undefined;
}

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = applicationSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const application = await prisma.application.create({
    data: {
      userId: user.id,
      company: parsed.data.company,
      role: parsed.data.role,
      location: parsed.data.location || undefined,
      country: parsed.data.country,
      jobUrl: parsed.data.jobUrl,
      source: parsed.data.source || undefined,
      notes: parsed.data.notes || undefined,
      status: parsed.data.status,
      appliedAt: parseOptionalDate(parsed.data.appliedAt),
      nextStepAt: parseOptionalDate(parsed.data.nextStepAt),
      resumeId: parsed.data.resumeId,
      resumeVersionId: parsed.data.resumeVersionId,
    },
  });

  return NextResponse.json({ applicationId: application.id });
}
