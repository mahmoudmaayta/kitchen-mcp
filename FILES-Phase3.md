# FILES implementation — Phase 3: Attach files to a folder

**Tracks:** [TODOS.md](TODOS.md) item 4b — `POST /api/folders/{id}/files` [Add files to a folder](https://developer.kitchen.co/api/folder-files/add-files)

**Depends on:** [FILES-Phase2.md](FILES-Phase2.md) (attachments assume **completed** file records).

**Next phase:** [FILES-Phase4.md](FILES-Phase4.md) (optional)

---

## Goal

Let assistants associate one or more **existing file ids** with a folder, complementing `list_folder_files`.

## Scope

- Add MCP tool in `src/resources/folders.ts` (or a tiny dedicated module if you prefer separation—default is extend `registerFolderTools` for cohesion with `list_folder_files`).
- Request body per docs: **`files`** as an array of file id strings (confirm exact JSON shape in Kitchen docs at implementation time).
- Follow existing patterns: Zod schema (folder id + file id array), `client.request` `POST`, JSON stringify via `KitchenClient`.

## Tool naming

Pick a name consistent with existing folder tools, e.g. `add_folder_files` or `attach_files_to_folder`; prioritize clarity over brevity.

## Documentation

- Update [README.md](README.md) **Available Tools** section for Folders / Files so the new tool appears alongside `list_folder_files`, `show_file`, and the Phase 1–2 tools.

## Verification

- `npm run build` succeeds.
- Manual: `list_folder_files` before/after attach shows expected membership (pagination-aware if needed).

## Exit criteria

- End-to-end story from TODOS item 4 is satisfied at the MCP layer: **create → PUT → complete → attach → list**.

## Follow-ups (not blocking Phase 3)

- Idempotency / duplicate attach behavior: document whatever the API does; do not guess in the tool description.
