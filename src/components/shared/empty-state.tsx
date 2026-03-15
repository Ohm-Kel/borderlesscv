import type { LucideIcon } from "lucide-react";

import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";

export function EmptyState({
  icon: Icon,
  title,
  description,
  actionLabel,
  onAction,
}: {
  icon: LucideIcon;
  title: string;
  description: string;
  actionLabel?: string;
  onAction?: () => void;
}) {
  return (
    <Card className="rounded-[32px] border-dashed border-slate-200/80 bg-white/90">
      <CardContent className="flex flex-col items-center justify-center gap-4 px-8 py-16 text-center">
        <div className="flex h-16 w-16 items-center justify-center rounded-3xl bg-slate-100 text-slate-700">
          <Icon className="h-7 w-7" />
        </div>
        <div className="space-y-2">
          <h3 className="text-xl font-semibold text-slate-950">{title}</h3>
          <p className="max-w-md text-sm leading-7 text-slate-500">{description}</p>
        </div>
        {actionLabel && onAction ? (
          <Button variant="secondary" onClick={onAction}>
            {actionLabel}
          </Button>
        ) : null}
      </CardContent>
    </Card>
  );
}
