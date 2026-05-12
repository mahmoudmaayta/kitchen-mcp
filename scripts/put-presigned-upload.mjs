#!/usr/bin/env node
/**
 * PUT local file bytes to a Kitchen presigned upload_url (from create_file_upload).
 * Does not use KITCHEN_API_KEY or Kitchen JSON client headers on the PUT request.
 *
 * Usage:
 *   node scripts/put-presigned-upload.mjs <filePath> <uploadUrl> <contentType>
 *   npm run put-presigned -- <filePath> <uploadUrl> <contentType>
 */

import { createReadStream } from "node:fs";
import { statSync } from "node:fs";
import { Readable } from "node:stream";

const MAX_BYTES = 5 * 1024 * 1024 * 1024; // Kitchen documented ceiling

function usage() {
  console.error(
    "Usage: node scripts/put-presigned-upload.mjs <filePath> <uploadUrl> <contentType>\n" +
      "Example: node scripts/put-presigned-upload.mjs ./report.pdf \"$UPLOAD_URL\" application/pdf"
  );
}

function normalizeBaseUrl(url) {
  return String(url).trim().replace(/\/+$/, "");
}

function looksLikeKitchenBaseUrl(uploadUrl, kitchenBase) {
  if (!kitchenBase) return false;
  const base = normalizeBaseUrl(kitchenBase);
  const u = uploadUrl.trim();
  if (!base || !u) return false;
  if (u === base) return true;
  return u.startsWith(`${base}/`) || u.startsWith(`${base}?`);
}

async function main() {
  const args = process.argv.slice(2);
  if (args.length !== 3) {
    usage();
    process.exit(1);
  }

  const [filePath, uploadUrl, contentType] = args;

  const kitchenBase = process.env.KITCHEN_BASE_URL;
  if (looksLikeKitchenBaseUrl(uploadUrl, kitchenBase)) {
    console.error(
      "Error: <uploadUrl> looks like your Kitchen workspace URL, not the presigned upload_url from create_file_upload."
    );
    process.exit(1);
  }

  let st;
  try {
    st = statSync(filePath);
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  if (!st.isFile()) {
    console.error("Error: not a regular file:", filePath);
    process.exit(1);
  }

  if (st.size > MAX_BYTES) {
    console.error(
      `Error: file size ${st.size} bytes exceeds maximum ${MAX_BYTES} bytes (Kitchen 5GB limit).`
    );
    process.exit(1);
  }

  const nodeStream = createReadStream(filePath);
  const webStream = Readable.toWeb(nodeStream);

  let response;
  try {
    response = await fetch(uploadUrl, {
      method: "PUT",
      headers: { "Content-Type": contentType },
      body: webStream,
      duplex: "half",
    });
  } catch (err) {
    console.error("Error:", err instanceof Error ? err.message : String(err));
    process.exit(1);
  }

  const text = await response.text();
  if (!response.ok) {
    console.error(`PUT failed: ${response.status} ${response.statusText}`);
    if (text) console.error(text.slice(0, 2000));
    process.exit(1);
  }

  console.log(`${response.status} ${response.statusText}`.trim());
  process.exit(0);
}

main().catch((err) => {
  console.error("Error:", err instanceof Error ? err.message : String(err));
  process.exit(1);
});
