# FILES implementation — Phase 2: Complete upload (`complete_file_upload`)

**Tracks:** [TODOS.md](TODOS.md) item 4a (second step) — `POST /api/files/{id}/complete` [Complete a file upload](https://developer.kitchen.co/api/files/complete-file)

**Depends on:** [FILES-Phase1.md](FILES-Phase1.md) (a completed PUT to `upload_url` is a logical prerequisite in real usage).

**Next phase:** [FILES-Phase3.md](FILES-Phase3.md)

---

## Goal

Close the upload lifecycle on Kitchen’s side after bytes have been written to the presigned URL.

## Scope

- Add MCP tool (name suggestion: `complete_file_upload`) accepting the **file id** from Phase 1 (and any other documented body/query params).
- `POST` to `/api/files/{id}/complete` via existing `KitchenClient.request`.
- Tool description should document the **intended order**:
  1. `create_file_upload`
  2. HTTP **PUT** to `upload_url` with correct body and headers (operator or external script—see Phase 4 for optional in-repo helper)
  3. `complete_file_upload`

## Operator documentation (minimum)

In the tool description or README subsection (whichever you touch in this phase—prefer tool strings first to keep scope small):

- Presigned URLs typically **expire**; completing after expiry should be called out as a likely failure.
- Wrong **`Content-Type`** or incomplete PUT commonly surfaces as errors at complete time; point readers to Kitchen docs for specifics.

## Out of scope for Phase 2

- Attaching files to folders (Phase 3).
- Implementing the presigned PUT inside this repository (optional Phase 4).

## Verification

- `npm run build` succeeds.
- Manual smoke: full flow create → PUT (curl or script) → complete; then `show_file` returns sensible metadata.

## Exit criteria

- Upload lifecycle is representable as two MCP tools plus one external PUT, with documentation that prevents “create then attach without complete” confusion where possible.
