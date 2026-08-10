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
      <div className="rounded-2xl border border-slate-200 bg-white px-6 py-16 text-center shadow-sm">
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-slate-100 text-slate-500">
          <FileText size={22} />
        </span>
        <h3 className="mt-4 text-sm font-semibold text-slate-900">No documents yet</h3>
        <p className="mx-auto mt-1 max-w-sm text-sm text-slate-500">Upload your first document above. Once processing completes, it will be available to the RAG chat.</p>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-slate-200">
          <thead className="bg-slate-50/80">
            <tr className="text-left text-xs font-semibold uppercase tracking-wide text-slate-500">
              <th className="px-5 py-3.5">Document</th>
              <th className="px-5 py-3.5">Status</th>
              <th className="px-5 py-3.5">Size</th>
              <th className="px-5 py-3.5">Uploaded</th>
              <th className="px-5 py-3.5 text-right">Action</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-100">
            {documents.map((document) => (
              <tr key={document._id} className="align-middle hover:bg-slate-50/70">
                <td className="max-w-sm px-5 py-4">
                  <div className="flex min-w-0 items-center gap-3">
                    <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-lg bg-slate-100 text-slate-600">
                      <FileText size={17} />
                    </span>
                    <div className="min-w-0">
                      <p className="truncate text-sm font-medium text-slate-900" title={document.title}>{document.title}</p>
                      <p className="truncate text-xs text-slate-500" title={document.originalName}>{document.originalName}</p>
                      {document.status === "failed" && document.errorMessage && (
                        <p className="mt-1 line-clamp-2 text-xs text-red-600">{document.errorMessage}</p>
                      )}
                    </div>
                  </div>
                </td>
                <td className="whitespace-nowrap px-5 py-4"><StatusBadge status={document.status} /></td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatFileSize(document.size)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-sm text-slate-500">{formatDate(document.createdAt)}</td>
                <td className="whitespace-nowrap px-5 py-4 text-right">
                  <button type="button" onClick={() => onDelete(document)} className="inline-flex items-center gap-1.5 rounded-lg px-2.5 py-2 text-sm font-medium text-slate-500 hover:bg-red-50 hover:text-red-600" aria-label={`Delete ${document.title}`}>
                    <Trash2 size={16} />
                    <span className="sr-only sm:not-sr-only">Delete</span>
                  </button>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>
    </div>
  );
}

function formatDate(value: string): string {
  return new Intl.DateTimeFormat("en", { month: "short", day: "numeric", year: "numeric" }).format(new Date(value));
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
