"use client";

import Link from "next/link";
import { useRouter } from "next/navigation";
import { FormEvent, useState } from "react";
import { z } from "zod";
import { useAuth } from "@/providers/authProvider";
import { Spinner } from "@/components/ui/spinner";

const schema = z.object({
  email: z.string().trim().email("Enter a valid email address."),
  password: z.string().min(1, "Password is required."),
});

export function LoginForm() {
  const router = useRouter();
  const { signIn } = useAuth();
  const [form, setForm] = useState({ email: "", password: "" });
  const [error, setError] = useState("");
  const [isSubmitting, setIsSubmitting] = useState(false);

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setError("");
    const parsed = schema.safeParse(form);
    if (!parsed.success) {
      setError(parsed.error.issues[0]?.message ?? "Please check your details.");
      return;
    }

    setIsSubmitting(true);
    try {
      await signIn(parsed.data);
      router.replace("/dashboard");
      router.refresh();
    } catch (requestError) {
      const message = (requestError as { response?: { data?: { message?: string } } }).response?.data?.message;
      setError(message ?? "Unable to sign in. Please try again.");
    } finally {
      setIsSubmitting(false);
    }
  }

  return (
    <div className="mx-auto max-w-md">
      <p className="text-sm font-medium text-slate-500">Welcome back</p>
      <h2 className="mt-2 text-3xl font-semibold tracking-tight text-slate-950">Sign in to your workspace</h2>
      <p className="mt-3 text-sm leading-6 text-slate-500">Use your account credentials to continue.</p>

      <form onSubmit={handleSubmit} className="mt-8 space-y-5">
        <label className="block text-sm font-medium text-slate-700">Email
          <input value={form.email} onChange={(e) => setForm({ ...form, email: e.target.value })} type="email" autoComplete="email" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100" placeholder="you@example.com" />
        </label>
        <label className="block text-sm font-medium text-slate-700">Password
          <input value={form.password} onChange={(e) => setForm({ ...form, password: e.target.value })} type="password" autoComplete="current-password" className="mt-2 w-full rounded-xl border border-slate-200 px-4 py-3 outline-none transition focus:border-slate-500 focus:ring-4 focus:ring-slate-100" placeholder="••••••••" />
        </label>
        {error && <p role="alert" className="rounded-xl bg-red-50 px-4 py-3 text-sm text-red-700">{error}</p>}
        <button disabled={isSubmitting} className="flex w-full items-center justify-center gap-2 rounded-xl bg-slate-950 px-4 py-3 font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60">
          {isSubmitting && <Spinner />} Sign in
        </button>
      </form>

      <p className="mt-7 text-center text-sm text-slate-500">New here? <Link className="font-semibold text-slate-900 hover:underline" href="/register">Create an account</Link></p>
    </div>
  );
}
