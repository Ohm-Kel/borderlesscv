"use client";

import { ChevronDown, GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import type { ProfileListEntry } from "@/lib/validations/profile";
import { createId } from "@/lib/utils";

function createEmptyEntry(): ProfileListEntry {
  return {
    id: createId(),
    title: "",
    organization: "",
    location: "",
    date: "",
    description: "",
    bullets: [""],
    url: "",
  };
}

export function ListSectionEditor({
  title,
  description,
  items,
  onChange,
  onRewriteBullet,
  pendingBulletKey,
  compact = false,
  defaultOpen = true,
}: {
  title: string;
  description: string;
  items: ProfileListEntry[];
  onChange: (nextItems: ProfileListEntry[]) => void;
  onRewriteBullet?: (entryIndex: number, bulletIndex: number, bullet: string) => void;
  pendingBulletKey?: string | null;
  compact?: boolean;
  defaultOpen?: boolean;
}) {
  function updateItem(index: number, updater: (item: ProfileListEntry) => ProfileListEntry) {
    onChange(items.map((item, currentIndex) => (currentIndex === index ? updater(item) : item)));
  }

  function renderEntry(item: ProfileListEntry, index: number) {
    const hasEntrySummary = Boolean(item.title || item.organization || item.date || item.location);
    const summary = [item.title || `Entry ${index + 1}`, item.organization, item.date].filter(Boolean).join(" - ");
    const nonEmptyBullets = item.bullets.filter((bullet) => bullet.trim()).length;
    const entryBody = (
      <div className="space-y-4 p-4">
        <div className="flex items-center justify-between">
          <div className="flex items-center gap-2 text-sm font-medium text-slate-500">
            <GripVertical className="h-4 w-4" />
            Entry {index + 1}
          </div>
          <Button type="button" size="sm" variant="ghost" onClick={() => onChange(items.filter((current) => current.id !== item.id))}>
            <Trash2 className="h-4 w-4" />
            Remove
          </Button>
        </div>
        <div className="grid gap-3 md:grid-cols-2">
          <div className="space-y-2">
            <Label>Title</Label>
            <Input value={item.title} onChange={(event) => updateItem(index, (current) => ({ ...current, title: event.target.value }))} placeholder="Software Engineering Intern" />
          </div>
          <div className="space-y-2">
            <Label>Organization</Label>
            <Input value={item.organization} onChange={(event) => updateItem(index, (current) => ({ ...current, organization: event.target.value }))} placeholder="Acme Labs" />
          </div>
          <div className="space-y-2">
            <Label>Location</Label>
            <Input value={item.location || ""} onChange={(event) => updateItem(index, (current) => ({ ...current, location: event.target.value }))} placeholder="Accra, Ghana" />
          </div>
          <div className="space-y-2">
            <Label>Date range</Label>
            <Input value={item.date} onChange={(event) => updateItem(index, (current) => ({ ...current, date: event.target.value }))} placeholder="Jun 2025 - Aug 2025" />
          </div>
        </div>
        <div className="grid gap-3 md:grid-cols-[minmax(0,1fr)_240px]">
          <div className="space-y-2">
            <Label>Description</Label>
            <Textarea value={item.description || ""} onChange={(event) => updateItem(index, (current) => ({ ...current, description: event.target.value }))} className="min-h-[82px]" placeholder="Context for the role, project scope, or responsibilities." />
          </div>
          <div className="space-y-2">
            <Label>Link</Label>
            <Input value={item.url || ""} onChange={(event) => updateItem(index, (current) => ({ ...current, url: event.target.value }))} placeholder="https://..." />
          </div>
        </div>
        <div className="space-y-2.5">
          <div className="flex items-center justify-between">
            <Label>Bullets</Label>
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={() => updateItem(index, (current) => ({ ...current, bullets: [...current.bullets, ""] }))}
            >
              <Plus className="h-4 w-4" />
              Add bullet
            </Button>
          </div>
          <div className="space-y-2">
            {item.bullets.map((bullet, bulletIndex) => (
              <div key={`${item.id}-${bulletIndex}`} className="flex gap-2">
                <Textarea
                  value={bullet}
                  onChange={(event) =>
                    updateItem(index, (current) => ({
                      ...current,
                      bullets: current.bullets.map((currentBullet, currentBulletIndex) =>
                        currentBulletIndex === bulletIndex ? event.target.value : currentBullet,
                      ),
                    }))
                  }
                  className="min-h-[72px]"
                  placeholder="Describe what you delivered without inventing impact."
                />
                {onRewriteBullet ? (
                  <Button
                    type="button"
                    size="icon"
                    variant="secondary"
                    onClick={() => onRewriteBullet(index, bulletIndex, bullet)}
                    disabled={!bullet.trim() || pendingBulletKey === `${item.id}-${bulletIndex}`}
                  >
                    <Sparkles className="h-4 w-4" />
                  </Button>
                ) : null}
                <Button
                  type="button"
                  size="icon"
                  variant="ghost"
                  onClick={() =>
                    updateItem(index, (current) => ({
                      ...current,
                      bullets: current.bullets.filter((_, currentBulletIndex) => currentBulletIndex !== bulletIndex),
                    }))
                  }
                >
                  <Trash2 className="h-4 w-4" />
                </Button>
              </div>
            ))}
          </div>
        </div>
      </div>
    );

    if (!compact) {
      return (
        <Card key={item.id} className="rounded-[26px] border-slate-200/80 bg-white">
          <CardContent className="p-0">{entryBody}</CardContent>
        </Card>
      );
    }

    return (
      <details
        key={item.id}
        className="group overflow-hidden rounded-[24px] border border-slate-200/80 bg-white"
        open={!hasEntrySummary || items.length === 1}
      >
        <summary className="flex cursor-pointer list-none items-center justify-between gap-3 px-4 py-3.5 [&::-webkit-details-marker]:hidden">
          <div className="min-w-0">
            <p className="truncate text-sm font-semibold text-slate-900">{summary}</p>
            <p className="mt-1 text-[0.72rem] text-slate-500">
              {nonEmptyBullets} bullet{nonEmptyBullets === 1 ? "" : "s"} {item.location ? `- ${item.location}` : ""}
            </p>
          </div>
          <ChevronDown className="h-4 w-4 shrink-0 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
        </summary>
        <div className="border-t border-slate-100">{entryBody}</div>
      </details>
    );
  }

  const sectionHeader = (
    <div className="flex items-start justify-between gap-4">
      <div>
        <h3 className="text-[1.05rem] font-semibold text-slate-950">{title}</h3>
        <p className="mt-1 text-[0.82rem] leading-[1.75] text-slate-500">{description}</p>
      </div>
      <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, createEmptyEntry()])}>
        <Plus className="h-4 w-4" />
        Add item
      </Button>
    </div>
  );

  const sectionEntries = <div className="space-y-3.5">{items.map((item, index) => renderEntry(item, index))}</div>;

  const body = (
    <div className="space-y-3.5">
      {sectionHeader}
      {sectionEntries}
    </div>
  );

  if (!compact) {
    return body;
  }

  return (
    <details className="group overflow-hidden rounded-[28px] border border-slate-200/80 bg-white" open={defaultOpen || items.length === 0}>
      <summary className="flex cursor-pointer list-none items-start justify-between gap-4 px-4 py-4 [&::-webkit-details-marker]:hidden">
        <div>
          <h3 className="text-[1.02rem] font-semibold text-slate-950">{title}</h3>
          <p className="mt-1 text-[0.8rem] leading-[1.65] text-slate-500">{description}</p>
        </div>
        <div className="flex shrink-0 items-center gap-2">
          <span className="rounded-full border border-slate-200 bg-slate-50 px-2.5 py-1 text-[0.68rem] font-semibold text-slate-500">
            {items.length} item{items.length === 1 ? "" : "s"}
          </span>
          <ChevronDown className="h-4 w-4 text-slate-400 transition-transform duration-200 group-open:rotate-180" />
        </div>
      </summary>
      <div className="space-y-3.5 border-t border-slate-100 p-4">
        <div className="flex justify-end">
          <Button type="button" variant="secondary" size="sm" onClick={() => onChange([...items, createEmptyEntry()])}>
            <Plus className="h-4 w-4" />
            Add item
          </Button>
        </div>
        {sectionEntries}
      </div>
    </details>
  );
}
