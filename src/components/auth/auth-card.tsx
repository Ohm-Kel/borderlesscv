import Link from "next/link";

import { Logo } from "@/components/shared/logo";
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";

export function AuthCard({
  title,
  description,
  footer,
  children,
}: {
  title: string;
  description: string;
  footer?: React.ReactNode;
  children: React.ReactNode;
}) {
  return (
    <Card className="overflow-hidden rounded-[34px] border-white/70 bg-white/90">
      <CardHeader className="space-y-6 border-b border-slate-100 bg-white/80 pb-8">
        <Logo />
        <div className="space-y-2">
          <CardTitle className="text-2xl">{title}</CardTitle>
          <CardDescription className="max-w-lg text-sm leading-7">{description}</CardDescription>
        </div>
      </CardHeader>
      <CardContent className="space-y-6 p-6 lg:p-8">
        {children}
        {footer ? <div className="text-sm text-slate-500">{footer}</div> : null}
      </CardContent>
    </Card>
  );
}

export function AuthFooterLink({
  text,
  href,
  label,
}: {
  text: string;
  href: string;
  label: string;
}) {
  return (
    <p className="text-sm text-slate-500">
      {text}{" "}
      <Link href={href} className="font-semibold text-slate-950 transition hover:text-[var(--accent)]">
        {label}
      </Link>
    </p>
  );
}
