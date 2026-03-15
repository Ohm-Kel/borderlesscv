import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { SignUpForm } from "@/components/auth/sign-up-form";

export default function SignUpPage() {
  return (
    <AuthCard
      title="Create your BorderlessCV workspace"
      description="Start with a reusable master profile, then generate country-aware resume versions, cover letters, and application history from one trusted source of facts."
      footer={<AuthFooterLink text="Already have an account?" href="/sign-in" label="Sign in" />}
    >
      <SignUpForm googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />
    </AuthCard>
  );
}
