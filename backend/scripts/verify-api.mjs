import fs from "node:fs/promises";
import path from "node:path";
import process from "node:process";

const baseUrl = (process.env.API_URL ?? "http://localhost:5000").replace(
  /\/$/,
  "",
);
const samplePdf = path.resolve("test/data/05-versions-space.pdf");
const email = `verify-${Date.now()}@example.com`;
let cookie = "";
let documentId;
let conversationId;

function assert(condition, message) {
  if (!condition) throw new Error(message);
}

async function request(method, route, options = {}) {
  const headers = new Headers(options.headers ?? {});
  if (cookie) headers.set("Cookie", cookie);

  const response = await fetch(`${baseUrl}${route}`, {
    ...options,
    method,
    headers,
  });

  const setCookie = response.headers.get("set-cookie");
  if (setCookie) {
    cookie = setCookie
      .split(/,(?=[^;]+=[^;]+)/)
      .map((value) => value.split(";", 1)[0])
      .join("; ");
  }

  let body = null;
  const contentType = response.headers.get("content-type") ?? "";
  if (contentType.includes("application/json")) body = await response.json();
  else await response.text();

  return { response, body };
}

async function expectStatus(label, method, route, expected, options) {
  const result = await request(method, route, options);
  assert(
    result.response.status === expected,
    `${label}: expected ${expected}, got ${result.response.status}: ${JSON.stringify(result.body)}`,
  );
  console.log(`✓ ${label}`);
  return result;
}

try {
  await expectStatus("health check", "GET", "/health", 200);

  await expectStatus(
    "protected route rejects unauthenticated request",
    "GET",
    "/api/v1/auth/me",
    401,
  );

  await expectStatus(
    "registration validation",
    "POST",
    "/api/v1/auth/register",
    400,
    {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "x",
        email: "not-an-email",
        password: "short",
      }),
    },
  );

  const registered = await expectStatus(
    "registration",
    "POST",
    "/api/v1/auth/register",
    201,
    {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        name: "API Verification",
        email,
        password: "StrongPass123!",
      }),
    },
  );
  assert(
    registered.body?.success === true,
    "registration response was not successful",
  );

  await expectStatus("current user", "GET", "/api/v1/auth/me", 200);

  const pdf = await fs.readFile(samplePdf);
  const form = new FormData();
  form.append("title", "API Verification PDF");
  form.append(
    "file",
    new Blob([pdf], { type: "application/pdf" }),
    "05-versions-space.pdf",
  );

  const uploaded = await expectStatus(
    "document upload",
    "POST",
    "/api/v1/documents/upload",
    201,
    {
      body: form,
    },
  );
  documentId = uploaded.body?.data?.document?._id;
  assert(documentId, "upload response did not contain document id");

  for (let attempt = 1; attempt <= 40; attempt += 1) {
    const status = await request("GET", `/api/v1/documents/${documentId}`);
    assert(
      status.response.status === 200,
      `document status request failed: ${status.response.status}`,
    );
    const document = status.body?.data?.document;
    if (document?.status === "completed") {
      console.log("✓ document processing completed");
      break;
    }
    if (document?.status === "failed") {
      throw new Error(
        `document processing failed: ${document.errorMessage ?? "unknown error"}`,
      );
    }
    if (attempt === 40)
      throw new Error("document processing did not complete within 60 seconds");
    await new Promise((resolve) => setTimeout(resolve, 1500));
  }

  const conversation = await expectStatus(
    "conversation creation",
    "POST",
    "/api/v1/chat",
    201,
    {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        title: "API Verification Chat",
        documentIds: [documentId],
      }),
    },
  );
  conversationId = conversation.body?.data?.conversation?._id;
  assert(
    conversationId,
    "conversation response did not contain conversation id",
  );

  const message = await expectStatus(
    "RAG message",
    "POST",
    `/api/v1/chat/${conversationId}/messages`,
    200,
    {
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        message: "What is the main subject of this document?",
        documentIds: [documentId],
      }),
    },
  );
  assert(
    message.body?.data?.assistantMessage?.content,
    "RAG response did not contain assistant content",
  );
  assert(
    Array.isArray(message.body?.data?.assistantMessage?.sources),
    "RAG response did not contain sources array",
  );

  await expectStatus(
    "conversation deletion",
    "DELETE",
    `/api/v1/chat/${conversationId}`,
    200,
  );
  conversationId = undefined;
  await expectStatus(
    "document deletion",
    "DELETE",
    `/api/v1/documents/${documentId}`,
    200,
  );
  documentId = undefined;

  await expectStatus("logout", "POST", "/api/v1/auth/logout", 200);
  console.log("\nAPI verification passed.");
} catch (error) {
  console.error(
    `\nAPI verification failed: ${error instanceof Error ? error.message : String(error)}`,
  );
  process.exitCode = 1;
}
