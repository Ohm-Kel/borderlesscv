import { AppShell } from "@/components/layout/app-shell";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function WorkspaceLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const sessionUser = await requireOnboardedUser();

  const user = await prisma.user.findUnique({
    where: { id: sessionUser.id },
    select: {
      name: true,
      email: true,
      image: true,
    },
  });

  return <AppShell user={user ?? sessionUser}>{children}</AppShell>;
}
