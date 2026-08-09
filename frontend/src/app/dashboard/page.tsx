"use client";

import { useRouter } from "next/navigation";
import { useEffect } from "react";
import { FileText, LogOut } from "lucide-react";
import { useAuth } from "@/providers/authProvider";
import { Spinner } from "@/components/ui/spinner";

export default function DashboardPage() {
  const router = useRouter();
  const { user, isLoading, isAuthenticated, signOut } = useAuth();

  useEffect(() => {
    if (!isLoading && !isAuthenticated) {
      router.replace("/login");
    }
  }, [isAuthenticated, isLoading, router]);

  if (isLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50">
        <Spinner />
      </main>
    );
  }

  if (!isAuthenticated) {
    return null;
  }

  async function handleLogout() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  return (
    <main className="min-h-screen bg-slate-50">
      <header className="border-b border-slate-200 bg-white">
        <div className="mx-auto flex max-w-7xl items-center justify-between px-6 py-4">
          <div className="flex items-center gap-3">
            <span className="rounded-xl bg-slate-950 p-2 text-white">
              <FileText size={18} />
            </span>
            <span className="font-semibold">AI Document Workspace</span>
          </div>
          <button
            onClick={handleLogout}
            className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100"
          >
            <LogOut size={16} /> Sign out
          </button>
        </div>
      </header>
      <section className="mx-auto max-w-7xl px-6 py-12">
        <p className="text-sm font-medium text-slate-500">Workspace</p>
        <h1 className="mt-2 text-3xl font-semibold tracking-tight">
          Welcome, {user?.name}
        </h1>
        <div className="mt-8 rounded-2xl border border-dashed border-slate-300 bg-white p-10 text-center">
          <h2 className="text-lg font-semibold">Document management is next</h2>
          <p className="mx-auto mt-2 max-w-lg text-sm leading-6 text-slate-500">
            Phase 7 establishes the application shell and authenticated session.
            Phase 8 will connect this workspace to document upload, processing
            status, and deletion.
          </p>
        </div>
      </section>
    </main>
  );
}
