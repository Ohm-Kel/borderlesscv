import { AuthCard, AuthFooterLink } from "@/components/auth/auth-card";
import { SignInForm } from "@/components/auth/sign-in-form";

export default async function SignInPage({
  searchParams,
}: {
  searchParams: Promise<{ callbackUrl?: string }>;
}) {
  const { callbackUrl } = await searchParams;

  return (
    <AuthCard
      title="Welcome back"
      description="Sign in to continue tailoring resumes, exporting polished PDFs, and tracking applications across countries."
      footer={<AuthFooterLink text="New to BorderlessCV?" href="/sign-up" label="Create an account" />}
    >
      <SignInForm callbackUrl={callbackUrl} googleEnabled={Boolean(process.env.GOOGLE_CLIENT_ID && process.env.GOOGLE_CLIENT_SECRET)} />
    </AuthCard>
  );
}
