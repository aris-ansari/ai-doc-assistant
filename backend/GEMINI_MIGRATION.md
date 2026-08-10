# Gemini API Migration

The backend now uses Google's current `@google/genai` JavaScript SDK. The previous `@google/generative-ai` integration and retired Gemini models have been removed.

## Models

- Embeddings: `gemini-embedding-2`
- Embedding dimensions: `768`
- RAG chat: `gemini-3.6-flash`
- Chroma collection: `document_workspace_chunks_v2` to prevent mixing vectors from the retired embedding model with the new embedding space.

## Local setup

From the project root:

```powershell
npm install
```

If you have an existing `package-lock.json` from the previous backend dependencies, let `npm install` regenerate/update it. Do not use `npm ci` until the lockfile has been regenerated and committed.

Then verify the Gemini API directly:

```powershell
npm run verify:gemini
```

A successful run should report an embedding vector of 768 dimensions and a successful chat response.

The model names and embedding dimensions can be overridden through `.env`:

```text
GEMINI_EMBEDDING_MODEL=gemini-embedding-2
GEMINI_EMBEDDING_DIMENSIONS=768
GEMINI_CHAT_MODEL=gemini-3.6-flash
```
