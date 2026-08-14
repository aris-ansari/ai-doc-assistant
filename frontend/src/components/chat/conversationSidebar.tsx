"use client";

import { MessageSquare, Plus, Trash2 } from "lucide-react";
import type { Conversation } from "@/lib/chat";

interface ConversationSidebarProps {
  conversations: Conversation[];
  activeId: string | null;
  onSelect: (id: string) => void;
  onNew: () => void;
  onDelete: (conversation: Conversation) => void;
  isDeleting: boolean;
}

export function ConversationSidebar({
  conversations,
  activeId,
  onSelect,
  onNew,
  onDelete,
  isDeleting,
}: ConversationSidebarProps) {
  return (
    <aside className="flex min-h-0 w-full flex-col border-b border-slate-200 bg-white dark:border-slate-800 dark:bg-[#0a0a0a] lg:w-72 lg:border-b-0 lg:border-r">
      <div className="flex items-center justify-between border-b border-slate-200 dark:border-slate-800 p-4">
        <div>
          <h2 className="text-sm font-semibold text-slate-950 dark:text-white">
            Conversations
          </h2>
          <p className="mt-0.5 text-xs text-slate-500 dark:text-slate-500">
            Your recent chats
          </p>
        </div>
        <button
          type="button"
          onClick={onNew}
          className="inline-flex items-center gap-1.5 rounded-lg bg-slate-950 px-2.5 py-2 text-xs font-semibold text-white hover:bg-slate-800 dark:bg-white dark:text-slate-950 dark:hover:bg-slate-200"
        >
          <Plus size={14} /> New
        </button>
      </div>

      <div className="max-h-56 space-y-1 overflow-y-auto p-2 lg:max-h-none lg:flex-1">
        {conversations.length === 0 ? (
          <div className="px-3 py-8 text-center">
            <MessageSquare className="mx-auto text-slate-300" size={22} />
            <p className="mt-2 text-xs text-slate-500 dark:text-slate-500">
              No conversations yet.
            </p>
          </div>
        ) : (
          conversations.map((conversation) => (
            <div
              key={conversation._id}
              className={`group flex items-center rounded-lg ${activeId === conversation._id ? "bg-slate-100 dark:bg-[#1a1a1a]" : "hover:bg-slate-50 dark:hover:bg-[#1c1c1c]"}`}
            >
              <button
                type="button"
                onClick={() => onSelect(conversation._id)}
                className="min-w-0 flex-1 px-3 py-2.5 text-left"
              >
                <p className="truncate text-sm font-medium text-slate-800 dark:text-slate-200">
                  {conversation.title || "New Chat"}
                </p>
                <p className="mt-0.5 text-xs text-slate-400 dark:text-slate-500">
                  {conversation.messages.length} message
                  {conversation.messages.length === 1 ? "" : "s"}
                </p>
              </button>
              <button
                type="button"
                disabled={isDeleting}
                onClick={() => onDelete(conversation)}
                aria-label={`Delete ${conversation.title || "conversation"}`}
                className="mr-1 rounded-md p-2 text-slate-400 dark:text-slate-500 opacity-0 transition hover:bg-red-50 hover:text-red-600 group-hover:opacity-100 disabled:opacity-50"
              >
                <Trash2 size={14} />
              </button>
            </div>
          ))
        )}
      </div>
    </aside>
  );
}
