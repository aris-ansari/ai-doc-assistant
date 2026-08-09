import Link from "next/link";
import { FileText } from "lucide-react";
import { ReactNode } from "react";

export function AuthShell({ children }: { children: ReactNode }) {
  return (
    <main className="min-h-screen bg-slate-950 px-4 py-10 text-slate-900">
      <div className="mx-auto flex min-h-[calc(100vh-5rem)] max-w-6xl items-center justify-center">
        <div className="grid w-full overflow-hidden rounded-3xl bg-white shadow-soft lg:grid-cols-[1.05fr_0.95fr]">
          <section className="hidden bg-slate-900 p-12 text-white lg:flex lg:flex-col lg:justify-between">
            <Link
              href="/"
              className="flex items-center gap-3 text-lg font-semibold"
            >
              <span className="rounded-xl bg-white/10 p-2">
                <FileText size={20} />
              </span>
              AI Document Workspace
            </Link>
            <div>
              <p className="mb-4 text-sm font-medium uppercase tracking-[0.2em] text-slate-400">
                Grounded intelligence
              </p>
              <h1 className="max-w-md text-4xl font-semibold leading-tight">
                Ask questions across your documents with confidence.
              </h1>
              <p className="mt-6 max-w-md text-base leading-7 text-slate-300">
                Upload your knowledge base, let the workspace index it, and chat
                with answers grounded in your own files.
              </p>
            </div>
            <p className="text-sm text-slate-500">
              Secure sessions · Document-aware retrieval · Source citations
            </p>
          </section>
          <section className="p-7 sm:p-10 lg:p-12">{children}</section>
        </div>
      </div>
    </main>
  );
}
