"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import {
  Bot,
  Check,
  Clipboard,
  LoaderCircle,
  Send,
  UserRound,
} from "lucide-react";
import type { Conversation } from "@/lib/chat";
import type { DocumentRecord } from "@/lib/types";

interface ChatWindowProps {
  conversation: Conversation | null;
  documents: DocumentRecord[];
  selectedIds: string[];
  onSend: (message: string) => Promise<void>;
  disabled: boolean;
  isSending: boolean;
}

export function ChatWindow({
  conversation,
  documents,
  selectedIds,
  onSend,
  disabled,
  isSending,
}: ChatWindowProps) {
  const [message, setMessage] = useState("");
  const [copiedId, setCopiedId] = useState<string | null>(null);
  const scrollRef = useRef<HTMLDivElement>(null);
  const textareaRef = useRef<HTMLTextAreaElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation?.messages.length, isSending]);

  useEffect(() => {
    const textarea = textareaRef.current;
    if (!textarea) return;
    textarea.style.height = "auto";
    textarea.style.height = `${Math.min(textarea.scrollHeight, 160)}px`;
  }, [message]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled || isSending) return;
    setMessage("");
    try {
      await onSend(trimmed);
    } catch {
      setMessage(trimmed);
      textareaRef.current?.focus();
    }
  };

  const copyMessage = async (id: string, content: string) => {
    await navigator.clipboard.writeText(content);
    setCopiedId(id);
    window.setTimeout(() => setCopiedId(null), 1400);
  };

  if (!conversation) {
    return (
      <div className="flex min-h-[520px] flex-1 items-center justify-center bg-slate-50 p-6 text-center dark:bg-[#0a0a0a]">
        <div className="max-w-md">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200 dark:bg-[#141414] dark:text-slate-300 dark:ring-slate-800">
            <Bot size={25} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-slate-950 dark:text-white">
            Start a grounded conversation
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500 dark:text-slate-400">
            Choose your documents on the left, then send a question. Answers are
            generated from the selected document chunks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-[520px] flex-1 flex-col bg-slate-50 dark:bg-[#0a0a0a]">
      <div className="border-b border-slate-200 bg-white/90 px-5 py-4 backdrop-blur dark:border-slate-800 dark:bg-[#0a0a0a]/95">
        <h1 className="truncate text-sm font-semibold text-slate-950 dark:text-white">
          {conversation.title || "New Chat"}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-400">
          {selectedIds.length === 0
            ? "All ready documents"
            : `${selectedIds.length} document${selectedIds.length === 1 ? "" : "s"} selected`}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-6 overflow-y-auto px-4 py-6 sm:px-8 lg:px-10"
      >
        {conversation.messages.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center text-center">
            <div className="max-w-sm">
              <h2 className="text-base font-semibold text-slate-900 dark:text-white">
                Ask your documents anything
              </h2>
              <p className="mt-2 text-sm text-slate-500 dark:text-slate-400">
                Try asking for a summary, a definition, or a fact that appears
                in your uploaded documents.
              </p>
            </div>
          </div>
        ) : (
          conversation.messages.map((item, index) => (
            <MessageBubble
              key={item._id ?? `${item.sender}-${index}`}
              message={item}
              documents={documents}
              onCopy={copyMessage}
              copiedId={copiedId}
            />
          ))
        )}

        {isSending && (
          <div className="message-in flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <Bot size={15} />
            </span>
            <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm dark:border-slate-800 dark:bg-[#141414]">
              <span
                className="flex items-center gap-1.5"
                aria-label="Assistant is typing"
              >
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:150ms]" />
                <span className="h-1.5 w-1.5 animate-pulse rounded-full bg-slate-400 [animation-delay:300ms]" />
              </span>
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-slate-200 bg-white p-4 dark:border-slate-800 dark:bg-[#0a0a0a] sm:p-5"
      >
        <div className="mx-auto max-w-4xl">
          <div className="flex items-end gap-2 rounded-2xl border border-slate-300 bg-white p-2 shadow-sm transition focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100 dark:border-slate-700 dark:bg-[#0a0a0a] dark:focus-within:border-slate-500 dark:focus-within:ring-slate-800">
            <textarea
              ref={textareaRef}
              value={message}
              onChange={(event) => setMessage(event.target.value)}
              onKeyDown={(event) => {
                if (event.key === "Enter" && !event.shiftKey) {
                  event.preventDefault();
                  void submit(event);
                }
              }}
              rows={1}
              disabled={disabled || isSending}
              placeholder={
                disabled
                  ? "Upload a ready document to start chatting"
                  : "Ask anything about your documents…"
              }
              className="max-h-40 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2.5 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed dark:text-slate-100"
            />
            <button
              type="submit"
              disabled={disabled || isSending || !message.trim()}
              className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white transition hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-35 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
              aria-label="Send message"
            >
              <Send size={16} />
            </button>
          </div>
          <p className="mt-2 text-center text-[11px] text-slate-400 dark:text-slate-500">
            Enter to send · Shift+Enter for a new line
          </p>
        </div>
      </form>
    </section>
  );
}

function MessageBubble({
  message,
  documents,
  onCopy,
  copiedId,
}: {
  message: Conversation["messages"][number];
  documents: DocumentRecord[];
  onCopy: (id: string, content: string) => void;
  copiedId: string | null;
}) {
  const isUser = message.sender === "user";
  const messageId =
    message._id ?? `${message.sender}-${message.createdAt ?? message.content}`;
  return (
    <div
      className={`message-in flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-950 text-white dark:bg-white dark:text-slate-950">
          <Bot size={15} />
        </span>
      )}
      <div className={`max-w-[min(85%,720px)] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${isUser ? "rounded-tr-md bg-slate-950 text-white dark:bg-[#181818]" : "rounded-tl-md border border-slate-200 bg-white text-slate-800 dark:border-slate-800 dark:bg-[#141414] dark:text-slate-200"}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>
        {!isUser && (
          <div className="mt-1.5 flex items-center gap-1">
            <button
              type="button"
              onClick={() => void onCopy(messageId, message.content)}
              className="inline-flex items-center gap-1 rounded-md px-2 py-1 text-[11px] text-slate-400 transition hover:bg-slate-100 hover:text-slate-700 dark:hover:bg-[#1c1c1c] dark:hover:text-slate-200"
            >
              {copiedId === messageId ? (
                <Check size={12} />
              ) : (
                <Clipboard size={12} />
              )}
              {copiedId === messageId ? "Copied" : "Copy"}
            </button>
          </div>
        )}
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} documents={documents} />
        )}
      </div>
      {isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600 dark:bg-[#0a0a0a] dark:text-slate-300">
          <UserRound size={15} />
        </span>
      )}
    </div>
  );
}

function Markdown({ content }: { content: string }) {
  return (
    <div className="chat-markdown text-sm leading-6">
      <ReactMarkdown>{content}</ReactMarkdown>
    </div>
  );
}

function SourceList({
  sources,
  documents,
}: {
  sources: NonNullable<Conversation["messages"][number]["sources"]>;
  documents: DocumentRecord[];
}) {
  const documentMap = new Map(
    documents.map((document) => [document._id, document.title]),
  );
  return (
    <details className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm dark:border-slate-800 dark:bg-[#141414]">
      <summary className="cursor-pointer font-semibold text-slate-600 dark:text-slate-300">
        Sources ({sources.length})
      </summary>
      <div className="mt-2 space-y-2">
        {sources.map((source, index) => (
          <div
            key={`${source.documentId}-${source.chunkIndex}-${index}`}
            className="rounded-lg bg-slate-50 p-2.5 dark:bg-[#0a0a0a]"
          >
            <p className="font-medium text-slate-700 dark:text-slate-200">
              {documentMap.get(source.documentId) ?? "Document"} · chunk{" "}
              {source.chunkIndex + 1}
            </p>
            <p className="mt-1 leading-5 text-slate-500 dark:text-slate-400">
              {source.snippet}
            </p>
          </div>
        ))}
      </div>
    </details>
  );
}
