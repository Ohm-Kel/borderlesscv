import type { MasterProfile, ResumeVersion } from "@prisma/client";

import { createEmptyProfileContent } from "@/lib/defaults";
import type { TailoringGuidance } from "@/lib/validations/ai";
import { tailoringGuidanceSchema } from "@/lib/validations/ai";
import type { ProfileContent } from "@/lib/validations/profile";
import { profileContentSchema } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";
import { resumeDocumentSchema } from "@/lib/validations/resume";

export function parseProfileContent(profile: Pick<MasterProfile, "content"> | null | undefined): ProfileContent {
  const parsed = profileContentSchema.safeParse(profile?.content);
  return parsed.success ? parsed.data : createEmptyProfileContent();
}

export function parseResumeDocument(version: Pick<ResumeVersion, "content"> | null | undefined): ResumeDocument {
  const parsed = resumeDocumentSchema.safeParse(version?.content);

  if (parsed.success) {
    return parsed.data;
  }

  return {
    summary: "",
    sectionOrder: [],
    hiddenSections: [],
    sections: createEmptyProfileContent(),
  };
}

export function parseTailoringGuidance(version: Pick<ResumeVersion, "aiGuidance"> | null | undefined): TailoringGuidance | null {
  const parsed = tailoringGuidanceSchema.safeParse(version?.aiGuidance);
  return parsed.success ? parsed.data : null;
}
