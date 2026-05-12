# Kitchen MCP

An MCP (Model Context Protocol) server for the [Kitchen.co](https://kitchen.co) CRM API. Enables AI assistants to manage clients, companies, conversations, tasks, invoices, and boards through standardized MCP tools.

## Prerequisites

- Node.js 18+
- A Kitchen.co workspace with an API key

## Setup

```bash
npm install
npm run build
```

## Configuration

1. Copy the example environment file:

```bash
cp .env.example .env
```

2. Edit `.env` with your credentials:

| Variable           | Description                                                              |
| ------------------ | ------------------------------------------------------------------------ |
| `KITCHEN_BASE_URL` | Your Kitchen.co workspace URL (e.g., `https://yourworkspace.kitchen.co`) |
| `KITCHEN_API_KEY`  | Your Kitchen.co API key (generated from workspace developer settings)    |

> The `.env` file is gitignored to keep your credentials safe.

## File uploads

Kitchen file uploads are a **three-step** flow: start the upload on the API, **PUT bytes** to the presigned `upload_url`, then finalize on the API.

1. Use MCP **`create_file_upload`** with a `filename` — response includes `id` and **`upload_url`** (presigned; valid about **5 minutes** per [Kitchen create file](https://developer.kitchen.co/api/files/create-file)).
2. **PUT the file bytes** to `upload_url` with the real **`Content-Type`** for that file. Do **not** send your Kitchen `Authorization` header on this request. From this repo you can run:

   ```bash
   node scripts/put-presigned-upload.mjs ./path/to/file.pdf "$UPLOAD_URL" application/pdf
   ```

   Or:

   ```bash
   npm run put-presigned -- ./path/to/file.pdf "$UPLOAD_URL" application/pdf
   ```

   The script streams from disk (no `KITCHEN_API_KEY` on the PUT), enforces Kitchen’s **5GB** size ceiling, and exits non-zero if the PUT fails. If `KITCHEN_BASE_URL` is set, the script refuses an `upload_url` that looks like your workspace URL (to catch copy-paste mistakes). If the PUT returns **403**, your URL may require extra headers (for example values implied by `X-Amz-SignedHeaders` in the query string); see Kitchen docs or use `curl` with the exact headers your presigner expects.

3. Use MCP **`complete_file_upload`** with the file **`id`**, then optionally **`add_folder_files`** or other Kitchen APIs to attach the finalized file.

Repo phase notes: [FILES-Phase1.md](FILES-Phase1.md), [FILES-Phase2.md](FILES-Phase2.md), [FILES-Phase3.md](FILES-Phase3.md).

## Usage

### With Claude Desktop

Add to your `claude_desktop_config.json`:

```json
{
	"mcpServers": {
		"kitchen-crm": {
			"command": "node",
			"args": ["/path/to/kitchen-mcp/dist/index.js"],
			"env": {
				"KITCHEN_BASE_URL": "https://yourworkspace.kitchen.co",
				"KITCHEN_API_KEY": "your-api-key"
			}
		}
	}
}
```

> When using Claude Desktop, the env vars in the config above take priority. The `.env` file is used as a fallback.

### Standalone

```bash
npm start
```

The server reads credentials from your `.env` file automatically.

## Available Tools

### Clients

`list_clients` `show_client` `create_client` `update_client` `delete_client`

### Companies

`list_companies` `show_company` `create_company` `update_company` `delete_company`

### Conversations

`list_conversations` `show_conversation` `create_conversation` `update_conversation` `delete_conversation` `archive_conversation` `restore_conversation` `move_conversation`

### Messages

`list_messages` `show_message` `create_message` `update_message` `delete_message`

### Conversation Notes

`list_conversation_notes` `show_conversation_note` `create_conversation_note` `update_conversation_note` `delete_conversation_note`

### Tasks

`list_tasks` `show_task` `create_task` `update_task` `delete_task` `move_task` `toggle_task_completion`

### Subtasks

`list_subtasks` `show_subtask` `create_subtask` `update_subtask` `delete_subtask`

### Task Comments

`list_task_comments` `show_task_comment` `create_task_comment` `update_task_comment` `delete_task_comment`

### Invoices

`list_invoices` `show_invoice` `create_invoice` `update_invoice` `delete_invoice` `archive_invoice` `restore_invoice` `move_invoice`

### Boards

`list_boards` `show_board` `create_board` `update_board` `delete_board` `archive_board` `restore_board` `move_board`

### Board lists

`list_board_lists` `create_board_list` `show_list` `update_list` `delete_list`

### Board labels

`list_board_labels` `create_board_label` `update_board_label` `delete_board_label`

### Folders

`list_folders` `show_folder` `create_folder` `update_folder` `delete_folder` `archive_folder` `restore_folder` `move_folder` `list_folder_children` `list_folder_files` `add_folder_files`

### Docs

`list_docs` `show_doc` `create_doc` `update_doc` `delete_doc` `archive_doc` `restore_doc` `move_doc`

### Files

`show_file` `create_file_upload` `complete_file_upload` `delete_file` `add_folder_files`

### Embeds

`list_embeds` `show_embed` `create_embed` `update_embed` `delete_embed` `archive_embed` `restore_embed` `move_embed`

### Webhooks

`list_webhooks` `show_webhook` `create_webhook` `update_webhook` `delete_webhook`

## Development

```bash
npm run dev      # Run with auto-restart on file changes
npm run build    # Compile TypeScript
npm start        # Run the compiled server (production)
```

### API Reference

Check the [Kitchen.co Developer Docs](https://developer.kitchen.co/) for the full API reference.

### Testing with Claude Desktop

After setup, try asking Claude:

- "List all my clients"
- "Show my boards"
- "List invoices"

### Adding More Resources

1. Drop a new file in `src/resources/`
2. Register it in `src/index.ts`
3. Run `npm run build` from the project root

## License

ISC
