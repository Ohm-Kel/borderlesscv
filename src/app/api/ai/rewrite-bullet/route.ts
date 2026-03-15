import { NextResponse } from "next/server";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { rewriteBullet } from "@/lib/ai";
import { rewriteBulletSchema } from "@/lib/validations/ai";

export async function POST(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = rewriteBulletSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const result = await rewriteBullet(parsed.data);
  return NextResponse.json(result);
}
