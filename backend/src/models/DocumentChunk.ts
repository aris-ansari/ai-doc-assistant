import mongoose, { Schema, type Document } from "mongoose";

export interface IDocumentChunk extends Document {
  chunkId: string;
  documentId: string;
  userId: string;
  chunkIndex: number;
  text: string;
  embedding: number[];
  createdAt: Date;
  updatedAt: Date;
}

const documentChunkSchema = new Schema<IDocumentChunk>(
  {
    chunkId: {
      type: String,
      required: true,
      unique: true,
      index: true,
    },
    documentId: {
      type: String,
      required: true,
      index: true,
    },
    userId: {
      type: String,
      required: true,
      index: true,
    },
    chunkIndex: {
      type: Number,
      required: true,
    },
    text: {
      type: String,
      required: true,
    },
    embedding: {
      type: [Number],
      required: true,
      validate: {
        validator: (value: number[]) => value.length === 768,
        message: "Embedding must contain exactly 768 dimensions",
      },
    },
  },
  {
    collection: "document_chunks",
    timestamps: true,
  },
);

export const DocumentChunk = mongoose.model<IDocumentChunk>(
  "DocumentChunk",
  documentChunkSchema,
);
