"use client";

import { useState } from "react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { getErrorDescription } from "@/lib/request-errors";
import { Mail, MoveRight } from "lucide-react";

export function ForgotPasswordForm() {
  const [email, setEmail] = useState("");
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch("/api/auth/forgot-password", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email }),
      });

      const payload = await response.json().catch(() => null);
      setPending(false);

      if (!response.ok) {
        toast.error("Could not send reset link", {
          description: getErrorDescription(payload, "Please try again."),
        });
        return;
      }

      if (payload?.developmentResetUrl) {
        toast.success("Reset link generated", {
          description: payload.developmentResetUrl,
        });
        return;
      }

      toast.success("If an account exists for that email, a reset link has been sent.");
    } catch {
      setPending(false);
      toast.error("Could not send reset link", {
        description: "The request failed before the server returned a usable response. Please try again.",
      });
    }
  }

  return (
    <form className="space-y-4" onSubmit={handleSubmit}>
      <div className="space-y-3">
        <div className="field-card">
          <div className="space-y-2">
            <Label htmlFor="email" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
              <Mail className="h-3 w-3 stroke-[2.5] text-slate-400" />
              Email
            </Label>
            <Input id="email" type="email" autoComplete="email" value={email} onChange={(event) => setEmail(event.target.value)} placeholder="you@example.com" required />
          </div>
        </div>
      </div>
      <Button type="submit" className="h-12 w-full rounded-[12px] bg-[var(--accent)] text-white text-[0.9rem] font-bold shadow-sm hover:bg-[var(--accent-dark)]" disabled={pending}>
        {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
        Send reset link
      </Button>
    </form>
  );
}
