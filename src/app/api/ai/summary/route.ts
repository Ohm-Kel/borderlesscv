import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { generateSummary } from "@/lib/ai";
import { generateSummarySchema } from "@/lib/validations/ai";

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = generateSummarySchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await generateSummary(parsed.data);
  return NextResponse.json(result);
}
