# FILES implementation — Phase 4 (optional): Presigned PUT helper

**Tracks:** [TODOS.md](TODOS.md) item 4a follow-up — “binary upload step happens outside MCP **(or a follow-up enhancement with local path / helper)**”

**Depends on:** [FILES-Phase1.md](FILES-Phase1.md) and [FILES-Phase2.md](FILES-Phase2.md) stable and documented.

---

## Goal

Reduce operator friction for the **HTTP PUT to `upload_url`** step without blurring security boundaries.

## Options (pick one or defer)

1. **Small Node script** in `scripts/` (e.g. `put-presigned-upload.mjs`)  
   - Inputs: path to file, `upload_url`, `Content-Type`.  
   - Uses `fetch` PUT with **only** headers required by the presigned URL (no `Authorization: Bearer` from Kitchen).  
   - Prints exit code and response status for CI-style use.

2. **`KitchenClient` extension**  
   - New method e.g. `putPresignedUpload({ url, contentType, body: Buffer | Uint8Array })` that does **not** go through the JSON `request()` helper (avoid forcing `Content-Type: application/json` or Kitchen auth on the presigned host).  
   - Keeps MCP tools unchanged; optional fifth tool only if you explicitly want “upload from path” inside MCP (usually discouraged: paths are host-specific and security-sensitive).

3. **Defer**  
   - Rely on README + curl example only; no new code.

## Security and correctness

- **Never** send `KITCHEN_API_KEY` to the presigned URL unless Kitchen docs explicitly require it (presigned S3-style URLs typically forbid extra auth).
- Validate **file size** and MIME expectations against product limits if documented; avoid reading arbitrary huge files into memory without streaming if large uploads matter.

## Verification

- If code is added: `npm run build`; script runs against a test file in a dev workspace.
- Document usage in README under a short “File uploads” subsection linking to Phases 1–3.

## Exit criteria

- Optional phase: complete only if the team wants first-class local upload support; otherwise close as “won’t do” and keep Phases 1–3 as the supported path.
