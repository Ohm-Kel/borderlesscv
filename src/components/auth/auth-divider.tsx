export function AuthDivider({ label }: { label: string }) {
  return (
    <div className="flex items-center gap-3">
      <div className="h-px flex-1 bg-slate-200" />
      <span className="text-[0.7rem] font-semibold uppercase tracking-[0.22em] text-slate-400">{label}</span>
      <div className="h-px flex-1 bg-slate-200" />
    </div>
  );
}
