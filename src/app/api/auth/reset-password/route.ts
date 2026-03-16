import { Prisma } from "@prisma/client";
import { hash } from "bcryptjs";
import { NextResponse } from "next/server";

import { ConfigurationError, requireEnv } from "@/lib/env";
import { prisma } from "@/lib/prisma";
import { resetPasswordSchema } from "@/lib/validations/auth";

export async function POST(request: Request) {
  try {
    requireEnv(["DATABASE_URL"], "BorderlessCV could not reach the database configuration for password reset.");
    const json = await request.json();
    const parsed = resetPasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const resetToken = await prisma.passwordResetToken.findUnique({
      where: { token: parsed.data.token },
      include: { user: true },
    });

    if (!resetToken || resetToken.usedAt || resetToken.expiresAt < new Date()) {
      return NextResponse.json({ error: "This reset link is invalid or has expired." }, { status: 400 });
    }

    const passwordHash = await hash(parsed.data.password, 12);
    const usedAt = new Date();

    await prisma.$transaction([
      prisma.user.update({
        where: { id: resetToken.userId },
        data: { passwordHash },
      }),
      prisma.passwordResetToken.update({
        where: { id: resetToken.id },
        data: { usedAt },
      }),
      prisma.passwordResetToken.updateMany({
        where: {
          userId: resetToken.userId,
          usedAt: null,
          id: { not: resetToken.id },
        },
        data: { usedAt },
      }),
    ]);

    return NextResponse.json({ success: true });
  } catch (error) {
    console.error("Reset-password request failed", error);

    if (error instanceof ConfigurationError) {
      return NextResponse.json(
        {
          error: error.message,
          missingEnv: error.missingKeys,
        },
        { status: 503 },
      );
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
          error: "The password reset request was not valid JSON.",
        },
        { status: 400 },
      );
    }

    return NextResponse.json(
      {
        error: "Password reset is temporarily unavailable. Please try again shortly.",
      },
      { status: 500 },
    );
  }
}
