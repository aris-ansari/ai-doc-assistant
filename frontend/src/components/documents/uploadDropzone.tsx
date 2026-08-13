"use client";

import { ChangeEvent, DragEvent, useRef, useState } from "react";
import { FileText, LoaderCircle, UploadCloud, X } from "lucide-react";
import { getApiErrorMessage } from "@/lib/apiError";

const ACCEPTED_TYPES = new Set([
  "application/pdf",
  "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  "text/plain",
]);
const ACCEPTED_EXTENSIONS = ".pdf,.docx,.txt";
const MAX_FILE_SIZE = 10 * 1024 * 1024;

interface UploadDropzoneProps {
  isUploading: boolean;
  onUpload: (file: File, title?: string) => Promise<void>;
}

export function UploadDropzone({ isUploading, onUpload }: UploadDropzoneProps) {
  const inputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);
  const [selectedFile, setSelectedFile] = useState<File | null>(null);
  const [title, setTitle] = useState("");
  const [error, setError] = useState<string | null>(null);

  const validateFile = (file: File): boolean => {
    if (!ACCEPTED_TYPES.has(file.type)) {
      setError("Only PDF, DOCX, and TXT files are supported.");
      return false;
    }

    if (file.size > MAX_FILE_SIZE) {
      setError("File size must be 10 MB or less.");
      return false;
    }

    setError(null);
    setSelectedFile(file);
    return true;
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (file) validateFile(file);
    event.target.value = "";
  };

  const handleDrop = (event: DragEvent<HTMLDivElement>) => {
    event.preventDefault();
    setIsDragging(false);
    const file = event.dataTransfer.files?.[0];
    if (file) validateFile(file);
  };

  const handleUpload = async () => {
    if (!selectedFile || isUploading) return;
    try {
      setError(null);
      await onUpload(selectedFile, title);
      setSelectedFile(null);
      setTitle("");
    } catch (uploadError) {
      setError(
        getApiErrorMessage(uploadError, "Upload failed. Please try again."),
      );
    }
  };

  return (
    <section className="rounded-2xl border border-slate-200 bg-white p-6 shadow-sm">
      <div className="mb-5">
        <h2 className="text-base font-semibold text-slate-950">
          Add a document
        </h2>
        <p className="mt-1 text-sm text-slate-500">
          Upload a PDF, DOCX, or TXT file up to 10 MB.
        </p>
      </div>

      <div
        role="button"
        tabIndex={0}
        onClick={() => inputRef.current?.click()}
        onKeyDown={(event) => {
          if (event.key === "Enter" || event.key === " ")
            inputRef.current?.click();
        }}
        onDragEnter={(event) => {
          event.preventDefault();
          setIsDragging(true);
        }}
        onDragOver={(event) => event.preventDefault()}
        onDragLeave={(event) => {
          if (event.currentTarget === event.target) setIsDragging(false);
        }}
        onDrop={handleDrop}
        className={`cursor-pointer rounded-xl border border-dashed p-8 text-center transition ${
          isDragging
            ? "border-slate-900 bg-slate-50"
            : "border-slate-300 bg-slate-50/60 hover:border-slate-400 hover:bg-slate-50"
        }`}
      >
        <input
          ref={inputRef}
          type="file"
          accept={ACCEPTED_EXTENSIONS}
          className="hidden"
          onChange={handleFileChange}
          disabled={isUploading}
        />
        <span className="mx-auto flex h-12 w-12 items-center justify-center rounded-full bg-white text-slate-700 shadow-sm ring-1 ring-slate-200">
          <UploadCloud size={22} />
        </span>
        <p className="mt-4 text-sm font-medium text-slate-900">
          Drop a file here or click to browse
        </p>
        <p className="mt-1 text-xs text-slate-500">
          PDF, DOCX, TXT · 10 MB maximum
        </p>
      </div>

      {selectedFile && (
        <div className="mt-4 rounded-xl border border-slate-200 bg-slate-50 p-4">
          <div className="flex items-start gap-3">
            <span className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-white text-slate-700 ring-1 ring-slate-200">
              <FileText size={18} />
            </span>
            <div className="min-w-0 flex-1">
              <p className="truncate text-sm font-medium text-slate-900">
                {selectedFile.name}
              </p>
              <p className="mt-0.5 text-xs text-slate-500">
                {formatFileSize(selectedFile.size)}
              </p>
            </div>
            <button
              type="button"
              aria-label="Remove selected file"
              onClick={() => {
                setSelectedFile(null);
                setTitle("");
                setError(null);
              }}
              className="rounded-lg p-1.5 text-slate-400 hover:bg-white hover:text-slate-700"
            >
              <X size={17} />
            </button>
          </div>

          <label className="mt-4 block">
            <span className="text-sm font-medium text-slate-700">
              Title{" "}
              <span className="font-normal text-slate-400">(optional)</span>
            </span>
            <input
              value={title}
              onChange={(event) => setTitle(event.target.value)}
              onClick={(event) => event.stopPropagation()}
              placeholder={selectedFile.name}
              maxLength={200}
              className="mt-1.5 w-full rounded-lg border border-slate-300 bg-white px-3 py-2.5 text-sm outline-none transition placeholder:text-slate-400 focus:border-slate-500 focus:ring-2 focus:ring-slate-200"
            />
          </label>

          <button
            type="button"
            onClick={(event) => {
              event.stopPropagation();
              void handleUpload();
            }}
            disabled={isUploading}
            className="mt-4 inline-flex w-full items-center justify-center gap-2 rounded-lg bg-slate-950 px-4 py-2.5 text-sm font-medium text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-60"
          >
            {isUploading && <LoaderCircle size={16} className="animate-spin" />}
            {isUploading ? "Uploading…" : "Upload document"}
          </button>
        </div>
      )}

      {error && <p className="mt-3 text-sm text-red-600">{error}</p>}
    </section>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes < 1024) return `${bytes} B`;
  if (bytes < 1024 * 1024) return `${(bytes / 1024).toFixed(1)} KB`;
  return `${(bytes / (1024 * 1024)).toFixed(1)} MB`;
}
