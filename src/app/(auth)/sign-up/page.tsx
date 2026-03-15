import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your BorderlessCV workspace"
      description="Start with one trusted master profile, then create country-aware resume versions, cover letters, and application history from the same verified facts."
      footer={<AuthFooterLink text="Already have an account?" href="/sign-in" label="Sign in" />}
    >
      <SignUpForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />
    </AuthCard>
  );
}
