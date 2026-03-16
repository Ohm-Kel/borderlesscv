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
    <div className="h-full min-h-0">
      <MasterProfileEditor
        initialProfileCompleteness={user?.masterProfile?.profileCompleteness ?? 0}
        initialLastAutosavedAt={user?.masterProfile?.lastAutosavedAt?.toISOString() ?? null}
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
