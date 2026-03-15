import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { ForgotPasswordForm } from "@/components/auth/forgot-password-form";

export default function ForgotPasswordPage() {
  return (
    <AuthCard
      title="Reset your password"
      description="We'll send you a secure reset link. In local development, the link is surfaced directly in the app if email delivery is not configured."
      footer={<AuthFooterLink text="Remembered your password?" href="/sign-in" label="Back to sign in" />}
    >
      <ForgotPasswordForm />
    </AuthCard>
  );
}
