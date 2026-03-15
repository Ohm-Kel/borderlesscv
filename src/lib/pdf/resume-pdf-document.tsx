import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeTemplateKey } from "@prisma/client";

import {
  formatMetaPieces,
  getSectionHeading,
  getTemplateSectionGroups,
  getVisibleSections,
  TEMPLATE_THEMES,
} from "@/lib/resume-presentation";
import type { AwardEntry, CertificationEntry, ProfileContent, ProfileListEntry } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

const styles = StyleSheet.create({
  page: {
    backgroundColor: "#ffffff",
    color: "#334155",
    fontFamily: "Helvetica",
    fontSize: 10,
  },
  atlasPage: {
    padding: 36,
  },
  horizonPage: {
    padding: 0,
  },
  emberPage: {
    padding: 28,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  atlasHeader: {
    marginBottom: 18,
    paddingBottom: 14,
    borderBottomWidth: 1,
  },
  atlasName: {
    fontSize: 23,
    fontWeight: 700,
  },
  headline: {
    marginTop: 6,
    fontSize: 11,
    lineHeight: 1.5,
  },
  metaStack: {
    maxWidth: 180,
    alignItems: "flex-end",
  },
  metaText: {
    fontSize: 9,
    lineHeight: 1.5,
  },
  summaryCard: {
    marginBottom: 18,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  summaryHeading: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  summaryText: {
    marginTop: 8,
    fontSize: 10,
    lineHeight: 1.65,
  },
  sectionStack: {
    gap: 16,
  },
  atlasSectionHeading: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 8,
  },
  atlasDot: {
    width: 7,
    height: 7,
    borderRadius: 999,
    marginRight: 8,
  },
  horizonShell: {
    flexDirection: "row",
    minHeight: "100%",
  },
  horizonSidebar: {
    width: "32%",
    paddingHorizontal: 24,
    paddingVertical: 28,
  },
  horizonMain: {
    width: "68%",
    paddingHorizontal: 28,
    paddingVertical: 30,
  },
  horizonLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.6,
    textTransform: "uppercase",
  },
  horizonName: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 700,
    lineHeight: 1.15,
  },
  panel: {
    marginTop: 16,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  horizonMainHeader: {
    marginBottom: 18,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  horizonRule: {
    width: 28,
    height: 4,
    borderRadius: 999,
    marginBottom: 8,
  },
  emberHeader: {
    marginBottom: 18,
    borderRadius: 20,
    paddingHorizontal: 22,
    paddingVertical: 20,
    backgroundColor: "#0f172a",
  },
  emberLabel: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.6,
    textTransform: "uppercase",
    color: "#fdba74",
  },
  emberName: {
    marginTop: 10,
    fontSize: 24,
    fontWeight: 700,
    color: "#ffffff",
  },
  emberHeadline: {
    marginTop: 8,
    color: "#cbd5e1",
    fontSize: 11,
    lineHeight: 1.5,
  },
  emberMeta: {
    color: "#cbd5e1",
    fontSize: 9,
    lineHeight: 1.5,
  },
  emberDivider: {
    height: 1,
    marginTop: 14,
    marginBottom: 12,
    backgroundColor: "rgba(255,255,255,0.16)",
  },
  emberColumns: {
    flexDirection: "row",
  },
  emberMain: {
    width: "64%",
    paddingRight: 18,
  },
  emberSidebar: {
    width: "36%",
  },
  cardSection: {
    marginBottom: 14,
    borderWidth: 1,
    borderRadius: 18,
    padding: 14,
  },
  horizonSectionTitle: {
    marginTop: 8,
    fontSize: 9,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  emberPill: {
    alignSelf: "flex-start",
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 5,
  },
  emberPillText: {
    fontSize: 8.5,
    fontWeight: 700,
    letterSpacing: 1.4,
    textTransform: "uppercase",
  },
  sectionBody: {
    marginTop: 10,
  },
  item: {
    marginBottom: 10,
  },
  emberItem: {
    marginBottom: 10,
    paddingBottom: 10,
    borderBottomWidth: 1,
  },
  itemRow: {
    flexDirection: "row",
    justifyContent: "space-between",
  },
  itemTitle: {
    fontWeight: 700,
    marginBottom: 2,
  },
  itemMeta: {
    fontSize: 9,
    lineHeight: 1.45,
  },
  paragraph: {
    marginTop: 4,
    fontSize: 9.5,
    lineHeight: 1.55,
  },
  bullet: {
    marginTop: 3,
    marginLeft: 8,
    fontSize: 9.5,
    lineHeight: 1.5,
  },
  chips: {
    flexDirection: "row",
    flexWrap: "wrap",
  },
  chip: {
    marginRight: 6,
    marginBottom: 6,
    borderWidth: 1,
    borderRadius: 999,
    paddingHorizontal: 8,
    paddingVertical: 3,
    fontSize: 8.5,
    fontWeight: 500,
  },
  statRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    marginBottom: 6,
  },
  linkBlock: {
    marginBottom: 8,
  },
  linkUrl: {
    fontSize: 8.5,
    marginTop: 2,
  },
});

export function ResumePdfDocument({
  title,
  person,
  document,
  templateKey,
}: {
  title: string;
  person: {
    name: string;
    headline: string;
    location: string;
    phone: string;
  };
  document: ResumeDocument;
  templateKey: ResumeTemplateKey;
}) {
  const theme = TEMPLATE_THEMES[templateKey].pdf;
  const visibleSections = getVisibleSections(document);
  const sectionGroups = getTemplateSectionGroups(templateKey, visibleSections);
  const contactLine = formatMetaPieces([person.location, person.phone]);

  if (templateKey === "HORIZON") {
    return (
      <Document title={`${title}.pdf`}>
        <Page size="A4" style={[styles.page, styles.horizonPage]}>
          <View style={styles.horizonShell}>
            <View style={[styles.horizonSidebar, { backgroundColor: theme.accentSoft }]}>
              <Text style={[styles.horizonName, { color: theme.title, marginTop: 0 }]}>{person.name || "Candidate"}</Text>
              <Text style={[styles.headline, { color: theme.text }]}>{person.headline || "Professional headline"}</Text>

              <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                <Text style={[styles.summaryHeading, { color: theme.accent }]}>Contact</Text>
                <Text style={[styles.summaryText, { marginTop: 6, color: theme.text }]}>
                  {person.location || "City, Country"}
                </Text>
                <Text style={[styles.paragraph, { marginTop: 0, color: theme.text }]}>{person.phone || "Phone number"}</Text>
              </View>

              {document.summary ? (
                <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border }]}>
                  <Text style={[styles.summaryHeading, { color: theme.accent }]}>Profile</Text>
                  <Text style={[styles.summaryText, { color: theme.text }]}>{document.summary}</Text>
                </View>
              ) : null}

              {sectionGroups.sidebarSections.map((section) => (
                <PdfSection
                  key={section}
                  section={section}
                  content={document.sections}
                  layout="horizon"
                  theme={theme}
                />
              ))}
            </View>

            <View style={styles.horizonMain}>
              {sectionGroups.mainSections.map((section) => (
                <PdfSection key={section} section={section} content={document.sections} layout="horizon" theme={theme} />
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  if (templateKey === "EMBER") {
    return (
      <Document title={`${title}.pdf`}>
        <Page size="A4" style={[styles.page, styles.emberPage]}>
          <View style={styles.emberHeader}>
            <View style={styles.headerRow}>
              <View style={{ maxWidth: 340 }}>
                <Text style={[styles.emberName, { marginTop: 0 }]}>{person.name || "Candidate"}</Text>
                <Text style={styles.emberHeadline}>{person.headline || "Professional headline"}</Text>
              </View>
              <View style={styles.metaStack}>
                <Text style={styles.emberMeta}>{person.location || "City, Country"}</Text>
                <Text style={styles.emberMeta}>{person.phone || "Phone number"}</Text>
              </View>
            </View>
            <View style={styles.emberDivider} />
            <Text style={styles.emberMeta}>{contactLine || "Add your contact details to strengthen recruiter trust."}</Text>
          </View>

          <View style={styles.emberColumns}>
            <View style={styles.emberMain}>
              {document.summary ? (
                <View style={[styles.summaryCard, { backgroundColor: theme.accentSoft, borderColor: theme.accentMuted }]}>
                  <Text style={[styles.summaryHeading, { color: theme.accent }]}>Professional summary</Text>
                  <Text style={[styles.summaryText, { color: theme.text }]}>{document.summary}</Text>
                </View>
              ) : null}

              {sectionGroups.mainSections.map((section) => (
                <PdfSection key={section} section={section} content={document.sections} layout="ember" theme={theme} />
              ))}
            </View>

            <View style={styles.emberSidebar}>
              {sectionGroups.sidebarSections.map((section) => (
                <PdfSection key={section} section={section} content={document.sections} layout="ember" theme={theme} />
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`${title}.pdf`}>
      <Page size="A4" style={[styles.page, styles.atlasPage]}>
        <View style={[styles.atlasHeader, { borderColor: theme.border }]}>
          <View style={styles.headerRow}>
            <View style={{ maxWidth: 360 }}>
              <Text style={[styles.atlasName, { color: theme.title }]}>{person.name || "Candidate"}</Text>
              <Text style={[styles.headline, { color: theme.text }]}>{person.headline || "Professional headline"}</Text>
            </View>
            <View style={styles.metaStack}>
              <Text style={[styles.metaText, { color: theme.muted }]}>{person.location || "City, Country"}</Text>
              <Text style={[styles.metaText, { color: theme.muted }]}>{person.phone || "Phone number"}</Text>
            </View>
          </View>
        </View>

        {document.summary ? (
          <View style={[styles.summaryCard, { backgroundColor: theme.accentSoft, borderColor: theme.border }]}>
            <Text style={[styles.summaryHeading, { color: theme.title }]}>Professional summary</Text>
            <Text style={[styles.summaryText, { color: theme.text }]}>{document.summary}</Text>
          </View>
        ) : null}

        {sectionGroups.mainSections.map((section) => (
          <PdfSection key={section} section={section} content={document.sections} layout="atlas" theme={theme} />
        ))}
      </Page>
    </Document>
  );
}

function PdfSection({
  section,
  content,
  layout,
  theme,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
}) {
  const sectionContainerStyle =
    layout === "atlas"
      ? { marginBottom: 14 }
      : {
          ...styles.cardSection,
          backgroundColor: layout === "ember" ? "#fafaf9" : theme.surface,
          borderColor: theme.border,
        };

  return (
    <View style={sectionContainerStyle}>
      <PdfSectionHeading layout={layout} color={theme.accent} accentMuted={theme.accentSoft}>
        {getSectionHeading(section)}
      </PdfSectionHeading>
      <View style={styles.sectionBody}>
        <PdfSectionContent section={section} content={content} layout={layout} theme={theme} />
      </View>
    </View>
  );
}

function PdfSectionHeading({
  children,
  layout,
  color,
  accentMuted,
}: {
  children: React.ReactNode;
  layout: "atlas" | "horizon" | "ember";
  color: string;
  accentMuted: string;
}) {
  if (layout === "atlas") {
    return (
      <View style={styles.atlasSectionHeading}>
        <View style={[styles.atlasDot, { backgroundColor: color }]} />
        <Text style={[styles.summaryHeading, { color: "#64748b" }]}>{children}</Text>
      </View>
    );
  }

  if (layout === "horizon") {
    return (
      <View>
        <View style={[styles.horizonRule, { backgroundColor: color }]} />
        <Text style={[styles.horizonSectionTitle, { color: "#334155" }]}>{children}</Text>
      </View>
    );
  }

  return (
    <View style={[styles.emberPill, { backgroundColor: accentMuted }]}>
      <Text style={[styles.emberPillText, { color }]}>{children}</Text>
    </View>
  );
}

function PdfSectionContent({
  section,
  content,
  layout,
  theme,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
}) {
  if (section === "skills") {
    return (
      <View style={styles.chips}>
        {content.skills.map((skill) => (
          <Text
            key={skill}
            style={[styles.chip, { borderColor: theme.accentMuted, backgroundColor: theme.accentSoft, color: theme.text }]}
          >
            {skill}
          </Text>
        ))}
      </View>
    );
  }

  if (section === "languages") {
    return (
      <View>
        {content.languages.map((item) => (
          <View key={item.id} style={styles.statRow}>
            <Text style={{ color: theme.text }}>{item.name}</Text>
            <Text style={{ color: theme.muted }}>{item.proficiency}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (section === "links") {
    return (
      <View>
        {content.links.map((item) => (
          <View key={item.id} style={styles.linkBlock}>
            <Link src={item.url} style={{ color: theme.title, fontSize: 9.5, textDecoration: "none" }}>
              {item.label}
            </Link>
            <Text style={[styles.linkUrl, { color: theme.muted }]}>{item.url}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (section === "certifications") {
    return <PdfCredentialList items={content.certifications} layout={layout} theme={theme} />;
  }

  if (section === "awards") {
    return <PdfAwardList items={content.awards} layout={layout} theme={theme} />;
  }

  const items = content[section];

  if (!Array.isArray(items)) {
    return null;
  }

  return (
    <View>
      {items.map((item, index) => (
        <PdfEntry
          key={item.id}
          item={item}
          layout={layout}
          theme={theme}
          isLast={index === items.length - 1}
        />
      ))}
    </View>
  );
}

function PdfEntry({
  item,
  layout,
  theme,
  isLast,
}: {
  item: ProfileListEntry;
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.item,
        ...(layout === "ember" ? [styles.emberItem, { borderColor: theme.border }] : []),
        ...(layout === "ember" && isLast ? [{ marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 }] : []),
      ]}
    >
      <View style={styles.itemRow}>
        <View style={{ maxWidth: "73%" }}>
          <Text style={[styles.itemTitle, { color: theme.title }]}>{item.title}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted }]}>{formatMetaPieces([item.organization, item.location])}</Text>
        </View>
        <Text style={[styles.itemMeta, { color: theme.muted }]}>{item.date}</Text>
      </View>
      {item.description ? <Text style={[styles.paragraph, { color: theme.text }]}>{item.description}</Text> : null}
      {item.bullets.filter(Boolean).map((bullet, index) => (
        <Text key={`${item.id}-${index}`} style={[styles.bullet, { color: theme.text }]}>
          - {bullet}
        </Text>
      ))}
      {item.url ? (
        <Link src={item.url} style={{ marginTop: 6, color: theme.title, fontSize: 9 }}>
          {item.url}
        </Link>
      ) : null}
    </View>
  );
}

function PdfCredentialList({
  items,
  layout,
  theme,
}: {
  items: CertificationEntry[];
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
}) {
  return (
    <View>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={
            layout === "ember"
              ? [
                  styles.cardSection,
                  {
                    marginBottom: index === items.length - 1 ? 0 : 10,
                    padding: 10,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]
              : [styles.item, { marginBottom: index === items.length - 1 ? 0 : 10 }]
          }
        >
          <Text style={[styles.itemTitle, { color: theme.title }]}>{item.title}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted }]}>{formatMetaPieces([item.issuer, item.date])}</Text>
          {item.credentialId ? <Text style={[styles.paragraph, { marginTop: 2, color: theme.text }]}>Credential ID: {item.credentialId}</Text> : null}
          {item.url ? (
            <Link src={item.url} style={{ marginTop: 4, color: theme.title, fontSize: 9 }}>
              {item.url}
            </Link>
          ) : null}
        </View>
      ))}
    </View>
  );
}

function PdfAwardList({
  items,
  layout,
  theme,
}: {
  items: AwardEntry[];
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
}) {
  return (
    <View>
      {items.map((item, index) => (
        <View
          key={item.id}
          style={
            layout === "ember"
              ? [
                  styles.cardSection,
                  {
                    marginBottom: index === items.length - 1 ? 0 : 10,
                    padding: 10,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]
              : [styles.item, { marginBottom: index === items.length - 1 ? 0 : 10 }]
          }
        >
          <Text style={[styles.itemTitle, { color: theme.title }]}>{item.title}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted }]}>{formatMetaPieces([item.issuer, item.date])}</Text>
          {item.description ? <Text style={[styles.paragraph, { marginTop: 2, color: theme.text }]}>{item.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}
