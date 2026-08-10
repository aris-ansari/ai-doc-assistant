import Link from "next/link";

export default function HomePage() {
  return (
    <main className="min-h-screen bg-slate-950 text-white">
      <div className="mx-auto flex min-h-screen max-w-6xl flex-col px-6 py-8">
        <nav className="flex items-center justify-between">
          <span className="font-semibold tracking-tight">AI Document Workspace</span>
          <div className="flex items-center gap-3 text-sm">
            <Link href="/login" className="rounded-lg px-4 py-2 text-slate-300 hover:text-white">Sign in</Link>
            <Link href="/register" className="rounded-lg bg-white px-4 py-2 font-medium text-slate-950 hover:bg-slate-100">Create account</Link>
          </div>
        </nav>
        <section className="flex flex-1 items-center py-20">
          <div className="max-w-3xl">
            <p className="mb-5 text-sm font-medium uppercase tracking-[0.25em] text-slate-400">Enterprise RAG workspace</p>
            <h1 className="text-5xl font-semibold leading-tight tracking-tight sm:text-6xl">Turn your documents into a grounded AI workspace.</h1>
            <p className="mt-7 max-w-2xl text-lg leading-8 text-slate-300">Upload documents, retrieve the right context, and ask questions with source-backed answers from your own knowledge base.</p>
            <div className="mt-9 flex flex-wrap gap-3">
              <Link href="/register" className="rounded-xl bg-white px-5 py-3 font-medium text-slate-950 hover:bg-slate-100">Get started</Link>
              <Link href="/login" className="rounded-xl border border-slate-700 px-5 py-3 font-medium text-white hover:bg-slate-900">Sign in</Link>
            </div>
          </div>
        </section>
      </div>
    </main>
  );
}
