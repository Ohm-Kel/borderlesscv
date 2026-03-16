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
    <div className="flex h-full min-h-0 flex-col gap-4">
      <Card className="rounded-[28px] bg-white">
        <CardContent className="flex flex-col gap-4 p-4 lg:flex-row lg:items-center lg:justify-between">
          <div className="min-w-0">
            <p className="section-label">Account settings</p>
            <h2 className="mt-1 text-[1.2rem] font-semibold text-slate-950">Public profile</h2>
            <p className="mt-1 text-sm text-slate-500">
              Private by default. Publish only what you are comfortable sharing outside BorderlessCV.
            </p>
          </div>
          <Button onClick={save} disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
            Save settings
          </Button>
        </CardContent>
      </Card>

      <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-3">
        <MetricCard
          label="Visibility"
          value={publicProfileEnabled ? "Public" : "Private"}
          note={publicProfileEnabled ? "Your opt-in profile can be shared publicly." : "Only you can access your workspace data."}
        />
        <MetricCard
          label="Profile path"
          value={publicProfileSlug ? `/p/${publicProfileSlug}` : "Not set"}
          note={publicProfileSlug ? "Use a clean slug before sharing." : "Choose a public slug if you enable sharing."}
        />
        <MetricCard
          label="Privacy rule"
          value="Opt-in only"
          note="Nothing becomes public unless you switch it on and save."
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <Card className="rounded-[28px] bg-white">
          <CardContent className="space-y-5 p-5">
            <div className="flex items-center justify-between gap-4 rounded-[22px] border border-slate-200 bg-slate-50 p-4">
              <div>
                <h3 className="text-base font-semibold text-slate-950">Public profile access</h3>
                <p className="text-sm text-slate-500">
                  Turn this on only if you want a public BorderlessCV page.
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
          </CardContent>
        </Card>

        <div className="space-y-4">
          <Card className="rounded-[28px] bg-white">
            <CardContent className="space-y-3 p-5">
              <p className="section-label">Preview</p>
              <h3 className="text-base font-semibold text-slate-950">What this controls</h3>
              <div className="space-y-2">
                <SignalRow label="Default state" value="Private" />
                <SignalRow label="Public URL" value={publicProfileSlug ? `/p/${publicProfileSlug}` : "Not ready"} />
                <SignalRow label="Shareability" value={publicProfileEnabled ? "Enabled" : "Off"} />
              </div>
            </CardContent>
          </Card>

          <Card className="rounded-[28px] bg-white">
            <CardContent className="space-y-3 p-5">
              <p className="section-label">Guidance</p>
              <h3 className="text-base font-semibold text-slate-950">Keep this selective</h3>
              <p className="text-sm leading-7 text-slate-600">
                Only publish information you want recruiters or hiring managers to see directly. Leave this off if you
                are still editing or applying privately.
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}

function MetricCard({
  label,
  value,
  note,
}: {
  label: string;
  value: string;
  note: string;
}) {
  return (
    <Card className="rounded-[24px] bg-white">
      <CardContent className="space-y-2 p-4">
        <p className="section-label">{label}</p>
        <div className="text-[1rem] font-semibold text-slate-950">{value}</div>
        <p className="text-[0.8rem] leading-6 text-slate-500">{note}</p>
      </CardContent>
    </Card>
  );
}

function SignalRow({
  label,
  value,
}: {
  label: string;
  value: string;
}) {
  return (
    <div className="flex items-center justify-between gap-3 rounded-[18px] border border-slate-200 bg-slate-50 px-3.5 py-3">
      <span className="text-sm font-medium text-slate-700">{label}</span>
      <span className="text-sm font-semibold text-slate-950">{value}</span>
    </div>
  );
}
