import { PageHeader } from "@/components/shared/page-header";
import { ResumeLibrary } from "@/components/resumes/resume-library";
import { prisma } from "@/lib/prisma";
import { requireOnboardedUser } from "@/lib/session";

export default async function ResumesPage() {
  const user = await requireOnboardedUser();

  const [resumes, currentUser] = await Promise.all([
    prisma.resume.findMany({
      where: { userId: user.id },
      orderBy: { updatedAt: "desc" },
      include: {
        versions: {
          select: { id: true },
        },
      },
    }),
    prisma.user.findUnique({
      where: { id: user.id },
      select: {
        targetCountries: true,
      },
    }),
  ]);

  return (
    <div className="space-y-6">
      <PageHeader
        eyebrow="Resumes"
        title="Resume library"
        description="Create a strong base resume, then branch versions for specific jobs, countries, and tone requirements."
      />
      <ResumeLibrary
        defaultCountry={(currentUser?.targetCountries[0] || "REMOTE") as "GHANA" | "UK" | "USA" | "CANADA" | "EUROPE" | "REMOTE"}
        initialResumes={resumes.map((resume) => ({
          id: resume.id,
          title: resume.title,
          targetRole: resume.targetRole,
          targetCountry: resume.targetCountry,
          templateKey: resume.templateKey,
          updatedAt: resume.updatedAt.toISOString(),
          versionCount: resume.versions.length,
        }))}
      />
    </div>
  );
}
