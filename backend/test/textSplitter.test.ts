import test from "node:test";
import assert from "node:assert/strict";
import { chunkText } from "../src/utils/textSplitter.js";

test("chunkText returns no chunks for empty or whitespace-only input", () => {
  assert.deepEqual(chunkText(""), []);
  assert.deepEqual(chunkText("   \n\t  "), []);
});

test("chunkText normalizes whitespace and assigns sequential indexes", () => {
  const chunks = chunkText("Hello   world\nthis\tis text", 10, 2);

  assert.ok(chunks.length > 0);
  assert.deepEqual(
    chunks.map((chunk) => chunk.chunkIndex),
    chunks.map((_, index) => index),
  );
  assert.equal(chunks[0]?.text, "Hello worl");
  assert.ok(chunks.every((chunk) => chunk.text.length <= 10));
});

test("chunkText creates overlapping chunks", () => {
  const chunks = chunkText("abcdefghijklmnopqrstuvwxyz", 10, 3);

  assert.equal(chunks.length, 4);
  assert.equal(chunks[0]?.text, "abcdefghij");
  assert.equal(chunks[1]?.text, "hijklmnopq");
  assert.equal(chunks[2]?.text, "opqrstuvwx");
  assert.equal(chunks[3]?.text, "vwxyz");
});

test("chunkText preserves the complete cleaned text across chunks", () => {
  const input = "one two three four five six seven";
  const chunks = chunkText(input, 12, 3);

  assert.ok(chunks.length > 1);
  assert.equal(chunks[0]?.chunkIndex, 0);
  assert.equal(chunks.at(-1)?.chunkIndex, chunks.length - 1);

  for (const chunk of chunks) {
    assert.ok(chunk.text.length > 0);
    assert.ok(chunk.text.length <= 12);
  }
});
