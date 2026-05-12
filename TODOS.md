# MCP additions (Kitchen API gaps)

Tracked possibilities for extending this MCP against [Kitchen developer documentation](https://developer.kitchen.co/).

---

## 1. Board lists (columns / table groups)

Tasks already require a **list ID** (`create_task`); list tools let assistants discover and manage `tskl_…` IDs.

**Reference endpoints**

- `GET /api/boards/{id}/lists` — [List all lists](https://developer.kitchen.co/api/lists/list-lists)
- `POST /api/boards/{id}/lists` — [Create a list](https://developer.kitchen.co/api/lists/create-list)
- `GET /api/lists/{id}` — [Retrieve a list](https://developer.kitchen.co/api/lists/show-list)
- `PUT /api/lists/{id}` — [Update a list](https://developer.kitchen.co/api/lists/update-list)
- `DELETE /api/lists/{id}` — [Delete a list](https://developer.kitchen.co/api/lists/delete-list) (destructive; removes tasks inside the list)

**Implementation sketch:** New `src/resources/lists.ts` (or `board-lists.ts`), mirror patterns in `boards.ts` / `tasks.ts`, register in `src/index.ts`.

---

## 2. Board labels

`list_tasks` supports `labels[]` filters; label tools add create/list/update/delete for board-scoped labels.

**Reference endpoints**

- `GET /api/boards/{id}/labels` — [List all labels](https://developer.kitchen.co/api/labels/list-labels)
- `POST /api/boards/{id}/labels` — [Create a label](https://developer.kitchen.co/api/labels/create-label) (`hex_color` required per docs)
- `PUT /api/boards/{id}/labels/{id}` — [Update a label](https://developer.kitchen.co/api/labels/update-label)
- `DELETE /api/boards/{id}/labels/{id}` — [Delete a label](https://developer.kitchen.co/api/labels/delete-label)

**Implementation sketch:** New `src/resources/labels.ts`, register in `src/index.ts`.

---

## 3. Milestones

Folders expose `milestone` as a child type; tasks reference milestones; no milestone tools exist today.

**Reference endpoints**

- `GET /api/milestones` — [List all milestones](https://developer.kitchen.co/api/milestones/list-milestones)
- `POST /api/milestones` — [Create a milestone](https://developer.kitchen.co/api/milestones/create-milestone)
- `GET /api/milestones/{id}` — [Retrieve a milestone](https://developer.kitchen.co/api/milestones/show-milestone)
- `PUT /api/milestones/{id}` — [Update a milestone](https://developer.kitchen.co/api/milestones/update-milestone)
- `DELETE /api/milestones/{id}` — [Delete a milestone](https://developer.kitchen.co/api/milestones/delete-milestone)
- `POST /api/milestones/{id}/archive` — [Archive a milestone](https://developer.kitchen.co/api/milestones/archive-milestone)
- `POST /api/milestones/{id}/restore` — [Restore a milestone](https://developer.kitchen.co/api/milestones/restore-milestone)
- `POST /api/milestones/{id}/move` — [Move a milestone](https://developer.kitchen.co/api/milestones/move-milestone)

**Implementation sketch:** New `src/resources/milestones.ts`, parallel to `boards.ts` / `invoices.ts`, register in `src/index.ts`.

---

## 4. File uploads and attaching files to folders

Today only `show_file` and `delete_file` exist. Docs describe a two-step upload plus attaching completed files to a folder.

### 4a. Initiate and complete upload

- `POST /api/files` — [Create a file upload](https://developer.kitchen.co/api/files/create-file) → returns `id` and presigned `upload_url` (client must `PUT` bytes with correct `Content-Type` within validity window)
- `POST /api/files/{id}/complete` — [Complete a file upload](https://developer.kitchen.co/api/files/complete-file)

**MCP shape (minimal):** Tools such as `create_file_upload` (filename) and `complete_file_upload` (id), with clear documentation that the binary upload step happens outside MCP (or a follow-up enhancement with local path / helper).

### 4b. Attach files to a folder

- `POST /api/folders/{id}/files` — [Add files to a folder](https://developer.kitchen.co/api/folder-files/add-files) — body: `files` array of file IDs

Complements existing `list_folder_files`.

**Implementation sketch:** Extend `src/resources/files.ts` (upload + complete) and `src/resources/folders.ts` (add files), or dedicated small tools following existing `KitchenClient` usage.
