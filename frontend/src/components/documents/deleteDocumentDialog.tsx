"use client";

import { LoaderCircle, Trash2, X } from "lucide-react";
import type { DocumentRecord } from "@/lib/types";

interface DeleteDocumentDialogProps {
  document: DocumentRecord | null;
  isDeleting: boolean;
  onCancel: () => void;
  onConfirm: () => Promise<void>;
}

export function DeleteDocumentDialog({
  document,
  isDeleting,
  onCancel,
  onConfirm,
}: DeleteDocumentDialogProps) {
  if (!document) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-slate-950/40 px-4 backdrop-blur-[1px]"
      role="presentation"
      onMouseDown={onCancel}
    >
      <div
        role="dialog"
        aria-modal="true"
        aria-labelledby="delete-document-title"
        className="w-full max-w-md rounded-2xl bg-white p-6 shadow-2xl"
        onMouseDown={(event) => event.stopPropagation()}
      >
        <div className="flex items-start justify-between gap-4">
          <div className="flex h-10 w-10 items-center justify-center rounded-full bg-red-50 text-red-600">
            <Trash2 size={19} />
          </div>
          <button
            type="button"
            onClick={onCancel}
            className="rounded-lg p-1.5 text-slate-400 hover:bg-slate-100 hover:text-slate-700"
            aria-label="Close dialog"
          >
            <X size={18} />
          </button>
        </div>
        <h2
          id="delete-document-title"
          className="mt-4 text-lg font-semibold text-slate-950"
        >
          Delete this document?
        </h2>
        <p className="mt-2 text-sm leading-6 text-slate-500">
          <span className="font-medium text-slate-700">{document.title}</span>{" "}
          and its processed vectors will be permanently removed.
        </p>
        <div className="mt-6 flex justify-end gap-3">
          <button
            type="button"
            onClick={onCancel}
            disabled={isDeleting}
            className="rounded-lg border border-slate-200 px-4 py-2.5 text-sm font-medium text-slate-700 hover:bg-slate-50 disabled:opacity-50"
          >
            Cancel
          </button>
          <button
            type="button"
            onClick={() => void onConfirm()}
            disabled={isDeleting}
            className="inline-flex items-center gap-2 rounded-lg bg-red-600 px-4 py-2.5 text-sm font-medium text-white hover:bg-red-700 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isDeleting && <LoaderCircle size={16} className="animate-spin" />}
            {isDeleting ? "Deleting…" : "Delete document"}
          </button>
        </div>
      </div>
    </div>
  );
}
