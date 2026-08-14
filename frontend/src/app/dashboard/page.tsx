"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  AlertCircle,
  FileCheck2,
  FileClock,
  FileText,
  LogOut,
  Menu,
  MessageSquare,
  RefreshCw,
  X,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { deleteDocument, getDocuments, uploadDocument } from "@/lib/documents";
import { getApiErrorMessage } from "@/lib/apiError";
import type { DocumentRecord } from "@/lib/types";
import { useAuth } from "@/providers/authProvider";
import { Spinner } from "@/components/ui/spinner";
import { UploadDropzone } from "@/components/documents/uploadDropzone";
import { DocumentTable } from "@/components/documents/documentTable";
import { DeleteDocumentDialog } from "@/components/documents/deleteDocumentDialog";
import { ThemeToggle } from "@/components/ui/themeToggle";

export default function DashboardPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { user, isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const [documentToDelete, setDocumentToDelete] =
    useState<DocumentRecord | null>(null);
  const [deleteError, setDeleteError] = useState<string | null>(null);
  const [menuOpen, setMenuOpen] = useState(false);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
    enabled: isAuthenticated,
    refetchInterval: (query) => {
      const documents = query.state.data;
      const hasActiveProcessing = documents?.some(
        (document) =>
          document.status === "pending" || document.status === "processing",
      );
      return hasActiveProcessing ? 2000 : false;
    },
  });

  const uploadMutation = useMutation({
    mutationFn: ({ file, title }: { file: File; title?: string }) =>
      uploadDocument(file, title),
    onSuccess: () => queryClient.invalidateQueries({ queryKey: ["documents"] }),
  });

  const deleteMutation = useMutation({
    mutationFn: deleteDocument,
    onSuccess: async () => {
      setDeleteError(null);
      setDocumentToDelete(null);
      await queryClient.invalidateQueries({ queryKey: ["documents"] });
    },
  });

  const stats = useMemo(() => {
    const documents = documentsQuery.data ?? [];
    return {
      total: documents.length,
      processing: documents.filter(
        (document) =>
          document.status === "pending" || document.status === "processing",
      ).length,
      ready: documents.filter((document) => document.status === "completed")
        .length,
      failed: documents.filter((document) => document.status === "failed")
        .length,
    };
  }, [documentsQuery.data]);

  if (authLoading) {
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <Spinner />
      </main>
    );
  }

  if (!isAuthenticated) return null;

  async function handleLogout() {
    await signOut();
    router.replace("/login");
    router.refresh();
  }

  async function handleUpload(file: File, title?: string) {
    await uploadMutation.mutateAsync({ file, title });
  }

  return (
    <main className="min-h-screen bg-slate-50 text-slate-950 dark:bg-[#000000] dark:text-slate-100">
      <header className="border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#0a0a0a]/95">
        <div className="relative mx-auto flex max-w-7xl items-center justify-between px-4 py-4 sm:px-6">
          <div className="flex min-w-0 items-center gap-3">
            <span className="shrink-0 rounded-xl bg-slate-950 p-2 text-white dark:bg-white dark:text-slate-950">
              <FileText size={18} />
            </span>
            <span className="truncate font-semibold text-slate-950 dark:text-white">
              AI Document Workspace
            </span>
          </div>
          <div className="hidden items-center gap-2 min-[500px]:flex">
            <ThemeToggle />
            <button
              onClick={handleLogout}
              className="flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1c1c1c]"
            >
              <LogOut size={16} /> Sign out
            </button>
          </div>
          <button
            type="button"
            onClick={() => setMenuOpen((open) => !open)}
            aria-label={menuOpen ? "Close menu" : "Open menu"}
            aria-expanded={menuOpen}
            className="inline-flex h-9 w-9 shrink-0 items-center justify-center rounded-lg border border-slate-200 bg-white text-slate-700 dark:border-slate-700 dark:bg-[#0a0a0a] dark:text-slate-200 min-[500px]:hidden"
          >
            {menuOpen ? <X size={18} /> : <Menu size={18} />}
          </button>
          {menuOpen && (
            <div className="absolute right-4 top-14 z-30 w-48 rounded-xl border border-slate-200 bg-white p-2 shadow-lg dark:border-slate-800 dark:bg-[#141414] min-[500px]:hidden">
              <div className="flex items-center justify-between rounded-lg px-3 py-2 text-sm text-slate-600 dark:text-slate-300">
                <span>Theme</span>
                <ThemeToggle />
              </div>
              <button
                type="button"
                onClick={() => {
                  setMenuOpen(false);
                  void handleLogout();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1c1c1c]"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto min-w-0 max-w-7xl px-4 py-8 sm:px-6 sm:py-10 lg:py-12">
        <div className="flex flex-col gap-2 sm:flex-row sm:items-end sm:justify-between">
          <div>
            <p className="text-sm font-medium text-slate-400">Workspace</p>
            <h1 className="mt-1 text-3xl font-semibold tracking-tight text-slate-950 dark:text-white">
              Welcome, {user?.name}
            </h1>
            <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
              Upload documents and let the workspace prepare them for grounded
              AI conversations.
            </p>
          </div>
          <div className="flex items-center gap-2">
            <button
              type="button"
              onClick={() => router.push("/chat")}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0a0a0a] dark:text-slate-200 dark:hover:bg-[#1c1c1c]"
            >
              <MessageSquare size={15} />
              Open RAG chat
            </button>
            <button
              type="button"
              onClick={() => void documentsQuery.refetch()}
              disabled={documentsQuery.isFetching}
              className="inline-flex w-fit items-center gap-2 rounded-lg border border-slate-200 bg-white px-3.5 py-2.5 text-sm font-medium text-slate-700 shadow-sm hover:bg-slate-50 dark:border-slate-700 dark:bg-[#0a0a0a] dark:text-slate-200 dark:hover:bg-[#1c1c1c] disabled:opacity-60"
            >
              <RefreshCw
                size={15}
                className={
                  documentsQuery.isFetching ? "animate-spin" : undefined
                }
              />
              Refresh
            </button>
          </div>
        </div>

        <div className="mt-8 grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
          <StatCard
            label="Total documents"
            value={stats.total}
            icon={<FileText size={18} />}
          />
          <StatCard
            label="Processing"
            value={stats.processing}
            icon={<FileClock size={18} />}
          />
          <StatCard
            label="Ready for chat"
            value={stats.ready}
            icon={<FileCheck2 size={18} />}
          />
          <StatCard
            label="Failed"
            value={stats.failed}
            icon={<AlertCircle size={18} />}
          />
        </div>

        <div className="mt-8 grid min-w-0 gap-8 lg:grid-cols-[minmax(0,0.8fr)_minmax(0,1.2fr)] lg:items-start">
          <div className="min-w-0">
            <UploadDropzone
              isUploading={uploadMutation.isPending}
              onUpload={handleUpload}
            />
          </div>
          <section className="min-w-0">
            <div className="mb-4 flex items-center justify-between gap-4">
              <div>
                <h2 className="text-base font-semibold text-slate-950 dark:text-white">
                  Your documents
                </h2>
                <p className="mt-1 text-sm text-slate-500 dark:text-slate-400">
                  Processing status updates automatically.
                </p>
              </div>
              {documentsQuery.isFetching && (
                <span className="text-xs text-slate-400 dark:text-slate-500">
                  Updating…
                </span>
              )}
            </div>
            {deleteError && (
              <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                <p>{deleteError}</p>
                <button
                  type="button"
                  onClick={() => setDeleteError(null)}
                  className="font-medium underline underline-offset-2"
                >
                  Dismiss
                </button>
              </div>
            )}

            {documentsQuery.isError ? (
              <div className="rounded-2xl border border-red-200 bg-red-50 p-6 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
                <p className="font-medium">Unable to load documents.</p>
                <button
                  type="button"
                  onClick={() => void documentsQuery.refetch()}
                  className="mt-3 font-semibold underline underline-offset-2"
                >
                  Try again
                </button>
              </div>
            ) : documentsQuery.isLoading ? (
              <div className="flex min-h-48 items-center justify-center rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0a0a0a]">
                <Spinner />
              </div>
            ) : (
              <DocumentTable
                documents={documentsQuery.data ?? []}
                onDelete={setDocumentToDelete}
              />
            )}
          </section>
        </div>
      </section>

      <DeleteDocumentDialog
        document={documentToDelete}
        isDeleting={deleteMutation.isPending}
        onCancel={() => {
          if (!deleteMutation.isPending) setDocumentToDelete(null);
        }}
        onConfirm={async () => {
          if (!documentToDelete) return;
          try {
            setDeleteError(null);
            await deleteMutation.mutateAsync(documentToDelete._id);
          } catch (error) {
            setDeleteError(
              getApiErrorMessage(
                error,
                "Unable to delete the document. Please try again.",
              ),
            );
          }
        }}
      />
    </main>
  );
}

function StatCard({
  label,
  value,
  icon,
}: {
  label: string;
  value: number;
  icon: React.ReactNode;
}) {
  return (
    <div className="rounded-2xl border border-slate-200 bg-white p-5 shadow-sm dark:border-slate-800 dark:bg-[#0a0a0a]">
      <div className="flex items-center justify-between gap-4">
        <span className="flex h-9 w-9 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-[#0a0a0a] dark:text-slate-300">
          {icon}
        </span>
        <span className="text-2xl font-semibold tracking-tight text-slate-950 dark:text-white">
          {value}
        </span>
      </div>
      <p className="mt-4 text-sm font-medium text-slate-500 dark:text-slate-400">
        {label}
      </p>
    </div>
  );
}
