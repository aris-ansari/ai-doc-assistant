"use client";

import { FileText, Trash2 } from "lucide-react";
import type { DocumentRecord } from "@/lib/types";
import { StatusBadge } from "./statusBadge";

interface DocumentTableProps {
  documents: DocumentRecord[];
  onDelete: (document: DocumentRecord) => void;
}

export function DocumentTable({ documents, onDelete }: DocumentTableProps) {
  if (documents.length === 0) {
    return (
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm dark:border-slate-800 dark:bg-[#0a0a0a]">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500 dark:bg-[#141414] dark:text-slate-400">
          <FileText size={22} />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-slate-900 dark:text-white">
          No documents yet
        </h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500 dark:text-slate-400">
          Upload your first document above. Once processing completes, it will
          be available to the RAG chat.
        </p>
      </div>
    );
  }

  return (
    <div className="w-full min-w-0 overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0a0a0a]">
      <div className="hidden overflow-auto max-h-[350px] min-[500px]:block">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50 dark:bg-[#0a0a0a]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500 dark:text-slate-400">
              <th className="px-5 py-3.5">Document</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Size</th>
              <th className="px-5 py-3.5">Uploaded</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100 dark:divide-slate-800">
            {documents.map((document) => (
              <tr
                key={document._id}
                className="align-middle hover:bg-slate-50 dark:bg-[#111111] dark:hover:bg-[#1c1c1c]"
              >
                <td className="max-w-sm px-5 py-4">
                  <DocumentIdentity document={document} />
                </td>
                <td className="whitespace-nowrap px-5 py-4">
                  <StatusBadge status={document.status} />
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {formatFileSize(document.size)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500 dark:text-slate-400">
                  {formatDate(document.createdAt)}
                </td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <DeleteButton document={document} onDelete={onDelete} />
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      <div className="divide-y divide-slate-200 dark:divide-slate-800 min-[500px]:hidden">
        {documents.map((document) => (
          <article key={document._id} className="min-w-0 p-4">
            <div className="flex min-w-0 items-start justify-between gap-3">
              <DocumentIdentity document={document} />
              <DeleteButton document={document} onDelete={onDelete} />
            </div>
            <div className="mt-3 flex flex-wrap items-center gap-x-4 gap-y-2 text-xs text-slate-500 dark:text-slate-400">
              <StatusBadge status={document.status} />
              <span>{formatFileSize(document.size)}</span>
              <span>{formatDate(document.createdAt)}</span>
            </div>
          </article>
        ))}
      </div>
    </div>
  );
}

function DocumentIdentity({ document }: { document: DocumentRecord }) {
  return (
    <div className="flex min-w-0 items-center gap-3">
      <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600 dark:bg-[#141414] dark:text-slate-300">
        <FileText size={17} />
      </span>
      <div className="min-w-0">
        <p
          className="truncate text-sm font-medium text-slate-900 dark:text-white"
          title={document.title}
        >
          {document.title}
        </p>
        <p
          className="truncate text-xs text-slate-500 dark:text-slate-400"
          title={document.originalName}
        >
          {document.originalName}
        </p>
        {document.status === "failed" && document.errorMessage && (
          <p className="mt-1 line-clamp-2 text-xs text-red-600">
            {document.errorMessage}
          </p>
        )}
      </div>
    </div>
  );
}

function DeleteButton({
  document,
  onDelete,
}: {
  document: DocumentRecord;
  onDelete: (document: DocumentRecord) => void;
}) {
  return (
    <button
      type="button"
      onClick={() => onDelete(document)}
      className="inline-flex shrink-0 items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600 dark:text-slate-400 dark:hover:bg-red-950/30"
      aria-label={`Delete ${document.title}`}
    >
      <Trash2 size={16} />
      <span className="sr-only sm:not-sr-only">Delete</span>
    </button>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", {
    month: "short",
    day: "numeric",
    year: "numeric",
  }).format(new Date(value));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
