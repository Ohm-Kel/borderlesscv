import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { tailorResumeToJob } from "@/lib/ai";
import { tailorResumeSchema } from "@/lib/validations/ai";

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = tailorResumeSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await tailorResumeToJob(parsed.data);
  return NextResponse.json(result);
}
