import { Schema, model, Document as MongooseDocument } from "mongoose";

export interface ISourceCitation {
  documentId: string;
  chunkIndex: number;
  snippet: string;
}

export interface IMessage {
  _id?: Schema.Types.ObjectId;
  sender: "user" | "assistant";
  content: string;
  sources?: ISourceCitation[];
  createdAt?: Date;
}

export interface IConversation extends MongooseDocument {
  userId: Schema.Types.ObjectId;
  title: string;
  documentIds: Schema.Types.ObjectId[];
  messages: IMessage[];
  createdAt: Date;
  updatedAt: Date;
}

const sourceCitationSchema = new Schema<ISourceCitation>(
  {
    documentId: { type: String, required: true },
    chunkIndex: { type: Number, required: true },
    snippet: { type: String, required: true },
  },
  { _id: false },
);

const messageSchema = new Schema<IMessage>(
  {
    sender: {
      type: String,
      enum: ["user", "assistant"],
      required: true,
    },
    content: {
      type: String,
      required: true,
    },
    sources: [sourceCitationSchema],
  },
  {
    timestamps: { createdAt: true, updatedAt: false },
  },
);

const conversationSchema = new Schema<IConversation>(
  {
    userId: {
      type: Schema.Types.ObjectId,
      ref: "User",
      required: true,
      index: true,
    },
    title: {
      type: String,
      default: "New Chat",
      trim: true,
    },
    documentIds: [
      {
        type: Schema.Types.ObjectId,
        ref: "Document",
      },
    ],
    messages: [messageSchema],
  },
  {
    timestamps: true,
  },
);

export const ConversationModel = model<IConversation>(
  "Conversation",
  conversationSchema,
);
