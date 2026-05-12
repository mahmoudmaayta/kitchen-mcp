# FILES implementation — Phase 1: Initiate upload (`create_file_upload`)

**Tracks:** [TODOS.md](TODOS.md) item 4a (first step) — `POST /api/files` [Create a file upload](https://developer.kitchen.co/api/files/create-file)

**Depends on:** Nothing (extends existing `registerFileTools` in `src/resources/files.ts`).

**Next phase:** [FILES-Phase2.md](FILES-Phase2.md)

---

## Goal

Expose Kitchen’s upload initiation so assistants obtain a **file id** and **presigned `upload_url`**, without handling raw bytes inside MCP yet.

## Scope

- Add one MCP tool (name suggestion: `create_file_upload`) that calls `POST /api/files` with the JSON body required by the current Kitchen API docs.
- Return the API response as JSON (same pattern as `show_file` / other tools).
- Tool description must state clearly:
  - The assistant or user must **PUT file bytes** to `upload_url` **outside** this tool (and typically **without** the Kitchen `Authorization` header—presigned URLs are usually standalone).
  - The client must use the **`Content-Type`** (and any other constraints) the API expects for that upload; align wording with official docs after implementation.
  - After a successful PUT, **`complete_file_upload`** (Phase 2) is required before the file is usable.

## Out of scope for Phase 1

- `POST /api/files/{id}/complete`
- `POST /api/folders/{id}/files`
- Any change to `KitchenClient` beyond what existing `request()` already supports (JSON `POST` is sufficient).

## Implementation notes

- Implement in `src/resources/files.ts` next to `show_file` / `delete_file`.
- Mirror Zod + `try/catch` + `formatError` patterns from that file.
- Confirm request field names against live docs (e.g. filename vs `name`); treat docs as source of truth.

## Verification

- `npm run build` succeeds.
- Manual smoke: call tool with a test filename; response includes `id` and `upload_url` (or whatever fields the API returns).

## Exit criteria

- Tool registered and discoverable; description documents the two-step flow and that binary upload is not performed by this MCP call.
