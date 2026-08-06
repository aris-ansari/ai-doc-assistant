import { DocumentModel, IDocument } from "../models/Document";

export class DocumentRepository {
  async create(documentData: Partial<IDocument>): Promise<IDocument> {
    return DocumentModel.create(documentData);
  }

  async findById(id: string): Promise<IDocument | null> {
    return DocumentModel.findById(id).exec();
  }

  async findByUserId(userId: string): Promise<IDocument[]> {
    return DocumentModel.find({ userId }).sort({ createdAt: -1 }).exec();
  }

  async update(
    id: string,
    updateData: Partial<IDocument>,
  ): Promise<IDocument | null> {
    return DocumentModel.findByIdAndUpdate(id, updateData, {
      new: true,
    }).exec();
  }

  async delete(id: string): Promise<IDocument | null> {
    return DocumentModel.findByIdAndDelete(id).exec();
  }
}

export const documentRepository = new DocumentRepository();
