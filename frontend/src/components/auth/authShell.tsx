import Link from "next/link";
import { FileText } from "lucide-react";
import { ThemeToggle } from "@/components/ui/themeToggle";
import { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-50 px-4 py-10 text-slate-900 dark:bg-[#0a0a0a] dark:text-slate-100">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="fixed right-4 top-4 z-20">
          <ThemeToggle />
        </div>
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-soft dark:bg-[#0a0a0a] lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-slate-50 p-12 text-slate-950 lg:flex lg:flex-col lg:justify-between dark:bg-[#0a0a0a] dark:text-white">
            <Link
              href="/"
              className="flex items-center gap-3 text-lg font-semibold"
            >
              <span className="rounded-xl bg-slate-200 p-2 text-slate-950 dark:bg-white/10 dark:text-white">
                <FileText size={20} />
              </span>
              AI Document Workspace
            </Link>
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-500 dark:text-slate-400">
                Grounded intelligence
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Ask questions across your documents with confidence.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-600 dark:text-slate-300">
                Upload your knowledge base, let the workspace index it, and chat
                with answers grounded in your own files.
              </p>
            </div>
            <p className="text-sm text-slate-500 dark:text-slate-400">
              Secure sessions · Document-aware retrieval · Source citations
            </p>
          </section>
          <section className="p-7 sm:p-10 lg:p-12 dark:text-slate-100">
            {children}
          </section>
        </div>
      </div>
    </main>
  );
}
