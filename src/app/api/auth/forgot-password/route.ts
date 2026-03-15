import { randomBytes } from "node:crypto";
import { addHours } from "date-fns";
import { NextResponse } from "next/server";

import { buildAbsoluteUrl } from "@/lib/utils";
import { prisma } from "@/lib/prisma";
import { forgotPasswordSchema } from "@/lib/validations/auth";
import { sendPasswordResetEmail } from "@/lib/mailer";

export async function POST(request: Request) {
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

  return NextResponse.json({
    success: true,
    developmentResetUrl: process.env.NODE_ENV !== "production" ? result.previewUrl : undefined,
  });
}
