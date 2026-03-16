import { SettingsForm } from "@/components/settings/settings-form";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function SettingsPage() {
  const user = await requireOnboardedUser();

  const currentUser = await prisma.user.findUnique({
    where: { id: user.id },
    select: {
      publicProfileEnabled: true,
      publicProfileSlug: true,
    },
  });

  return (
    <div className="h-full min-h-0">
      <SettingsForm initialEnabled={currentUser?.publicProfileEnabled ?? false} initialSlug={currentUser?.publicProfileSlug ?? ""} />
    </div>
  );
}
