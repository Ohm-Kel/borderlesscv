import { createElement } from "react";
import { NextResponse } from "next/server";
import { renderToBuffer } from "@react-pdf/renderer";

import { requireApiUser, unauthorizedResponse } from "@/lib/api-auth";
import { ResumePdfDocument } from "@/lib/pdf/resume-pdf-document";
import { parseResumeDocument } from "@/lib/serializers";
import { prisma } from "@/lib/prisma";

export async function GET(
  _request: Request,
  context: { params: Promise<{ resumeId: string; versionId: string }> },
) {
  const user = await requireApiUser();

  if (!user) {
    return unauthorizedResponse();
  }

  const { resumeId, versionId } = await context.params;
  const resume = await prisma.resume.findFirst({
    where: {
      id: resumeId,
      userId: user.id,
    },
    include: {
      user: {
        select: {
          name: true,
          headline: true,
          location: true,
          phone: true,
        },
      },
      versions: {
        where: { id: versionId },
        take: 1,
      },
    },
  });

  if (!resume || !resume.versions[0]) {
    return NextResponse.json({ error: "Resume version not found." }, { status: 404 });
  }

  const version = resume.versions[0];
  const document = parseResumeDocument(version);

  const pdfBuffer = await renderToBuffer(
    createElement(ResumePdfDocument, {
      title: resume.title,
      person: {
        name: resume.user.name || "",
        headline: resume.user.headline || resume.targetRole || "",
        location: resume.user.location || "",
        phone: resume.user.phone || "",
      },
      document,
      templateKey: resume.templateKey,
    }),
  );

  return new NextResponse(new Uint8Array(pdfBuffer), {
    headers: {
      "Content-Type": "application/pdf",
      "Content-Disposition": `attachment; filename="${resume.title.replace(/\s+/g, "-").toLowerCase()}.pdf"`,
    },
  });
}
