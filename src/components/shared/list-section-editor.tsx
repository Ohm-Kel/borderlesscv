"use client";

import { GripVertical, Plus, Sparkles, Trash2 } from "lucide-react";

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
}: {
  title: string;
  description: string;
  items: ProfileListEntry[];
  onChange: (nextItems: ProfileListEntry[]) => void;
  onRewriteBullet?: (entryIndex: number, bulletIndex: number, bullet: string) => void;
  pendingBulletKey?: string | null;
}) {
  function updateItem(index: number, updater: (item: ProfileListEntry) => ProfileListEntry) {
    onChange(items.map((item, currentIndex) => (currentIndex === index ? updater(item) : item)));
  }

  return (
    <div className="space-y-3.5">
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
      <div className="space-y-3.5">
        {items.map((item, index) => (
          <Card key={item.id} className="rounded-[26px] border-slate-200/80 bg-white">
            <CardContent className="space-y-4 p-4">
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
            </CardContent>
          </Card>
        ))}
      </div>
    </div>
  );
}
