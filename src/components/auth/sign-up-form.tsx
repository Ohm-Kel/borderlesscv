"use client";

import { useRouter } from "next/navigation";
import { startTransition, useState } from "react";
import { signIn } from "next-auth/react";
import { Loader2 } from "lucide-react";
import { toast } from "sonner";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";

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
    <div className="space-y-5">
      {googleEnabled ? (
        <Button type="button" variant="secondary" className="w-full" onClick={() => signIn("google", { callbackUrl: "/onboarding" })}>
          Continue with Google
        </Button>
      ) : null}
      {googleEnabled ? <div className="text-center text-xs uppercase tracking-[0.18em] text-slate-400">or create an account with email</div> : null}
      <form className="space-y-4" onSubmit={handleSubmit}>
        <div className="space-y-2">
          <Label htmlFor="name">Full name</Label>
          <Input id="name" value={form.name} onChange={(event) => setForm((current) => ({ ...current, name: event.target.value }))} placeholder="Ama Mensah" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="email">Email</Label>
          <Input id="email" type="email" autoComplete="email" value={form.email} onChange={(event) => setForm((current) => ({ ...current, email: event.target.value }))} placeholder="you@example.com" required />
        </div>
        <div className="space-y-2">
          <Label htmlFor="password">Password</Label>
          <Input id="password" type="password" autoComplete="new-password" value={form.password} onChange={(event) => setForm((current) => ({ ...current, password: event.target.value }))} placeholder="At least 8 characters" required />
        </div>
        <Button type="submit" className="w-full" disabled={pending}>
          {pending ? <Loader2 className="h-4 w-4 animate-spin" /> : null}
          Create account
        </Button>
      </form>
    </div>
  );
}
