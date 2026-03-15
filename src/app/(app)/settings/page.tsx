import { PageHeader } from "@/components/shared/page-header";
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
    <div className="space-y-6">
      <PageHeader
        eyebrow="Settings"
        title="Workspace settings"
        description="Control public profile visibility and keep your account private by default."
      />
      <SettingsForm initialEnabled={currentUser?.publicProfileEnabled ?? false} initialSlug={currentUser?.publicProfileSlug ?? ""} />
    </div>
  );
}
