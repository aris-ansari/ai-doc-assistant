"use client";

import { FormEvent, useEffect, useRef, useState } from "react";
import ReactMarkdown from "react-markdown";
import { Bot, LoaderCircle, Send, UserRound } from "lucide-react";
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
  const scrollRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    scrollRef.current?.scrollTo({
      top: scrollRef.current.scrollHeight,
      behavior: "smooth",
    });
  }, [conversation?.messages.length, isSending]);

  const submit = async (event: FormEvent) => {
    event.preventDefault();
    const trimmed = message.trim();
    if (!trimmed || disabled || isSending) return;
    setMessage("");
    try {
      await onSend(trimmed);
    } catch {
      setMessage(trimmed);
    }
  };

  if (!conversation) {
    return (
      <div className="flex min-h-[520px] flex-1 items-center justify-center bg-slate-50 p-6 text-center">
        <div className="max-w-md">
          <span className="mx-auto flex h-14 w-14 items-center justify-center rounded-2xl bg-white text-slate-500 shadow-sm ring-1 ring-slate-200">
            <Bot size={25} />
          </span>
          <h2 className="mt-5 text-lg font-semibold text-slate-950">
            Start a grounded conversation
          </h2>
          <p className="mt-2 text-sm leading-6 text-slate-500">
            Choose your documents on the left, then send a question. Answers are
            generated from the selected document chunks.
          </p>
        </div>
      </div>
    );
  }

  return (
    <section className="flex min-h-[520px] flex-1 flex-col bg-slate-50">
      <div className="border-b border-slate-200 bg-white px-5 py-4">
        <h1 className="truncate text-sm font-semibold text-slate-950">
          {conversation.title || "New Chat"}
        </h1>
        <p className="mt-0.5 text-xs text-slate-500">
          {selectedIds.length === 0
            ? "All ready documents"
            : `${selectedIds.length} document${selectedIds.length === 1 ? "" : "s"} selected`}
        </p>
      </div>

      <div
        ref={scrollRef}
        className="flex-1 space-y-5 overflow-y-auto px-4 py-6 sm:px-6"
      >
        {conversation.messages.length === 0 ? (
          <div className="flex min-h-72 items-center justify-center text-center">
            <div className="max-w-sm">
              <h2 className="text-base font-semibold text-slate-900">
                Ask your documents anything
              </h2>
              <p className="mt-2 text-sm text-slate-500">
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
            />
          ))
        )}

        {isSending && (
          <div className="flex items-start gap-3">
            <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
              <Bot size={15} />
            </span>
            <div className="rounded-2xl rounded-tl-md border border-slate-200 bg-white px-4 py-3 shadow-sm">
              <LoaderCircle size={16} className="animate-spin text-slate-500" />
            </div>
          </div>
        )}
      </div>

      <form
        onSubmit={submit}
        className="border-t border-slate-200 bg-white p-4"
      >
        <div className="flex items-end gap-2 rounded-xl border border-slate-300 bg-white p-2 shadow-sm focus-within:border-slate-500 focus-within:ring-2 focus-within:ring-slate-100">
          <textarea
            value={message}
            onChange={(event) => setMessage(event.target.value)}
            onKeyDown={(event) => {
              if (event.key === "Enter" && !event.shiftKey) {
                event.preventDefault();
                void submit(event);
              }
            }}
            rows={2}
            disabled={disabled || isSending}
            placeholder={
              disabled
                ? "Upload a ready document to start chatting"
                : "Ask a question about your documents…"
            }
            className="max-h-36 min-h-11 flex-1 resize-none border-0 bg-transparent px-2 py-2 text-sm text-slate-900 outline-none placeholder:text-slate-400 disabled:cursor-not-allowed"
          />
          <button
            type="submit"
            disabled={disabled || isSending || !message.trim()}
            className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg bg-slate-950 text-white hover:bg-slate-800 disabled:cursor-not-allowed disabled:opacity-40"
            aria-label="Send message"
          >
            <Send size={16} />
          </button>
        </div>
        <p className="mt-2 text-center text-[11px] text-slate-400">
          Enter to send · Shift+Enter for a new line
        </p>
      </form>
    </section>
  );
}

function MessageBubble({
  message,
  documents,
}: {
  message: Conversation["messages"][number];
  documents: DocumentRecord[];
}) {
  const isUser = message.sender === "user";
  return (
    <div
      className={`flex items-start gap-3 ${isUser ? "justify-end" : "justify-start"}`}
    >
      {!isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-900 text-white">
          <Bot size={15} />
        </span>
      )}
      <div className={`max-w-[85%] ${isUser ? "order-first" : ""}`}>
        <div
          className={`rounded-2xl px-4 py-3 text-sm leading-6 shadow-sm ${isUser ? "rounded-tr-md bg-slate-950 text-white" : "rounded-tl-md border border-slate-200 bg-white text-slate-800"}`}
        >
          {isUser ? (
            <p className="whitespace-pre-wrap">{message.content}</p>
          ) : (
            <Markdown content={message.content} />
          )}
        </div>
        {!isUser && message.sources && message.sources.length > 0 && (
          <SourceList sources={message.sources} documents={documents} />
        )}
      </div>
      {isUser && (
        <span className="flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-slate-200 text-slate-600">
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
    <details className="mt-2 rounded-xl border border-slate-200 bg-white px-3 py-2 text-xs shadow-sm">
      <summary className="cursor-pointer font-semibold text-slate-600">
        Sources ({sources.length})
      </summary>
      <div className="mt-2 space-y-2">
        {sources.map((source, index) => (
          <div
            key={`${source.documentId}-${source.chunkIndex}-${index}`}
            className="rounded-lg bg-slate-50 p-2.5"
          >
            <p className="font-medium text-slate-700">
              {documentMap.get(source.documentId) ?? "Document"} · chunk{" "}
              {source.chunkIndex + 1}
            </p>
            <p className="mt-1 leading-5 text-slate-500">{source.snippet}</p>
          </div>
        ))}
      </div>
    </details>
  );
}
