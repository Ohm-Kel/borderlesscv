import { hasPasswordResetEmailConfig, isProductionEnvironment, serverEnv } from "@/lib/env";

type ResetEmailInput = {
  email: string;
  name?: string | null;
  resetUrl: string;
};

export async function sendPasswordResetEmail({ email, name, resetUrl }: ResetEmailInput) {
  if (!hasPasswordResetEmailConfig()) {
    return {
      delivered: false,
      previewUrl: isProductionEnvironment() ? undefined : resetUrl,
      unavailableReason: "Password reset email delivery is not configured yet.",
    };
  }

  const response = await fetch("https://api.resend.com/emails", {
    method: "POST",
    headers: {
      Authorization: `Bearer ${serverEnv.resendApiKey}`,
      "Content-Type": "application/json",
    },
    body: JSON.stringify({
      from: serverEnv.mailFrom,
      to: email,
      subject: "Reset your BorderlessCV password",
      html: `
        <div style="font-family: Inter, Arial, sans-serif; max-width: 560px; margin: 0 auto; color: #0f172a;">
          <h1 style="font-size: 24px; margin-bottom: 16px;">Reset your password</h1>
          <p style="font-size: 16px; line-height: 1.7;">${name ? `Hi ${name},` : "Hi,"}</p>
          <p style="font-size: 16px; line-height: 1.7;">
            We received a request to reset your BorderlessCV password. If that was you, use the button below.
          </p>
          <p style="margin: 28px 0;">
            <a href="${resetUrl}" style="display: inline-block; border-radius: 16px; background: #0f172a; color: white; text-decoration: none; padding: 12px 20px; font-weight: 600;">
              Reset password
            </a>
          </p>
          <p style="font-size: 14px; line-height: 1.7; color: #475569;">
            This link expires in 1 hour. If you did not request it, you can ignore this email.
          </p>
        </div>
      `,
    }),
  });

  if (!response.ok) {
    const text = await response.text();
    throw new Error(`Failed to send reset email: ${text}`);
  }

  return {
    delivered: true,
    previewUrl: undefined,
    unavailableReason: undefined,
  };
}
