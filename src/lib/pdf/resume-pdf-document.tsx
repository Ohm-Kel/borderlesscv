import { Document, Page, StyleSheet, Text, View } from "@react-pdf/renderer";

import type { ProfileListEntry } from "@/lib/validations/profile";
import type { ResumeDocument } from "@/lib/validations/resume";

const styles = StyleSheet.create({
  page: {
    padding: 36,
    fontSize: 10,
    color: "#0f172a",
    fontFamily: "Helvetica",
  },
  header: {
    marginBottom: 18,
    paddingBottom: 12,
    borderBottom: "1 solid #e2e8f0",
  },
  name: {
    fontSize: 22,
    fontWeight: 700,
    marginBottom: 4,
  },
  headline: {
    fontSize: 11,
    color: "#475569",
  },
  meta: {
    marginTop: 8,
    color: "#64748b",
    fontSize: 9,
  },
  section: {
    marginTop: 12,
  },
  sectionTitle: {
    fontSize: 9,
    textTransform: "uppercase",
    letterSpacing: 1.4,
    color: "#475569",
    marginBottom: 6,
  },
  item: {
    marginBottom: 8,
  },
  row: {
    flexDirection: "row",
    justifyContent: "space-between",
    gap: 8,
  },
  itemTitle: {
    fontWeight: 700,
    marginBottom: 2,
  },
  itemMeta: {
    color: "#64748b",
    marginBottom: 2,
  },
  paragraph: {
    lineHeight: 1.5,
    marginBottom: 4,
  },
  bullet: {
    marginLeft: 8,
    marginBottom: 2,
  },
  chipRow: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: 6,
  },
  chip: {
    backgroundColor: "#f1f5f9",
    paddingHorizontal: 8,
    paddingVertical: 3,
    borderRadius: 10,
    marginRight: 6,
    marginBottom: 6,
  },
});

export function ResumePdfDocument({
  title,
  person,
  document,
}: {
  title: string;
  person: {
    name: string;
    headline: string;
    location: string;
    phone: string;
  };
  document: ResumeDocument;
}) {
  return (
    <Document title={`${title}.pdf`}>
      <Page size="A4" style={styles.page}>
        <View style={styles.header}>
          <Text style={styles.name}>{person.name || "Candidate"}</Text>
          <Text style={styles.headline}>{person.headline || "Professional headline"}</Text>
          <Text style={styles.meta}>
            {[person.location, person.phone, ...document.sections.links.map((item) => `${item.label}: ${item.url}`)].filter(Boolean).join(" • ")}
          </Text>
        </View>

        {document.summary ? (
          <View style={styles.section}>
            <Text style={styles.sectionTitle}>Professional Summary</Text>
            <Text style={styles.paragraph}>{document.summary}</Text>
          </View>
        ) : null}

        {document.sectionOrder
          .filter((section) => !document.hiddenSections.includes(section))
          .map((section) => {
            const value = document.sections[section];

            if (section === "skills" && value.length) {
              return (
                <View key={section} style={styles.section}>
                  <Text style={styles.sectionTitle}>Skills</Text>
                  <View style={styles.chipRow}>
                    {document.sections.skills.map((skill) => (
                      <Text key={skill} style={styles.chip}>
                        {skill}
                      </Text>
                    ))}
                  </View>
                </View>
              );
            }

            if (section === "languages" && value.length) {
              return (
                <View key={section} style={styles.section}>
                  <Text style={styles.sectionTitle}>Languages</Text>
                  {document.sections.languages.map((item) => (
                    <View key={item.id} style={styles.item}>
                      <Text style={styles.paragraph}>
                        {item.name} - {item.proficiency}
                      </Text>
                    </View>
                  ))}
                </View>
              );
            }

            if (!Array.isArray(value) || value.length === 0) {
              return null;
            }

            return (
              <View key={section} style={styles.section}>
                <Text style={styles.sectionTitle}>{section === "experience" ? "Work Experience" : section}</Text>
                {(value as ProfileListEntry[]).map((item) => (
                  <View key={item.id} style={styles.item}>
                    <View style={styles.row}>
                      <View>
                        <Text style={styles.itemTitle}>{item.title}</Text>
                        <Text style={styles.itemMeta}>
                          {item.organization}
                          {item.location ? ` • ${item.location}` : ""}
                        </Text>
                      </View>
                      <Text style={styles.itemMeta}>{item.date}</Text>
                    </View>
                    {item.description ? <Text style={styles.paragraph}>{item.description}</Text> : null}
                    {item.bullets?.map((bullet: string, index: number) => (
                      <Text key={`${item.id}-${index}`} style={styles.bullet}>
                        • {bullet}
                      </Text>
                    ))}
                  </View>
                ))}
              </View>
            );
          })}
      </Page>
    </Document>
  );
}
