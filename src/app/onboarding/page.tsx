import { redirect } from "next/navigation";

import { OnboardingForm } from "@/components/onboarding/onboarding-form";
import { Logo } from "@/components/shared/logo";
import { parseProfileContent } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import { requireUser } from "@/lib/session";

export default async function OnboardingPage() {
  const sessionUser = await requireUser();

  if (sessionUser.onboardedAt) {
    redirect("/dashboard");
  }

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      masterProfile: true,
    },
  });

  const profileContent = parseProfileContent(user?.masterProfile);

  return (
    <div className="mesh-bg min-h-screen">
      <div className="mx-auto max-w-4xl px-4 py-8 lg:px-8">
        <div className="mb-8">
          <Logo />
        </div>
        <OnboardingForm
          initialData={{
            name: user?.name || "",
            headline: user?.headline || "",
            location: user?.location || "",
            phone: user?.phone || "",
            links: profileContent.links,
            targetCountries: user?.targetCountries || [],
            targetRoles: user?.targetRoles || [],
            experienceLevel: user?.experienceLevel || "STUDENT",
          }}
        />
      </div>
    </div>
  );
}
