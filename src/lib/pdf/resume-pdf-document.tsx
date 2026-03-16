import { Document, Link, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ResumeTemplateKey } from "@prisma/client";

import {
  formatMetaPieces,
  getSectionHeading,
  getTemplateSectionGroups,
  getVisibleSections,
  TEMPLATE_THEMES,
} from "@/lib/resume-presentation";
import type { ResumeDensityMode } from "@/lib/resume-fit";
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

type PdfTuning = {
  baseFontSize: number;
  atlasPadding: number;
  emberPadding: number;
  horizonSidebarPaddingX: number;
  horizonSidebarPaddingY: number;
  horizonMainPaddingX: number;
  horizonMainPaddingY: number;
  headerMarginBottom: number;
  headerPaddingBottom: number;
  headerRadius: number;
  nameSize: number;
  horizonNameSize: number;
  emberNameSize: number;
  headlineSize: number;
  headlineLineHeight: number;
  metaSize: number;
  metaLineHeight: number;
  metaWidth: number;
  summaryMarginBottom: number;
  summaryRadius: number;
  summaryPadding: number;
  summaryTextSize: number;
  summaryTextLineHeight: number;
  sectionGap: number;
  cardRadius: number;
  cardPadding: number;
  sectionBodyMarginTop: number;
  itemGap: number;
  itemMetaSize: number;
  itemMetaLineHeight: number;
  paragraphSize: number;
  paragraphLineHeight: number;
  bulletSize: number;
  bulletLineHeight: number;
  bulletMarginLeft: number;
  chipRadius: number;
  chipPaddingX: number;
  chipPaddingY: number;
  chipFontSize: number;
  linkSize: number;
  linkMetaSize: number;
};

function getPdfTuning(density: ResumeDensityMode): PdfTuning {
  if (density === "compressed") {
    return {
      baseFontSize: 9.1,
      atlasPadding: 28,
      emberPadding: 22,
      horizonSidebarPaddingX: 18,
      horizonSidebarPaddingY: 22,
      horizonMainPaddingX: 22,
      horizonMainPaddingY: 24,
      headerMarginBottom: 14,
      headerPaddingBottom: 10,
      headerRadius: 18,
      nameSize: 20,
      horizonNameSize: 21,
      emberNameSize: 21,
      headlineSize: 9.6,
      headlineLineHeight: 1.4,
      metaSize: 8.2,
      metaLineHeight: 1.35,
      metaWidth: 164,
      summaryMarginBottom: 14,
      summaryRadius: 14,
      summaryPadding: 10,
      summaryTextSize: 8.8,
      summaryTextLineHeight: 1.45,
      sectionGap: 10,
      cardRadius: 14,
      cardPadding: 10,
      sectionBodyMarginTop: 7,
      itemGap: 7,
      itemMetaSize: 8.1,
      itemMetaLineHeight: 1.3,
      paragraphSize: 8.6,
      paragraphLineHeight: 1.35,
      bulletSize: 8.5,
      bulletLineHeight: 1.33,
      bulletMarginLeft: 6,
      chipRadius: 999,
      chipPaddingX: 6,
      chipPaddingY: 2,
      chipFontSize: 7.5,
      linkSize: 8.1,
      linkMetaSize: 7.6,
    };
  }

  if (density === "compact") {
    return {
      baseFontSize: 9.5,
      atlasPadding: 32,
      emberPadding: 24,
      horizonSidebarPaddingX: 21,
      horizonSidebarPaddingY: 24,
      horizonMainPaddingX: 25,
      horizonMainPaddingY: 27,
      headerMarginBottom: 16,
      headerPaddingBottom: 12,
      headerRadius: 19,
      nameSize: 21.5,
      horizonNameSize: 22.5,
      emberNameSize: 22.5,
      headlineSize: 10.2,
      headlineLineHeight: 1.45,
      metaSize: 8.5,
      metaLineHeight: 1.4,
      metaWidth: 172,
      summaryMarginBottom: 16,
      summaryRadius: 16,
      summaryPadding: 12,
      summaryTextSize: 9.2,
      summaryTextLineHeight: 1.52,
      sectionGap: 12,
      cardRadius: 16,
      cardPadding: 12,
      sectionBodyMarginTop: 8,
      itemGap: 8,
      itemMetaSize: 8.4,
      itemMetaLineHeight: 1.35,
      paragraphSize: 8.9,
      paragraphLineHeight: 1.42,
      bulletSize: 8.8,
      bulletLineHeight: 1.38,
      bulletMarginLeft: 7,
      chipRadius: 999,
      chipPaddingX: 7,
      chipPaddingY: 2.5,
      chipFontSize: 7.9,
      linkSize: 8.4,
      linkMetaSize: 7.9,
    };
  }

  return {
    baseFontSize: 10,
    atlasPadding: 36,
    emberPadding: 28,
    horizonSidebarPaddingX: 24,
    horizonSidebarPaddingY: 28,
    horizonMainPaddingX: 28,
    horizonMainPaddingY: 30,
    headerMarginBottom: 18,
    headerPaddingBottom: 14,
    headerRadius: 20,
    nameSize: 23,
    horizonNameSize: 24,
    emberNameSize: 24,
    headlineSize: 11,
    headlineLineHeight: 1.5,
    metaSize: 9,
    metaLineHeight: 1.5,
    metaWidth: 180,
    summaryMarginBottom: 18,
    summaryRadius: 18,
    summaryPadding: 14,
    summaryTextSize: 10,
    summaryTextLineHeight: 1.65,
    sectionGap: 14,
    cardRadius: 18,
    cardPadding: 14,
    sectionBodyMarginTop: 10,
    itemGap: 10,
    itemMetaSize: 9,
    itemMetaLineHeight: 1.45,
    paragraphSize: 9.5,
    paragraphLineHeight: 1.55,
    bulletSize: 9.5,
    bulletLineHeight: 1.5,
    bulletMarginLeft: 8,
    chipRadius: 999,
    chipPaddingX: 8,
    chipPaddingY: 3,
    chipFontSize: 8.5,
    linkSize: 9,
    linkMetaSize: 8.5,
  };
}

export function ResumePdfDocument({
  title,
  person,
  document,
  templateKey,
  density = "balanced",
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
  density?: ResumeDensityMode;
}) {
  const theme = TEMPLATE_THEMES[templateKey].pdf;
  const visibleSections = getVisibleSections(document);
  const sectionGroups = getTemplateSectionGroups(templateKey, visibleSections);
  const contactLine = formatMetaPieces([person.location, person.phone]);
  const tuning = getPdfTuning(density);

  if (templateKey === "HORIZON") {
    return (
      <Document title={`${title}.pdf`}>
        <Page size="A4" style={[styles.page, styles.horizonPage, { fontSize: tuning.baseFontSize }]}>
          <View style={styles.horizonShell}>
            <View
              style={[
                styles.horizonSidebar,
                {
                  backgroundColor: theme.accentSoft,
                  paddingHorizontal: tuning.horizonSidebarPaddingX,
                  paddingVertical: tuning.horizonSidebarPaddingY,
                },
              ]}
            >
              <Text style={[styles.horizonName, { color: theme.title, marginTop: 0, fontSize: tuning.horizonNameSize }]}>{person.name || "Candidate"}</Text>
              <Text style={[styles.headline, { color: theme.text, fontSize: tuning.headlineSize, lineHeight: tuning.headlineLineHeight }]}>{person.headline || "Professional headline"}</Text>

              <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: tuning.cardRadius, padding: tuning.cardPadding }]}>
                <Text style={[styles.summaryHeading, { color: theme.accent }]}>Contact</Text>
                <Text style={[styles.summaryText, { marginTop: 6, color: theme.text, fontSize: tuning.summaryTextSize, lineHeight: tuning.summaryTextLineHeight }]}>
                  {person.location || "City, Country"}
                </Text>
                <Text style={[styles.paragraph, { marginTop: 0, color: theme.text, fontSize: tuning.paragraphSize, lineHeight: tuning.paragraphLineHeight }]}>{person.phone || "Phone number"}</Text>
              </View>

              {document.summary ? (
                <View style={[styles.panel, { backgroundColor: theme.surface, borderColor: theme.border, borderRadius: tuning.cardRadius, padding: tuning.cardPadding }]}>
                  <Text style={[styles.summaryHeading, { color: theme.accent }]}>Profile</Text>
                  <Text style={[styles.summaryText, { color: theme.text, fontSize: tuning.summaryTextSize, lineHeight: tuning.summaryTextLineHeight }]}>{document.summary}</Text>
                </View>
              ) : null}

              {sectionGroups.sidebarSections.map((section) => (
                <PdfSection
                  key={section}
                  section={section}
                  content={document.sections}
                  layout="horizon"
                  theme={theme}
                  tuning={tuning}
                />
              ))}
            </View>

            <View style={[styles.horizonMain, { paddingHorizontal: tuning.horizonMainPaddingX, paddingVertical: tuning.horizonMainPaddingY }]}>
              {sectionGroups.mainSections.map((section) => (
                <PdfSection key={section} section={section} content={document.sections} layout="horizon" theme={theme} tuning={tuning} />
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
        <Page size="A4" style={[styles.page, styles.emberPage, { fontSize: tuning.baseFontSize, padding: tuning.emberPadding }]}>
          <View style={[styles.emberHeader, { marginBottom: tuning.headerMarginBottom, borderRadius: tuning.headerRadius, paddingHorizontal: tuning.cardPadding + 8, paddingVertical: tuning.cardPadding + 6 }]}>
            <View style={styles.headerRow}>
              <View style={{ maxWidth: 340 }}>
                <Text style={[styles.emberName, { marginTop: 0, fontSize: tuning.emberNameSize }]}>{person.name || "Candidate"}</Text>
                <Text style={[styles.emberHeadline, { fontSize: tuning.headlineSize, lineHeight: tuning.headlineLineHeight }]}>{person.headline || "Professional headline"}</Text>
              </View>
              <View style={[styles.metaStack, { maxWidth: tuning.metaWidth }]}>
                <Text style={[styles.emberMeta, { fontSize: tuning.metaSize, lineHeight: tuning.metaLineHeight }]}>{person.location || "City, Country"}</Text>
                <Text style={[styles.emberMeta, { fontSize: tuning.metaSize, lineHeight: tuning.metaLineHeight }]}>{person.phone || "Phone number"}</Text>
              </View>
            </View>
            <View style={styles.emberDivider} />
            <Text style={[styles.emberMeta, { fontSize: tuning.metaSize, lineHeight: tuning.metaLineHeight }]}>{contactLine || "Add your contact details to strengthen recruiter trust."}</Text>
          </View>

          <View style={styles.emberColumns}>
            <View style={[styles.emberMain, { paddingRight: density === "compressed" ? 12 : density === "compact" ? 15 : 18 }]}>
              {document.summary ? (
                <View style={[styles.summaryCard, { backgroundColor: theme.accentSoft, borderColor: theme.accentMuted, marginBottom: tuning.summaryMarginBottom, borderRadius: tuning.summaryRadius, padding: tuning.summaryPadding }]}>
                  <Text style={[styles.summaryHeading, { color: theme.accent }]}>Professional summary</Text>
                  <Text style={[styles.summaryText, { color: theme.text, fontSize: tuning.summaryTextSize, lineHeight: tuning.summaryTextLineHeight }]}>{document.summary}</Text>
                </View>
              ) : null}

              {sectionGroups.mainSections.map((section) => (
                <PdfSection key={section} section={section} content={document.sections} layout="ember" theme={theme} tuning={tuning} />
              ))}
            </View>

            <View style={styles.emberSidebar}>
              {sectionGroups.sidebarSections.map((section) => (
                <PdfSection key={section} section={section} content={document.sections} layout="ember" theme={theme} tuning={tuning} />
              ))}
            </View>
          </View>
        </Page>
      </Document>
    );
  }

  return (
    <Document title={`${title}.pdf`}>
      <Page size="A4" style={[styles.page, styles.atlasPage, { fontSize: tuning.baseFontSize, padding: tuning.atlasPadding }]}>
        <View style={[styles.atlasHeader, { borderColor: theme.border, marginBottom: tuning.headerMarginBottom, paddingBottom: tuning.headerPaddingBottom }]}>
          <View style={styles.headerRow}>
            <View style={{ maxWidth: 360 }}>
              <Text style={[styles.atlasName, { color: theme.title, fontSize: tuning.nameSize }]}>{person.name || "Candidate"}</Text>
              <Text style={[styles.headline, { color: theme.text, fontSize: tuning.headlineSize, lineHeight: tuning.headlineLineHeight }]}>{person.headline || "Professional headline"}</Text>
            </View>
            <View style={[styles.metaStack, { maxWidth: tuning.metaWidth }]}>
              <Text style={[styles.metaText, { color: theme.muted, fontSize: tuning.metaSize, lineHeight: tuning.metaLineHeight }]}>{person.location || "City, Country"}</Text>
              <Text style={[styles.metaText, { color: theme.muted, fontSize: tuning.metaSize, lineHeight: tuning.metaLineHeight }]}>{person.phone || "Phone number"}</Text>
            </View>
          </View>
        </View>

        {document.summary ? (
          <View style={[styles.summaryCard, { backgroundColor: theme.accentSoft, borderColor: theme.border, marginBottom: tuning.summaryMarginBottom, borderRadius: tuning.summaryRadius, padding: tuning.summaryPadding }]}>
            <Text style={[styles.summaryHeading, { color: theme.title }]}>Professional summary</Text>
            <Text style={[styles.summaryText, { color: theme.text, fontSize: tuning.summaryTextSize, lineHeight: tuning.summaryTextLineHeight }]}>{document.summary}</Text>
          </View>
        ) : null}

        {sectionGroups.mainSections.map((section) => (
          <PdfSection key={section} section={section} content={document.sections} layout="atlas" theme={theme} tuning={tuning} />
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
  tuning,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
  tuning: PdfTuning;
}) {
  const sectionContainerStyle =
    layout === "atlas"
      ? { marginBottom: tuning.sectionGap }
      : {
          ...styles.cardSection,
          backgroundColor: layout === "ember" ? "#fafaf9" : theme.surface,
          borderColor: theme.border,
          borderRadius: tuning.cardRadius,
          padding: tuning.cardPadding,
          marginBottom: tuning.sectionGap,
        };

  return (
    <View style={sectionContainerStyle}>
      <PdfSectionHeading layout={layout} color={theme.accent} accentMuted={theme.accentSoft} tuning={tuning}>
        {getSectionHeading(section)}
      </PdfSectionHeading>
      <View style={[styles.sectionBody, { marginTop: tuning.sectionBodyMarginTop }]}>
        <PdfSectionContent section={section} content={content} layout={layout} theme={theme} tuning={tuning} />
      </View>
    </View>
  );
}

function PdfSectionHeading({
  children,
  layout,
  color,
  accentMuted,
  tuning,
}: {
  children: React.ReactNode;
  layout: "atlas" | "horizon" | "ember";
  color: string;
  accentMuted: string;
  tuning: PdfTuning;
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
    <View style={[styles.emberPill, { backgroundColor: accentMuted, paddingHorizontal: tuning.chipPaddingX + 2, paddingVertical: tuning.chipPaddingY + 1 }]}>
      <Text style={[styles.emberPillText, { color }]}>{children}</Text>
    </View>
  );
}

function PdfSectionContent({
  section,
  content,
  layout,
  theme,
  tuning,
}: {
  section: keyof ProfileContent;
  content: ProfileContent;
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
  tuning: PdfTuning;
}) {
  if (section === "skills") {
    return (
      <View style={styles.chips}>
        {content.skills.map((skill) => (
          <Text
            key={skill}
            style={[
              styles.chip,
              {
                borderColor: theme.accentMuted,
                backgroundColor: theme.accentSoft,
                color: theme.text,
                borderRadius: tuning.chipRadius,
                paddingHorizontal: tuning.chipPaddingX,
                paddingVertical: tuning.chipPaddingY,
                fontSize: tuning.chipFontSize,
              },
            ]}
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
            <Text style={{ color: theme.text, fontSize: tuning.paragraphSize }}>{item.name}</Text>
            <Text style={{ color: theme.muted, fontSize: tuning.itemMetaSize }}>{item.proficiency}</Text>
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
            <Link src={item.url} style={{ color: theme.title, fontSize: tuning.linkSize, textDecoration: "none" }}>
              {item.label}
            </Link>
            <Text style={[styles.linkUrl, { color: theme.muted, fontSize: tuning.linkMetaSize }]}>{item.url}</Text>
          </View>
        ))}
      </View>
    );
  }

  if (section === "certifications") {
    return <PdfCredentialList items={content.certifications} layout={layout} theme={theme} tuning={tuning} />;
  }

  if (section === "awards") {
    return <PdfAwardList items={content.awards} layout={layout} theme={theme} tuning={tuning} />;
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
          tuning={tuning}
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
  tuning,
  isLast,
}: {
  item: ProfileListEntry;
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
  tuning: PdfTuning;
  isLast: boolean;
}) {
  return (
    <View
      style={[
        styles.item,
        { marginBottom: tuning.itemGap },
        ...(layout === "ember" ? [styles.emberItem, { borderColor: theme.border }] : []),
        ...(layout === "ember" && isLast ? [{ marginBottom: 0, paddingBottom: 0, borderBottomWidth: 0 }] : []),
      ]}
    >
      <View style={styles.itemRow}>
        <View style={{ maxWidth: "73%" }}>
          <Text style={[styles.itemTitle, { color: theme.title, fontSize: tuning.paragraphSize }]}>{item.title}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted, fontSize: tuning.itemMetaSize, lineHeight: tuning.itemMetaLineHeight }]}>{formatMetaPieces([item.organization, item.location])}</Text>
        </View>
        <Text style={[styles.itemMeta, { color: theme.muted, fontSize: tuning.itemMetaSize, lineHeight: tuning.itemMetaLineHeight }]}>{item.date}</Text>
      </View>
      {item.description ? <Text style={[styles.paragraph, { color: theme.text, fontSize: tuning.paragraphSize, lineHeight: tuning.paragraphLineHeight }]}>{item.description}</Text> : null}
      {item.bullets.filter(Boolean).map((bullet, index) => (
        <Text key={`${item.id}-${index}`} style={[styles.bullet, { color: theme.text, fontSize: tuning.bulletSize, lineHeight: tuning.bulletLineHeight, marginLeft: tuning.bulletMarginLeft }]}>
          - {bullet}
        </Text>
      ))}
      {item.url ? (
        <Link src={item.url} style={{ marginTop: 6, color: theme.title, fontSize: tuning.linkSize }}>
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
  tuning,
}: {
  items: CertificationEntry[];
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
  tuning: PdfTuning;
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
                    padding: tuning.cardPadding - 2,
                    borderRadius: tuning.cardRadius,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]
              : [styles.item, { marginBottom: index === items.length - 1 ? 0 : tuning.itemGap }]
          }
        >
          <Text style={[styles.itemTitle, { color: theme.title, fontSize: tuning.paragraphSize }]}>{item.title}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted, fontSize: tuning.itemMetaSize, lineHeight: tuning.itemMetaLineHeight }]}>{formatMetaPieces([item.issuer, item.date])}</Text>
          {item.credentialId ? <Text style={[styles.paragraph, { marginTop: 2, color: theme.text, fontSize: tuning.paragraphSize, lineHeight: tuning.paragraphLineHeight }]}>Credential ID: {item.credentialId}</Text> : null}
          {item.url ? (
            <Link src={item.url} style={{ marginTop: 4, color: theme.title, fontSize: tuning.linkSize }}>
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
  tuning,
}: {
  items: AwardEntry[];
  layout: "atlas" | "horizon" | "ember";
  theme: (typeof TEMPLATE_THEMES)[ResumeTemplateKey]["pdf"];
  tuning: PdfTuning;
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
                    padding: tuning.cardPadding - 2,
                    borderRadius: tuning.cardRadius,
                    backgroundColor: theme.surface,
                    borderColor: theme.border,
                  },
                ]
              : [styles.item, { marginBottom: index === items.length - 1 ? 0 : tuning.itemGap }]
          }
        >
          <Text style={[styles.itemTitle, { color: theme.title, fontSize: tuning.paragraphSize }]}>{item.title}</Text>
          <Text style={[styles.itemMeta, { color: theme.muted, fontSize: tuning.itemMetaSize, lineHeight: tuning.itemMetaLineHeight }]}>{formatMetaPieces([item.issuer, item.date])}</Text>
          {item.description ? <Text style={[styles.paragraph, { marginTop: 2, color: theme.text, fontSize: tuning.paragraphSize, lineHeight: tuning.paragraphLineHeight }]}>{item.description}</Text> : null}
        </View>
      ))}
    </View>
  );
}
