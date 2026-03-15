import { NextResponse } from "next/server";
import { z } from "zod";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { makePublicProfileSlug } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";
import { slugify } from "@/lib/utils";

const schema = z.object({
  publicProfileEnabled: z.boolean(),
  publicProfileSlug: z.string().trim().max(80).optional().default(""),
});

export async function PATCH(request: Request) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const json = await request.json();
  const parsed = schema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json({ error: parsed.error.flatten().fieldErrors }, { status: 400 });
  }

  const current = await prisma.user.findUnique({
    where: { id: user.id },
    select: { name: true },
  });

  const baseSlug = parsed.data.publicProfileSlug ? slugify(parsed.data.publicProfileSlug) : makePublicProfileSlug(current?.name || "candidate", user.id);

  await prisma.user.update({
    where: { id: user.id },
    data: {
      publicProfileEnabled: parsed.data.publicProfileEnabled,
      publicProfileSlug: baseSlug,
    },
  });

  return NextResponse.json({ success: true, publicProfileSlug: baseSlug });
}
