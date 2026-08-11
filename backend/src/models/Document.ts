import { Schema, model, Types, Document as MongooseDocument } from "mongoose";

export interface IDocument extends MongooseDocument {
  userId: Types.ObjectId;
  title: string;
  originalName: string;
  mimeType: string;
  size: number;
  filePath: string;
  content?: string; // Extracted text after parsing
  status: "pending" | "processing" | "completed" | "failed";
  errorMessage?: string;
  createdAt: Date;
  updatedAt: Date;
}

const documentSchema = new Schema<IDocument>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true, // Indexed for faster queries when fetching a user's documents
    },
    title: {
      type: String,
      required: true,
      trim: true,
    },
    originalName: {
      type: String,
      required: true,
    },
    mimeType: {
      type: String,
      required: true,
    },
    size: {
      type: Number,
      required: true,
    },
    filePath: {
      type: String,
      required: true,
    },
    content: {
      type: String,
    },
    status: {
      type: String,
      enum: ["pending", "processing", "completed", "failed"],
      default: "pending",
    },
    errorMessage: {
      type: String,
    },
  },
  {
    timestamps: true,
  },
);

export const DocumentModel = model<IDocument>("Document", documentSchema);
