"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2, Lock, Mail, MoveRight, Sparkles, User } from "lucide-react";
import { toast } from "sonner";

import { AuthDivider } from "@/components/auth/auth-divider";
import { MotionButtonWrap } from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function SignUpForm({ googleEnabled }: { googleEnabled: boolean }) {
  const router = useRouter();
  const [form, setForm] = useState({
    name: "",
    email: "",
    password: "",
  });
  const [pending, setPending] = useState(false);

  async function handleSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    try {
      const response = await fetch("/api/auth/sign-up", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(form),
      });

      const payload = await response.json().catch(() => null);

      if (!response.ok) {
        const description =
          payload && typeof payload === "object" && "error" in payload && typeof payload.error === "string"
            ? payload.error
            : "Please review your details and try again.";

        toast.error("Could not create account", {
          description,
        });
        return;
      }

      const result = await signIn("credentials", {
        email: form.email,
        password: form.password,
        redirect: false,
        callbackUrl: "/onboarding",
      });

      if (result?.error) {
        toast.error("Account created, but sign-in failed", {
          description: "Use your email and password on the sign-in screen.",
        });
        router.push("/sign-in");
        return;
      }

      startTransition(() => {
        router.push("/onboarding");
        router.refresh();
      });
    } catch {
      toast.error("Could not create account", {
        description: "The request failed before the server returned a usable response. Please try again.",
      });
    } finally {
      setPending(false);
    }
  }

  return (
    <motion.div className="space-y-5" initial="hidden" animate="visible" variants={staggerContainer(0.04, 0.08)}>
      {googleEnabled ? (
        <motion.div variants={fadeUp(14)}>
          <MotionButtonWrap>
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-full justify-center rounded-[22px] border-slate-200 bg-white shadow-[0_10px_24px_rgba(15,23,42,0.07)] hover:shadow-[0_14px_32px_rgba(15,23,42,0.10)]"
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            >
              <svg className="h-4 w-4" viewBox="0 0 24 24" aria-hidden="true">
                <path d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z" fill="#4285F4" />
                <path d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z" fill="#34A853" />
                <path d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z" fill="#FBBC05" />
                <path d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z" fill="#EA4335" />
              </svg>
              Continue with Google
            </Button>
          </MotionButtonWrap>
        </motion.div>
      ) : null}

      {googleEnabled ? (
        <motion.div variants={fadeUp(12)}>
          <AuthDivider label="Or create an account with email" />
        </motion.div>
      ) : null}

      <motion.form className="space-y-3.5" onSubmit={handleSubmit} variants={fadeUp(16)}>
        <div className="space-y-3">
          {/* Full name field */}
          <div className="field-card">
            <div className="space-y-2">
              <Label htmlFor="name" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <User className="h-3 w-3 stroke-[2.5] text-slate-400" />
                Full name
              </Label>
              <Input
                id="name"
                value={form.name}
                onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))}
                placeholder="Ama Mensah"
                required
              />
            </div>
          </div>

          {/* Email field */}
          <div className="field-card">
            <div className="space-y-2">
              <Label htmlFor="email" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                <Mail className="h-3 w-3 stroke-[2.5] text-slate-400" />
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={form.email}
                onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))}
                placeholder="you@example.com"
                required
              />
            </div>
          </div>

          {/* Password field */}
          <div className="field-card">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password" className="flex items-center gap-1.5 text-[0.72rem] font-semibold uppercase tracking-[0.18em] text-slate-500">
                  <Lock className="h-3 w-3 stroke-[2.5] text-slate-400" />
                  Password
                </Label>
                <span className="text-[0.72rem] font-medium text-slate-400">Min. 8 characters</span>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="new-password"
                value={form.password}
                onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))}
                placeholder="Create a strong password"
                required
              />
            </div>
          </div>
        </div>

        {/* Value prop hint */}
        <div className="flex items-start gap-3 rounded-[18px] border border-emerald-200/70 bg-emerald-50/80 px-4 py-3.5">
          <Sparkles className="mt-0.5 h-4 w-4 shrink-0 text-emerald-600" />
          <p className="text-[0.8rem] leading-[1.75] text-emerald-900">
            You will start with a reusable master profile, then tailor resume versions, cover letters, and applications from the same factual source.
          </p>
        </div>

        <MotionButtonWrap>
          <Button
            type="submit"
            className="h-12 w-full rounded-[22px] bg-slate-950 text-[0.9rem] font-semibold shadow-[0_18px_36px_rgba(15,23,42,0.18)] hover:shadow-[0_24px_48px_rgba(15,23,42,0.26)]"
            disabled={pending}
          >
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
            Create account
          </Button>
        </MotionButtonWrap>
      </motion.form>
    </motion.div>
  );
}
