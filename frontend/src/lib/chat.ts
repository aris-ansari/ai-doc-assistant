import api from "./api";
import type { ApiResponse } from "./types";

export interface SourceCitation {
  documentId: string;
  chunkIndex: number;
  snippet: string;
}

export interface ChatMessage {
  _id?: string;
  sender: "user" | "assistant";
  content: string;
  sources?: SourceCitation[];
  createdAt?: string;
}

export interface Conversation {
  _id: string;
  userId: string;
  title: string;
  documentIds: string[];
  messages: ChatMessage[];
  createdAt: string;
  updatedAt: string;
}

export const getConversations = async (): Promise<Conversation[]> => {
  const response =
    await api.get<ApiResponse<{ conversations: Conversation[] }>>("/chat");
  return response.data.data.conversations;
};

export const getConversation = async (
  conversationId: string,
): Promise<Conversation> => {
  const response = await api.get<ApiResponse<{ conversation: Conversation }>>(
    `/chat/${conversationId}`,
  );
  return response.data.data.conversation;
};

export const createConversation = async (input: {
  title?: string;
  documentIds?: string[];
}): Promise<Conversation> => {
  const response = await api.post<ApiResponse<{ conversation: Conversation }>>(
    "/chat",
    input,
  );
  return response.data.data.conversation;
};

export const sendMessage = async (
  conversationId: string,
  input: { message: string; documentIds?: string[] },
): Promise<{ conversation: Conversation; assistantMessage: ChatMessage }> => {
  const response = await api.post<
    ApiResponse<{ conversation: Conversation; assistantMessage: ChatMessage }>
  >(`/chat/${conversationId}/messages`, input);
  return response.data.data;
};

export const deleteConversation = async (
  conversationId: string,
): Promise<void> => {
  await api.delete(`/chat/${conversationId}`);
};
