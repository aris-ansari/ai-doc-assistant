"use client";

import { Check, FileText } from "lucide-react";
import type { DocumentRecord } from "@/lib/types";

interface DocumentSelectorProps {
  documents: DocumentRecord[];
  selectedIds: string[];
  onChange: (ids: string[]) => void;
}

export function DocumentSelector({ documents, selectedIds, onChange }: DocumentSelectorProps) {
  const readyDocuments = documents.filter((document) => document.status === "completed");

  const toggle = (id: string) => {
    if (selectedIds.includes(id)) {
      onChange(selectedIds.filter((selectedId) => selectedId !== id));
    } else {
      onChange([...selectedIds, id]);
    }
  };

  return (
    <section className="border-b border-slate-200 bg-white p-4">
      <div className="flex items-center justify-between gap-3">
        <div>
          <h2 className="text-sm font-semibold text-slate-900">Chat documents</h2>
          <p className="mt-0.5 text-xs text-slate-500">
            {selectedIds.length === 0 ? "All ready documents" : `${selectedIds.length} selected`}
          </p>
        </div>
        {readyDocuments.length > 0 && (
          <button
            type="button"
            onClick={() => onChange(selectedIds.length === readyDocuments.length ? [] : readyDocuments.map((document) => document._id))}
            className="text-xs font-medium text-slate-600 hover:text-slate-950"
          >
            {selectedIds.length === readyDocuments.length ? "Clear" : "Select all"}
          </button>
        )}
      </div>

      {readyDocuments.length === 0 ? (
        <p className="mt-3 rounded-lg bg-slate-50 px-3 py-2 text-xs text-slate-500">
          Upload and process a document before starting a grounded chat.
        </p>
      ) : (
        <div className="mt-3 max-h-44 space-y-1 overflow-y-auto">
          {readyDocuments.map((document) => {
            const selected = selectedIds.includes(document._id);
            return (
              <button
                key={document._id}
                type="button"
                onClick={() => toggle(document._id)}
                className={`flex w-full items-center gap-3 rounded-lg px-3 py-2 text-left transition ${selected ? "bg-slate-100" : "hover:bg-slate-50"}`}
              >
                <span className={`flex h-7 w-7 shrink-0 items-center justify-center rounded-md ${selected ? "bg-slate-950 text-white" : "bg-slate-100 text-slate-500"}`}>
                  {selected ? <Check size={14} /> : <FileText size={14} />}
                </span>
                <span className="min-w-0 flex-1 truncate text-xs font-medium text-slate-700" title={document.title}>
                  {document.title}
                </span>
              </button>
            );
          })}
        </div>
      )}
    </section>
  );
}
