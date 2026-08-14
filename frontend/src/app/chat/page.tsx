"use client";

import { useEffect, useMemo, useState } from "react";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import {
  ArrowLeft,
  FileText,
  LogOut,
  MessageSquare,
  RefreshCw,
  X,
  Menu,
} from "lucide-react";
import { useRouter } from "next/navigation";
import { useAuth } from "@/providers/authProvider";
import { getApiErrorMessage } from "@/lib/apiError";
import { getDocuments } from "@/lib/documents";
import {
  createConversation,
  deleteConversation,
  getConversation,
  getConversations,
  sendMessage,
  type Conversation,
} from "@/lib/chat";
import type { DocumentRecord } from "@/lib/types";
import { Spinner } from "@/components/ui/spinner";
import { ConversationSidebar } from "@/components/chat/conversationSidebar";
import { DocumentSelector } from "@/components/chat/documentSelector";
import { ChatWindow } from "@/components/chat/chatWindow";
import { ThemeToggle } from "@/components/ui/themeToggle";

export default function ChatPage() {
  const router = useRouter();
  const queryClient = useQueryClient();
  const { isLoading: authLoading, isAuthenticated, signOut } = useAuth();
  const [activeId, setActiveId] = useState<string | null>(null);
  const [selectedIds, setSelectedIds] = useState<string[]>([]);
  const [menuOpen, setMenuOpen] = useState(false);
  const [conversation, setConversation] = useState<Conversation | null>(null);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    if (!authLoading && !isAuthenticated) router.replace("/login");
  }, [authLoading, isAuthenticated, router]);

  const documentsQuery = useQuery({
    queryKey: ["documents"],
    queryFn: getDocuments,
    enabled: isAuthenticated,
  });
  const conversationsQuery = useQuery({
    queryKey: ["conversations"],
    queryFn: getConversations,
    enabled: isAuthenticated,
  });

  const readyDocuments = useMemo(
    () =>
      (documentsQuery.data ?? []).filter(
        (document) => document.status === "completed",
      ),
    [documentsQuery.data],
  );

  useEffect(() => {
    if (
      readyDocuments.length > 0 &&
      selectedIds.length === 0 &&
      !conversation
    ) {
      setSelectedIds(readyDocuments.map((document) => document._id));
    }
  }, [readyDocuments, selectedIds.length, conversation]);

  const openConversation = async (id: string) => {
    try {
      setError(null);
      const loaded = await getConversation(id);
      setActiveId(id);
      setConversation(loaded);
      setSelectedIds(loaded.documentIds);
    } catch (requestError) {
      setError(
        getApiErrorMessage(requestError, "Unable to open this conversation."),
      );
    }
  };

  useEffect(() => {
    if (!activeId && conversationsQuery.data?.length) {
      void openConversation(conversationsQuery.data[0]._id);
    }
  }, [activeId, conversationsQuery.data]);

  const createMutation = useMutation({
    mutationFn: (input: { title?: string; documentIds?: string[] }) =>
      createConversation(input),
    onSuccess: (created) => {
      setActiveId(created._id);
      setConversation(created);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const sendMutation = useMutation({
    mutationFn: async ({
      conversationId,
      message,
    }: {
      conversationId: string;
      message: string;
    }) => sendMessage(conversationId, { message, documentIds: selectedIds }),
    onSuccess: ({ conversation: updated }) => {
      setConversation(updated);
      queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  const deleteMutation = useMutation({
    mutationFn: deleteConversation,
    onSuccess: async (_data, deletedId) => {
      if (activeId === deletedId) {
        setActiveId(null);
        setConversation(null);
      }
      await queryClient.invalidateQueries({ queryKey: ["conversations"] });
    },
  });

  if (authLoading)
    return (
      <main className="flex min-h-screen items-center justify-center bg-slate-50 dark:bg-[#0a0a0a]">
        <Spinner />
      </main>
    );
  if (!isAuthenticated) return null;

  const handleNew = async () => {
    try {
      setError(null);

      const documentIds = readyDocuments.map((document) => document._id);

      const created = await createMutation.mutateAsync({
        title: "New Chat",
        documentIds,
      });

      setSelectedIds(documentIds);
      setActiveId(created._id);
      setConversation(created);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to create a new conversation.",
        ),
      );
    }
  };

  const handleSend = async (message: string) => {
    try {
      setError(null);
      let current = conversation;
      if (!current) {
        current = await createMutation.mutateAsync({
          title: message.length > 60 ? `${message.slice(0, 57)}…` : message,
          documentIds: selectedIds,
        });
        setActiveId(current._id);
        setConversation(current);
      }

      const optimisticMessage = {
        _id: `optimistic-${Date.now()}`,
        sender: "user" as const,
        content: message,
        createdAt: new Date().toISOString(),
      };
      setConversation({
        ...current,
        messages: [...current.messages, optimisticMessage],
      });

      const result = await sendMutation.mutateAsync({
        conversationId: current._id,
        message,
      });
      setConversation(result.conversation);
    } catch (requestError) {
      setError(
        getApiErrorMessage(
          requestError,
          "Unable to send your message. Please try again.",
        ),
      );
      if (conversation) setConversation(conversation);
      throw requestError;
    }
  };

  const isSending = createMutation.isPending || sendMutation.isPending;
  const chatDisabled = readyDocuments.length === 0 || documentsQuery.isLoading;

  return (
    <main className="min-h-screen overflow-x-hidden bg-slate-50 text-slate-950 dark:bg-[#000000] dark:text-slate-100">
      <header className="relative border-b border-slate-200 bg-white/90 backdrop-blur dark:border-slate-800 dark:bg-[#0a0a0a]/95">
        <div className="mx-auto flex max-w-[1500px] items-center justify-between px-4 py-3 sm:px-6">
          <div className="flex min-w-0 items-center gap-2 sm:gap-3">
            <button
              type="button"
              onClick={() => router.push("/dashboard")}
              className="shrink-0 rounded-lg p-2 text-slate-500 hover:bg-slate-100 hover:text-slate-900 dark:text-slate-400 dark:hover:bg-[#1c1c1c] dark:hover:text-white"
              aria-label="Back to dashboard"
            >
              <ArrowLeft size={18} />
            </button>
            <span className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl bg-slate-950 text-white dark:bg-white dark:text-slate-950">
              <FileText size={17} />
            </span>
            <div className="min-w-0">
              <p className="truncate text-sm font-semibold text-slate-950 dark:text-white">
                AI Document Workspace
              </p>
              <p className="hidden text-xs text-slate-500 dark:text-slate-400 sm:block">
                Grounded RAG chat
              </p>
            </div>
          </div>
          <div className="hidden items-center gap-2 min-[500px]:flex">
            <ThemeToggle />
            <button
              type="button"
              onClick={() =>
                void Promise.all([
                  documentsQuery.refetch(),
                  conversationsQuery.refetch(),
                ])
              }
              className="rounded-lg p-2 text-slate-500 hover:bg-slate-100 dark:text-slate-400 dark:hover:bg-[#1c1c1c]"
              aria-label="Refresh"
            >
              <RefreshCw size={17} />
            </button>
            <button
              type="button"
              onClick={async () => {
                await signOut();
                router.replace("/login");
                router.refresh();
              }}
              className="inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm text-slate-600 hover:bg-slate-100 dark:text-slate-300 dark:hover:bg-[#1c1c1c]"
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
                  void Promise.all([
                    documentsQuery.refetch(),
                    conversationsQuery.refetch(),
                  ]);
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1c1c1c]"
              >
                <RefreshCw size={16} /> Refresh
              </button>
              <button
                type="button"
                onClick={async () => {
                  setMenuOpen(false);
                  await signOut();
                  router.replace("/login");
                  router.refresh();
                }}
                className="flex w-full items-center gap-2 rounded-lg px-3 py-2.5 text-left text-sm text-slate-700 hover:bg-slate-100 dark:text-slate-200 dark:hover:bg-[#1c1c1c]"
              >
                <LogOut size={16} /> Sign out
              </button>
            </div>
          )}
        </div>
      </header>

      <section className="mx-auto max-w-[1500px] px-4 py-5 sm:px-6">
        {error && (
          <div className="mb-4 flex items-start justify-between gap-4 rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700 dark:border-red-900/60 dark:bg-red-950/40 dark:text-red-300">
            <p>{error}</p>
            <button
              type="button"
              onClick={() => setError(null)}
              className="font-medium underline"
            >
              Dismiss
            </button>
          </div>
        )}

        <div className="overflow-hidden rounded-2xl border border-slate-200 bg-white shadow-sm dark:border-slate-800 dark:bg-[#0a0a0a] lg:flex lg:h-[calc(100vh-110px)] lg:min-h-[620px]">
          <div className="flex min-h-0 flex-col lg:w-72 lg:shrink-0">
            <ConversationSidebar
              conversations={conversationsQuery.data ?? []}
              activeId={activeId}
              onSelect={(id) => void openConversation(id)}
              onNew={handleNew}
              onDelete={(item) => void deleteMutation.mutateAsync(item._id)}
              isDeleting={deleteMutation.isPending}
            />
            <DocumentSelector
              documents={documentsQuery.data ?? []}
              selectedIds={selectedIds}
              onChange={setSelectedIds}
            />
            <div className="hidden border-t border-slate-200 dark:border-[#0f172a] p-4 text-xs text-slate-400 lg:block">
              <div className="flex items-center gap-2">
                <MessageSquare size={14} /> Answers include retrieved source
                citations.
              </div>
            </div>
          </div>
          <ChatWindow
            conversation={conversation}
            documents={documentsQuery.data ?? []}
            selectedIds={selectedIds}
            onSend={handleSend}
            disabled={chatDisabled}
            isSending={isSending}
          />
        </div>
      </section>
    </main>
  );
}
