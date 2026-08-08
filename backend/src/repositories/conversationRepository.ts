import {
  ConversationModel,
  IConversation,
  IMessage,
} from "../models/Conversation.js";

export class ConversationRepository {
  async create(data: {
    userId: string;
    title?: string;
    documentIds?: string[];
  }): Promise<IConversation> {
    return ConversationModel.create(data);
  }

  async findByUserId(userId: string): Promise<IConversation[]> {
    return ConversationModel.find({ userId }).sort({ updatedAt: -1 }).exec();
  }

  async findByIdAndUser(
    id: string,
    userId: string,
  ): Promise<IConversation | null> {
    return ConversationModel.findOne({ _id: id, userId }).exec();
  }

  async addMessage(
    conversationId: string,
    message: IMessage,
  ): Promise<IConversation | null> {
    return ConversationModel.findByIdAndUpdate(
      conversationId,
      { $push: { messages: message } },
      { new: true },
    ).exec();
  }

  async updateTitle(
    conversationId: string,
    title: string,
  ): Promise<IConversation | null> {
    return ConversationModel.findByIdAndUpdate(
      conversationId,
      { title },
      { new: true },
    ).exec();
  }

  async delete(id: string, userId: string): Promise<IConversation | null> {
    return ConversationModel.findOneAndDelete({ _id: id, userId }).exec();
  }
}

export const conversationRepository = new ConversationRepository();
