export interface TextChunk {
  text: string;
  chunkIndex: number;
}

/**
 * Splits extracted document text into overlapping chunks optimized for vector embedding generation.
 *
 * @param text - The raw text extracted from the document
 * @param chunkSize - Maximum character length per chunk (default: 1000)
 * @param overlap - Overlap character length between adjacent chunks (default: 200)
 */
export function chunkText(
  text: string,
  chunkSize: number = 1000,
  overlap: number = 200,
): TextChunk[] {
  const cleanedText = text.replace(/\s+/g, " ").trim();
  if (!cleanedText) return [];

  const chunks: TextChunk[] = [];
  let start = 0;
  let chunkIndex = 0;

  while (start < cleanedText.length) {
    const end = Math.min(start + chunkSize, cleanedText.length);
    const chunkTextContent = cleanedText.slice(start, end);

    chunks.push({
      text: chunkTextContent,
      chunkIndex,
    });

    if (end === cleanedText.length) break;
    start += chunkSize - overlap;
    chunkIndex++;
  }

  return chunks;
}
