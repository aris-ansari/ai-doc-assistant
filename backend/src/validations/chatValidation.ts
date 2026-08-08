import { z } from "zod";

const documentIdsSchema = z
  .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID"))
  .refine((ids) => new Set(ids).size === ids.length, "Duplicate document IDs are not allowed")
  .optional();

export const createConversationSchema = z.object({
  body: z.object({
    title: z.string().trim().max(200, "Title cannot exceed 200 characters").optional(),
    documentIds: documentIdsSchema,
  }),
});

export const sendMessageSchema = z.object({
  body: z.object({
    message: z.string().trim().min(1, "Message cannot be empty"),
    documentIds: documentIdsSchema,
  }),
  params: z.object({
    id: z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid conversation ID"),
  }),
});
