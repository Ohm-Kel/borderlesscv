import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { ResetPasswordForm } from "@/components/auth/reset-password-form";

export default async function ResetPasswordPage({
  searchParams,
}: {
  searchParams: Promise<{ token?: string }>;
}) {
  const { token } = await searchParams;

  return (
    <AuthCard
      title="Choose a new password"
      description="Reset your BorderlessCV password and continue with your existing workspace."
      footer={<AuthFooterLink text="Need a new link?" href="/forgot-password" label="Request another reset email" />}
    >
      {token ? <ResetPasswordForm token={token} /> : <p className="text-sm leading-7 text-rose-600">This reset link is missing a token. Request a new password reset email.</p>}
    </AuthCard>
  );
}
