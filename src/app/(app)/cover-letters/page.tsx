import { PageHeader } from "@/components/shared/page-header";
import { CoverLetterWorkspace } from "@/components/cover-letters/cover-letter-workspace";
import { parseResumeDocument } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function CoverLettersPage() {
  const user = await requireOnboardedUser();

  const [letters, resumes] = await Promise.all([
    prisma.coverLetter.findMany({
      where: { userId: user.id },
      orderBy: { createdAt: "desc" },
    }),
    prisma.resume.findMany({
      where: { userId: user.id },
      include: {
        versions: {
          orderBy: { versionNumber: "desc" },
        },
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Cover Letters"
        title="Cover letter workspace"
        description="Generate and save cover letters from the same verified facts that power each resume version."
      />
      <CoverLetterWorkspace
        initialLetters={letters.map((letter) => ({
          id: letter.id,
          title: letter.title,
          companyName: letter.companyName,
          jobTitle: letter.jobTitle,
          content: letter.content,
          createdAt: letter.createdAt.toISOString(),
        }))}
        versionOptions={resumes.flatMap((resume) =>
          resume.versions.map((version) => ({
            id: version.id,
            label: `${resume.title} • v${version.versionNumber}`,
            country: resume.targetCountry || "REMOTE",
            content: parseResumeDocument(version),
          })),
        )}
      />
    </div>
  );
}
