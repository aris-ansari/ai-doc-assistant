import test from "node:test";
import assert from "node:assert/strict";
import { mkdtemp, rm, writeFile } from "node:fs/promises";
import os from "node:os";
import path from "node:path";
import { parseDocumentText } from "../src/utils/documentParser.js";
import { AppError } from "../src/utils/AppError.js";

test("parseDocumentText extracts plain text files", async () => {
  const tempDir = await mkdtemp(path.join(os.tmpdir(), "docs-assistant-"));
  const filePath = path.join(tempDir, "sample.txt");

  try {
    await writeFile(filePath, "Hello document assistant.");

    const text = await parseDocumentText(filePath, "text/plain");

    assert.equal(text, "Hello document assistant.");
  } finally {
    await rm(tempDir, { recursive: true, force: true });
  }
});

test("parseDocumentText rejects unsupported MIME types", async () => {
  await assert.rejects(
    () => parseDocumentText("does-not-exist.xyz", "application/octet-stream"),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 400 &&
      error.message ===
        "Unsupported document MIME type: application/octet-stream",
  );
});

test("parseDocumentText reports file read failures as AppError", async () => {
  await assert.rejects(
    () => parseDocumentText("/definitely/missing/file.txt", "text/plain"),
    (error: unknown) =>
      error instanceof AppError &&
      error.statusCode === 500 &&
      error.message.startsWith("Failed to parse file text:"),
  );
});
