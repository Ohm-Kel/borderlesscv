import type { ReactNode } from "react";

import { cn } from "@/lib/utils";

export function PageHeader({
  eyebrow,
  title,
  description,
  actions,
  className,
}: {
  eyebrow?: string;
  title: string;
  description?: string;
  actions?: ReactNode;
  className?: string;
}) {
  return (
    <div className={cn("flex flex-col gap-6 lg:flex-row lg:items-end lg:justify-between", className)}>
      <div className="max-w-2xl space-y-3">
        {eyebrow ? <p className="section-label">{eyebrow}</p> : null}
        <div className="space-y-2">
          <h1 className="balance-text text-3xl font-semibold tracking-tight text-slate-950 lg:text-4xl">{title}</h1>
          {description ? <p className="max-w-2xl text-sm leading-7 text-slate-500 lg:text-base">{description}</p> : null}
        </div>
      </div>
      {actions ? <div className="flex shrink-0 items-center gap-3">{actions}</div> : null}
    </div>
  );
}
