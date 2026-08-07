import { z } from "zod";

export const createConversationSchema = z.object({
  title: z.string().optional(),
  documentIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID"))
    .optional(),
});

export const sendMessageSchema = z.object({
  message: z.string().min(1, "Message cannot be empty"),
  documentIds: z
    .array(z.string().regex(/^[0-9a-fA-F]{24}$/, "Invalid document ID"))
    .optional(),
});
