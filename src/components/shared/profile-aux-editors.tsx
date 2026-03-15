"use client";

import { Plus, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import type { AwardEntry, CertificationEntry, LanguageEntry, LinkEntry } from "@/lib/validations/profile";
import { createId } from "@/lib/utils";

export function CertificationEditor({
  items,
  onChange,
}: {
  items: CertificationEntry[];
  onChange: (items: CertificationEntry[]) => void;
}) {
  return (
    <AuxGrid
      title="Certifications"
      description="Certifications help early-career candidates show practical readiness without overstating experience."
      items={items}
      onAdd={() => onChange([...items, { id: createId(), title: "", issuer: "", date: "", credentialId: "", url: "" }])}
      render={(item, index) => (
        <>
          <Field label="Title" value={item.title} onChange={(value) => update(items, index, onChange, { ...item, title: value })} />
          <Field label="Issuer" value={item.issuer} onChange={(value) => update(items, index, onChange, { ...item, issuer: value })} />
          <Field label="Date" value={item.date} onChange={(value) => update(items, index, onChange, { ...item, date: value })} />
          <Field label="Credential ID" value={item.credentialId || ""} onChange={(value) => update(items, index, onChange, { ...item, credentialId: value })} />
          <div className="md:col-span-2">
            <Field label="URL" value={item.url || ""} onChange={(value) => update(items, index, onChange, { ...item, url: value })} />
          </div>
        </>
      )}
      onRemove={(item) => onChange(items.filter((current) => current.id !== item.id))}
    />
  );
}

export function AwardEditor({
  items,
  onChange,
}: {
  items: AwardEntry[];
  onChange: (items: AwardEntry[]) => void;
}) {
  return (
    <AuxGrid
      title="Awards"
      description="Academic and extracurricular recognition can strengthen low-experience resumes when phrased credibly."
      items={items}
      onAdd={() => onChange([...items, { id: createId(), title: "", issuer: "", date: "", description: "" }])}
      render={(item, index) => (
        <>
          <Field label="Title" value={item.title} onChange={(value) => update(items, index, onChange, { ...item, title: value })} />
          <Field label="Issuer" value={item.issuer} onChange={(value) => update(items, index, onChange, { ...item, issuer: value })} />
          <Field label="Date" value={item.date} onChange={(value) => update(items, index, onChange, { ...item, date: value })} />
          <div className="md:col-span-2">
            <Field label="Description" value={item.description || ""} onChange={(value) => update(items, index, onChange, { ...item, description: value })} />
          </div>
        </>
      )}
      onRemove={(item) => onChange(items.filter((current) => current.id !== item.id))}
    />
  );
}

export function LanguageEditor({
  items,
  onChange,
}: {
  items: LanguageEntry[];
  onChange: (items: LanguageEntry[]) => void;
}) {
  return (
    <AuxGrid
      title="Languages"
      description="List language ability accurately. Do not overstate fluency."
      items={items}
      onAdd={() => onChange([...items, { id: createId(), name: "", proficiency: "" }])}
      render={(item, index) => (
        <>
          <Field label="Language" value={item.name} onChange={(value) => update(items, index, onChange, { ...item, name: value })} />
          <Field label="Proficiency" value={item.proficiency} onChange={(value) => update(items, index, onChange, { ...item, proficiency: value })} />
        </>
      )}
      onRemove={(item) => onChange(items.filter((current) => current.id !== item.id))}
    />
  );
}

export function LinkEditor({
  items,
  onChange,
  title = "Links",
  description = "Keep only links that improve recruiter trust, such as LinkedIn, GitHub, portfolio, or key projects.",
}: {
  items: LinkEntry[];
  onChange: (items: LinkEntry[]) => void;
  title?: string;
  description?: string;
}) {
  return (
    <AuxGrid
      title={title}
      description={description}
      items={items}
      onAdd={() => onChange([...items, { id: createId(), label: "", url: "" }])}
      render={(item, index) => (
        <>
          <Field label="Label" value={item.label} onChange={(value) => update(items, index, onChange, { ...item, label: value })} />
          <Field label="URL" value={item.url} onChange={(value) => update(items, index, onChange, { ...item, url: value })} />
        </>
      )}
      onRemove={(item) => onChange(items.filter((current) => current.id !== item.id))}
    />
  );
}

function update<T extends { id: string }>(items: T[], index: number, onChange: (items: T[]) => void, nextItem: T) {
  onChange(items.map((item, currentIndex) => (currentIndex === index ? nextItem : item)));
}

function Field({ label, value, onChange }: { label: string; value: string; onChange: (value: string) => void }) {
  return (
    <div className="space-y-2">
      <Label>{label}</Label>
      <Input value={value} onChange={(event) => onChange(event.target.value)} />
    </div>
  );
}

function AuxGrid<T extends { id: string }>({
  title,
  description,
  items,
  render,
  onAdd,
  onRemove,
}: {
  title: string;
  description: string;
  items: T[];
  render: (item: T, index: number) => React.ReactNode;
  onAdd: () => void;
  onRemove: (item: T) => void;
}) {
  return (
    <div className="space-y-4">
      <div className="flex items-start justify-between gap-4">
        <div>
          <h3 className="text-lg font-semibold text-slate-950">{title}</h3>
          <p className="text-sm leading-7 text-slate-500">{description}</p>
        </div>
        <Button type="button" variant="secondary" onClick={onAdd}>
          <Plus className="h-4 w-4" />
          Add item
        </Button>
      </div>
      <div className="space-y-4">
        {items.map((item, index) => (
          <Card key={item.id} className="rounded-[28px] bg-white">
            <CardContent className="space-y-4 p-5">
              <div className="flex justify-end">
                <Button type="button" size="sm" variant="ghost" onClick={() => onRemove(item)}>
                  <Trash2 className="h-4 w-4" />
                  Remove
                </Button>
              </div>
              <div className="grid gap-4 md:grid-cols-2">{render(item, index)}</div>
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
