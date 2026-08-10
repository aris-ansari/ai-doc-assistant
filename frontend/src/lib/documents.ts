import api from "./api";
import type { ApiResponse, DocumentRecord } from "./types";

export const getDocuments = async (): Promise<DocumentRecord[]> => {
  const response = await api.get<ApiResponse<{ documents: DocumentRecord[] }>>("/documents");
  return response.data.data.documents;
};

export const uploadDocument = async (file: File, title?: string): Promise<DocumentRecord> => {
  const formData = new FormData();
  formData.append("file", file);

  if (title?.trim()) {
    formData.append("title", title.trim());
  }

  const response = await api.post<ApiResponse<{ document: DocumentRecord }>>(
    "/documents/upload",
    formData,
  );

  return response.data.data.document;
};

export const deleteDocument = async (documentId: string): Promise<void> => {
  await api.delete(`/documents/${documentId}`);
};
