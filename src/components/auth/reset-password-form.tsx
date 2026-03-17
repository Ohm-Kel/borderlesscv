"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorDescription } from "@/lib/request-errors";
import { Lock, MoveRight } from "lucide-react";

export function ResetPasswordForm({ token }: { token: string }) {
  const router = useRouter();
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch("/api/auth/reset-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ token, password, confirmPassword }),
      });

      const payload = await response.json().catch(() => null);
      setPending(false);

      if (!response.ok) {
        toast.error("Could not reset password", {
          description: getErrorDescription(payload, "Please try again."),
        });
        return;
      }

      toast.success("Password updated");
      router.push("/sign-in");
    } catch {
      setPending(false);
      toast.error("Could not reset password", {
        description: "The request failed before the server returned a usable response. Please try again.",
      });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div className="field-card">
          <div className="space-y-2">
            <Label htmlFor="password" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Lock className="h-3 w-3 stroke-[2.5] text-slate-400" />
              New password
            </Label>
            <Input id="password" type="password" autoComplete="new-password" value={password} onChange={(event) => setPassword(event.target.value)} placeholder="Create a strong password" required />
          </div>
        </div>
        <div className="field-card">
          <div className="space-y-2">
            <Label htmlFor="confirm-password" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Lock className="h-3 w-3 stroke-[2.5] text-slate-400" />
              Confirm password
            </Label>
            <Input id="confirm-password" type="password" autoComplete="new-password" value={confirmPassword} onChange={(event) => setConfirmPassword(event.target.value)} placeholder="Repeat password" required />
          </div>
        </div>
      </div>
      <Button type="submit" className="h-12 w-full rounded-[12px] bg-[var(--accent)] text-white text-[0.9rem] font-bold shadow-sm hover:bg-[var(--accent-dark)]" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
        Update password
      </Button>
    </form>
  );
}
