import "dotenv/config";
import { GoogleGenAI } from "@google/genai";

const apiKey = process.env.GEMINI_API_KEY;
const embeddingModel = process.env.GEMINI_EMBEDDING_MODEL || "gemini-embedding-2";
const embeddingDimensions = Number(process.env.GEMINI_EMBEDDING_DIMENSIONS || 768);
const chatModel = process.env.GEMINI_CHAT_MODEL || "gemini-3.6-flash";

if (!apiKey) {
  console.error("GEMINI_API_KEY is required");
  process.exit(1);
}

const ai = new GoogleGenAI({ apiKey });

try {
  const embeddingResponse = await ai.models.embedContent({
    model: embeddingModel,
    contents: "AI Document Workspace Gemini integration test.",
    config: { outputDimensionality: embeddingDimensions },
  });

  const embedding = embeddingResponse.embeddings?.[0]?.values;
  if (!embedding?.length) {
    throw new Error("Embedding response did not contain vector values");
  }

  console.log(`Embedding OK: ${embeddingModel} -> ${embedding.length} dimensions`);

  const chatResponse = await ai.models.generateContent({
    model: chatModel,
    contents: "Reply with exactly: Gemini integration OK",
  });

  const text = chatResponse.text?.trim();
  if (!text) {
    throw new Error("Chat response did not contain text");
  }

  console.log(`Chat OK: ${chatModel} -> ${text}`);
  console.log("Gemini integration verification passed.");
} catch (error) {
  console.error("Gemini integration verification failed:");
  console.error(error instanceof Error ? error.message : String(error));
  process.exit(1);
}
