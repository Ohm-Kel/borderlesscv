"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2, MoveRight, Sparkles } from "lucide-react";
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

    const response = await fetch("/api/auth/sign-up", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(form),
    });

    const payload = await response.json();

    if (!response.ok) {
      setPending(false);
      toast.error("Could not create account", {
        description: typeof payload.error === "string" ? payload.error : "Please review your details and try again.",
      });
      return;
    }

    const result = await signIn("credentials", {
      email: form.email,
      password: form.password,
      redirect: false,
      callbackUrl: "/onboarding",
    });

    setPending(false);

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
  }

  return (
    <motion.div className="space-y-5" initial="hidden" animate="visible" variants={staggerContainer(0.04, 0.08)}>
      {googleEnabled ? (
        <motion.div variants={fadeUp(14)}>
          <MotionButtonWrap>
            <Button
              type="button"
              variant="secondary"
              className="h-12 w-full justify-center rounded-[22px] bg-white shadow-[0_18px_30px_rgba(15,23,42,0.08)]"
              onClick={() => signIn("google", { callbackUrl: "/onboarding" })}
            >
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

      <motion.form className="space-y-4" onSubmit={handleSubmit} variants={fadeUp(16)}>
        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="space-y-2">
              <Label htmlFor="name" className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
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

          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
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

          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="space-y-2">
              <div className="flex items-center justify-between gap-4">
                <Label htmlFor="password" className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                  Password
                </Label>
                <span className="text-xs font-medium text-slate-400">Minimum 8 characters</span>
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

        <div className="rounded-[24px] border border-emerald-100 bg-emerald-50/70 px-4 py-3 text-sm leading-7 text-emerald-900">
          <div className="flex items-start gap-2">
            <Sparkles className="mt-1 h-4 w-4 shrink-0" />
            <span>
              You will start with a reusable master profile, then tailor resume versions, cover letters, and applications from the same factual source.
            </span>
          </div>
        </div>

        <MotionButtonWrap>
          <Button type="submit" className="h-12 w-full rounded-[22px] bg-slate-950 shadow-[0_20px_34px_rgba(15,23,42,0.16)]" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
            Create account
          </Button>
        </MotionButtonWrap>
      </motion.form>
    </motion.div>
  );
}
