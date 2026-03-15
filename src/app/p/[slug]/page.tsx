import { notFound } from "next/navigation";

import { Card, CardContent } from "@/components/ui/card";
import { ResumePreview } from "@/components/resumes/resume-preview";
import { parseProfileContent } from "@/lib/serializers";
import { buildResumeDocumentFromProfile } from "@/lib/defaults";
import { prisma } from "@/lib/prisma";

export default async function PublicProfilePage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  const { slug } = await params;

  const user = await prisma.user.findFirst({
    where: {
      publicProfileSlug: slug,
      publicProfileEnabled: true,
    },
    include: {
      masterProfile: true,
    },
  });

  if (!user) {
    notFound();
  }

  const content = parseProfileContent(user.masterProfile);
  const document = buildResumeDocumentFromProfile(content, user.masterProfile?.professionalSummary || "", user.targetCountries[0] || "REMOTE", user.experienceLevel);

  return (
    <div className="mesh-bg min-h-screen px-4 py-8 lg:px-8">
      <div className="mx-auto max-w-5xl space-y-6">
        <Card className="rounded-[32px] bg-white">
          <CardContent className="space-y-2 p-6">
            <p className="section-label">Public profile</p>
            <h1 className="text-3xl font-semibold text-slate-950">{user.name}</h1>
            <p className="text-slate-500">{user.headline}</p>
          </CardContent>
        </Card>
        <ResumePreview
          personalDetails={{
            name: user.name || "",
            headline: user.headline || "",
            location: user.location || "",
            phone: user.phone || "",
          }}
          document={document}
          templateKey="ATLAS"
          targetCountry={user.targetCountries[0] || "REMOTE"}
          targetRole={user.targetRoles[0] || ""}
        />
      </div>
    </div>
  );
}
