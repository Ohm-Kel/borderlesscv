import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { createEmptyProfileContent, makePublicProfileSlug } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  const json = await request.json();
  const parsed = signUpSchema.safeParse(json);

  if (!parsed.success) {
    return NextResponse.json(
      {
        error: parsed.error.flatten().fieldErrors,
      },
      { status: 400 },
    );
  }

  const existingUser = await prisma.user.findUnique({
    where: { email: parsed.data.email },
    select: { id: true },
  });

  if (existingUser) {
    return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
  }

  const passwordHash = await hash(parsed.data.password, 12);

  const user = await prisma.user.create({
    data: {
      name: parsed.data.name,
      email: parsed.data.email,
      passwordHash,
      links: [],
      publicProfileSlug: makePublicProfileSlug(parsed.data.name, crypto.randomUUID()),
      masterProfile: {
        create: {
          content: createEmptyProfileContent(),
        },
      },
    },
    select: {
      id: true,
      email: true,
      name: true,
    },
  });

  return NextResponse.json({
    user,
  });
}
