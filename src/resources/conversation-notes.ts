import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerConversationNoteTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_conversation_notes",
    "List all private notes in a conversation. Notes are only visible to team members, not clients.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      content: z.string().optional().describe("Search by content"),
      expand: z.array(z.string()).optional().describe("Expand relationships: author, attachments, conversation"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ conversation_id, content, expand, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/conversations/${conversation_id}/notes`,
          params: { content, expand, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_conversation_note",
    "Retrieve a single note by ID.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      note_id: z.string().describe("Note ID"),
      expand: z.array(z.string()).optional().describe("Expand relationships: author, attachments, conversation"),
    },
    async ({ conversation_id, note_id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/conversations/${conversation_id}/notes/${note_id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_conversation_note",
    "Create a private note in a conversation. Notes are only visible to team members.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      content: z.string().describe("Content of the note (required)"),
      format: z.enum(["text", "html"]).describe("Note format: text or html (required)"),
    },
    async ({ conversation_id, content: noteContent, format }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/conversations/${conversation_id}/notes`,
          body: { content: noteContent, format },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_conversation_note",
    "Update a note's content.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      note_id: z.string().describe("Note ID"),
      content: z.string().describe("Updated note content (required)"),
    },
    async ({ conversation_id, note_id, content: noteContent }) => {
      try {
        const result = await client.request({
          method: "PUT",
          path: `/api/conversations/${conversation_id}/notes/${note_id}`,
          body: { content: noteContent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_conversation_note",
    "DESTRUCTIVE: Permanently delete a note. This cannot be undone.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      note_id: z.string().describe("Note ID"),
    },
    async ({ conversation_id, note_id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/conversations/${conversation_id}/notes/${note_id}`,
        });
        return { content: [{ type: "text" as const, text: `Note ${note_id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
