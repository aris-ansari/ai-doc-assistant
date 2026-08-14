"use client";

import { useState } from "react";
import Link from "next/link";
import { Menu, X } from "lucide-react";
import { ThemeToggle } from "@/components/ui/themeToggle";

export default function HomePage() {
  const [menuOpen, setMenuOpen] = useState(false);

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#000000] dark:text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="relative flex items-center justify-between">
          <span className="font-semibold tracking-tight">
            AI Document Workspace
          </span>
          <div className="hidden items-center gap-2 text-sm min-[500px]:flex">
            <ThemeToggle />
            <Link
              href="/login"
              className="rounded-lg px-4 py-2 text-slate-600 hover:text-slate-950 dark:text-slate-300 dark:hover:text-white"
            >
              Sign in
            </Link>
            <Link
              href="/register"
              className="rounded-lg bg-slate-950 px-4 py-2 font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
            >
              Create account
            </Link>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-slate-300 bg-white text-slate-700 dark:border-slate-700 dark:bg-[#0a0a0a] dark:text-slate-200 min-[500px]:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {menuOpen && (
            <div className="absolute right-0 top-12 z-30 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-[#141414] min-[500px]:hidden">
              <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                <span>Theme</span>
                <ThemeToggle />
              </div>
              <Link
                href="/login"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg px-3 py-2.5 text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1c1c1c]"
              >
                Sign in
              </Link>
              <Link
                href="/register"
                onClick={() => setMenuOpen(false)}
                className="block rounded-lg bg-slate-950 px-3 py-2.5 text-sm font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Create account
              </Link>
            </div>
          )}
        </nav>
        <section className="flex flex-1 items-center py-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-slate-500 dark:text-slate-400">
              Enterprise RAG workspace
            </p>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">
              Turn your documents into a grounded AI workspace.
            </h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-600 dark:text-slate-300">
              Upload documents, retrieve the right context, and ask questions
              with source-backed answers from your own knowledge base.
            </p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link
                href="/register"
                className="rounded-xl bg-slate-950 px-5 py-3 font-medium text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-100"
              >
                Get started
              </Link>
              <Link
                href="/login"
                className="rounded-xl border border-slate-300 px-5 py-3 font-medium text-slate-900 hover:bg-slate-100 dark:border-slate-700 dark:text-white dark:hover:bg-[#1c1c1c]"
              >
                Sign in
              </Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
