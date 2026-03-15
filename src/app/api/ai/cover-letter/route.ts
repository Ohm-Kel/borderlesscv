import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { generateCoverLetter } from "@/lib/ai";

const schema = z.object({
  facts: z.array(z.string().trim().min(5).max(300)).min(2),
  companyName: z.string().trim().max(120).optional().default(""),
  jobTitle: z.string().trim().max(120).optional().default(""),
  jobDescription: z.string().trim().max(8000).optional().default(""),
  country: z.enum(["GHANA", "UK", "USA", "CANADA", "EUROPE", "REMOTE"]),
});

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await generateCoverLetter(parsed.data);
  return NextResponse.json(result);
}
