import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { createEmptyProfileContent, makePublicProfileSlug } from "@/lib/defaults";
import { ConfigurationError, requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { signUpSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    requireEnv(["DATABASE_URL"], "BorderlessCV could not reach the database configuration for sign-up.");
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
  } catch (error) {
    console.error("Sign-up request failed", error);

    if (error instanceof ConfigurationError) {
      return NextResponse.json(
        {
          error: error.message,
          missingEnv: error.missingKeys,
        },
        { status: 503 },
      );
    }

    if (error instanceof Prisma.PrismaClientKnownRequestError && error.code === "P2002") {
      return NextResponse.json({ error: "An account with that email already exists." }, { status: 409 });
    }

    if (error instanceof Prisma.PrismaClientInitializationError) {
      return NextResponse.json(
        {
          error: "BorderlessCV could not reach the database. Check the deployed database connection settings and try again.",
        },
        { status: 503 },
      );
    }

    if (error instanceof SyntaxError) {
      return NextResponse.json(
        {
          error: "The sign-up request was not valid JSON.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Something went wrong while creating your account. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
