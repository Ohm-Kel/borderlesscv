import { PageHeader } from "@/components/shared/page-header";
import { MasterProfileEditor } from "@/components/profile/master-profile-editor";
import { createEmptyProfileContent } from "@/lib/defaults";
import { parseProfileContent } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function ProfilePage() {
  const sessionUser = await requireOnboardedUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    include: {
      masterProfile: true,
    },
  });

  const profileContent = user?.masterProfile ? parseProfileContent(user.masterProfile) : createEmptyProfileContent();

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Profile"
        title="Master profile"
        description="Capture your verified experience once, then reuse it for country-aware resumes, cover letters, and job tracking."
      />
      <MasterProfileEditor
        primaryCountry={user?.targetCountries[0] || "REMOTE"}
        initialData={{
          personalDetails: {
            name: user?.name || "",
            headline: user?.headline || "",
            location: user?.location || "",
            phone: user?.phone || "",
          },
          professionalSummary: user?.masterProfile?.professionalSummary || "",
          content: profileContent,
        }}
      />
    </div>
  );
}
