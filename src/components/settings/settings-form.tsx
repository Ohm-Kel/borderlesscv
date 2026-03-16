"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";

export function SettingsForm({
  initialEnabled,
  initialSlug,
}: {
  initialEnabled: boolean;
  initialSlug: string;
}) {
  const [publicProfileEnabled, setPublicProfileEnabled] = useState(initialEnabled);
  const [publicProfileSlug, setPublicProfileSlug] = useState(initialSlug);
  const [pending, setPending] = useState(false);

  async function save() {
    setPending(true);
    const response = await fetch("/api/settings/public-profile", {
      method: "PATCH",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        publicProfileEnabled,
        publicProfileSlug,
      }),
    });
    const payload = await response.json();
    setPending(false);

    if (!response.ok) {
      toast.error("Could not save settings");
      return;
    }

    setPublicProfileSlug(payload.publicProfileSlug);
    toast.success("Settings saved");
  }

  return (
    <Card className="max-w-3xl rounded-[28px] bg-white">
      <CardContent className="space-y-5 p-5">
        <div>
          <p className="section-label">Settings</p>
          <h2 className="mt-1 text-[1.2rem] font-semibold text-slate-950">Workspace privacy</h2>
        </div>

        <div className="flex items-center justify-between gap-4 rounded-[22px] bg-slate-100 p-4">
          <div>
            <h3 className="text-base font-semibold text-slate-950">Public profile</h3>
            <p className="text-sm text-slate-500">
              Disabled by default. Turn it on only if you want a public BorderlessCV page.
            </p>
          </div>
          <Switch checked={publicProfileEnabled} onCheckedChange={setPublicProfileEnabled} />
        </div>

        <div className="space-y-2">
          <Label>Public profile slug</Label>
          <Input value={publicProfileSlug} onChange={(event) => setPublicProfileSlug(event.target.value)} />
          {publicProfileSlug ? (
            <p className="text-sm text-slate-500">
              Preview path: <span className="font-medium text-slate-800">/p/{publicProfileSlug}</span>
            </p>
          ) : null}
        </div>

        <Button onClick={save} disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Save settings
        </Button>
      </CardContent>
    </Card>
  );
}
