import { Prisma } from "@prisma/client";
import { randomBytes } from "node:crypto";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";

import { ConfigurationError, hasPasswordResetEmailConfig, isProductionEnvironment, requireEnv } from "@/lib/env";
import { buildAbsoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(request: Request) {
  try {
    requireEnv(["DATABASE_URL"], "BorderlessCV could not reach the database configuration for password reset.");
    const json = await request.json();
    const parsed = forgotPasswordSchema.safeParse(json);

    if (!parsed.success) {
      return NextResponse.json(
        {
          error: parsed.error.flatten().fieldErrors,
        },
        { status: 400 },
      );
    }

    const user = await prisma.user.findUnique({
      where: { email: parsed.data.email },
      select: {
        id: true,
        email: true,
        name: true,
      },
    });

    if (!user) {
      return NextResponse.json({ success: true });
    }

    if (isProductionEnvironment() && !hasPasswordResetEmailConfig()) {
      return NextResponse.json(
        {
          error: "Password reset email delivery is not configured yet.",
        },
        { status: 503 },
      );
    }

    const token = randomBytes(32).toString("hex");
    const resetUrl = buildAbsoluteUrl(`/reset-password?token=${token}`);

    await prisma.passwordResetToken.create({
      data: {
        identifier: user.email,
        token,
        userId: user.id,
        expiresAt: addHours(new Date(), 1),
      },
    });

    const result = await sendPasswordResetEmail({
      email: user.email,
      name: user.name,
      resetUrl,
    });

    if (!result.delivered && !result.previewUrl) {
      return NextResponse.json(
        {
          error: result.unavailableReason ?? "Password reset email delivery is unavailable right now.",
        },
        { status: 503 },
      );
    }

    return NextResponse.json({
      success: true,
      developmentResetUrl: result.previewUrl,
    });
  } catch (error) {
    console.error("Forgot-password request failed", error);

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
