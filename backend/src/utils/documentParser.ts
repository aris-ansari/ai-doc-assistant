import fs from "fs/promises";
import pdfParse from "pdf-parse";
import mammoth from "mammoth";
import { AppError } from "./AppError.js";

/**
 * Parses and extracts plain text from supported document types (PDF, DOCX, TXT).
 */
export async function parseDocumentText(
  filePath: string,
  mimeType: string,
): Promise<string> {
  try {
    if (mimeType === "application/pdf") {
      const dataBuffer = await fs.readFile(filePath);
      const data = await pdfParse(dataBuffer);
      return data.text;
    }

    if (
      mimeType ===
      "application/vnd.openxmlformats-officedocument.wordprocessingml.document"
    ) {
      const result = await mammoth.extractRawText({ path: filePath });
      return result.value;
    }

    if (mimeType === "text/plain") {
      const text = await fs.readFile(filePath, "utf-8");
      return text;
    }

    throw new AppError(`Unsupported document MIME type: ${mimeType}`, 400);
  } catch (error: unknown) {
    if (error instanceof AppError) throw error;
    throw new AppError(
      `Failed to parse file text: ${error instanceof Error ? error.message : String(error)}`,
      500,
    );
  }
}
