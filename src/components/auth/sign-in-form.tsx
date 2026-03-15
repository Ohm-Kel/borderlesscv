"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { motion } from "framer-motion";
import { signIn } from "next-auth/react";
import { Loader2, MoveRight } from "lucide-react";
import { toast } from "sonner";

import { AuthDivider } from "@/components/auth/auth-divider";
import { MotionButtonWrap } from "@/components/motion/motion-primitives";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { fadeUp, staggerContainer } from "@/lib/motion";

export function SignInForm({
  callbackUrl,
  googleEnabled,
}: {
  callbackUrl?: string;
  googleEnabled: boolean;
}) {
  const router = useRouter();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [pending, setPending] = useState(false);

  async function handleCredentialsSignIn(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setPending(true);

    const result = await signIn("credentials", {
      email,
      password,
      redirect: false,
      callbackUrl: callbackUrl || "/dashboard",
    });

    setPending(false);

    if (result?.error) {
      toast.error("Sign in failed", {
        description: "Check your email and password and try again.",
      });
      return;
    }

    startTransition(() => {
      router.push(result?.url || callbackUrl || "/dashboard");
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
              onClick={() => signIn("google", { callbackUrl: callbackUrl || "/dashboard" })}
            >
              Continue with Google
            </Button>
          </MotionButtonWrap>
        </motion.div>
      ) : null}

      {googleEnabled ? (
        <motion.div variants={fadeUp(12)}>
          <AuthDivider label="Or continue with email" />
        </motion.div>
      ) : null}

      <motion.form className="space-y-4" onSubmit={handleCredentialsSignIn} variants={fadeUp(16)}>
        <div className="space-y-4">
          <div className="rounded-[28px] border border-slate-200/80 bg-slate-50/80 p-4 shadow-[inset_0_1px_0_rgba(255,255,255,0.7)]">
            <div className="space-y-2">
              <Label htmlFor="email" className="text-[0.8rem] font-semibold uppercase tracking-[0.16em] text-slate-500">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                autoComplete="email"
                value={email}
                onChange={(event) => setEmail(event.target.value)}
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
                <Link href="/forgot-password" className="text-sm font-medium text-slate-500 transition hover:text-slate-950">
                  Forgot password?
                </Link>
              </div>
              <Input
                id="password"
                type="password"
                autoComplete="current-password"
                value={password}
                onChange={(event) => setPassword(event.target.value)}
                placeholder="Enter your password"
                required
              />
            </div>
          </div>
        </div>

        <MotionButtonWrap>
          <Button type="submit" className="h-12 w-full rounded-[22px] bg-slate-950 shadow-[0_20px_34px_rgba(15,23,42,0.16)]" disabled={pending}>
            {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : <MoveRight className="h-4 w-4" />}
            Sign in
          </Button>
        </MotionButtonWrap>
      </motion.form>

      <motion.p className="text-sm leading-7 text-slate-500" variants={fadeUp(12)}>
        Continue where you left off: tailor a resume, export a polished PDF, or review your application pipeline without rebuilding your profile.
      </motion.p>
    </motion.div>
  );
}
