import { redirect } from "next/navigation";

import { getServerAuthSession } from "@/lib/auth";

export async function requireUser() {
  const session = await getServerAuthSession();

  if (!session?.user) {
    redirect("/sign-in");
  }

  return session.user;
}

export async function requireOnboardedUser() {
  const user = await requireUser();

  if (!user.onboardedAt) {
    redirect("/onboarding");
  }

  return user;
}
