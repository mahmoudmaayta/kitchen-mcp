import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerConversationTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_conversations",
    "List all conversations. Returns paginated results sorted by creation date (newest first).",
    {
      state: z.enum(["all", "active", "archived"]).optional().describe("Filter by state (default: active)"),
      title: z.string().optional().describe("Search by title"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ state, title, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: "/api/conversations",
          params: { state, title, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_conversation",
    "Retrieve a single conversation by ID.",
    {
      id: z.string().describe("Conversation ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/conversations/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_conversation",
    "Create a new conversation. Can optionally be created in a folder with an initial message.",
    {
      title: z.string().describe("Title of the conversation (required)"),
      description: z.string().optional().describe("Description of the conversation"),
      visibility: z.enum(["private", "internal", "shared"]).describe("Visibility of the conversation (required)"),
      role: z.enum(["conversation_admin", "conversation_manager", "conversation_commenter", "conversation_viewer"]).optional().describe("Default role for team members (only for internal visibility)"),
      folder: z.string().optional().describe("Folder ID to create the conversation in"),
    },
    async ({ title, visibility, ...fields }) => {
      try {
        const body: Record<string, unknown> = { title, visibility };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: "/api/conversations",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_conversation",
    "Update an existing conversation. Only provided fields will be changed.",
    {
      id: z.string().describe("Conversation ID"),
      title: z.string().optional().describe("Title"),
      description: z.string().optional().describe("Description"),
      visibility: z.enum(["private", "internal", "shared"]).optional().describe("Visibility"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/conversations/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_conversation",
    "DESTRUCTIVE: Permanently delete a conversation. This cannot be undone.",
    {
      id: z.string().describe("Conversation ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/conversations/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Conversation ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "archive_conversation",
    "Move a conversation to archive. Can be restored later.",
    {
      id: z.string().describe("Conversation ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/conversations/${id}/archive`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "restore_conversation",
    "Restore a conversation from archive.",
    {
      id: z.string().describe("Conversation ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/conversations/${id}/restore`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_conversation",
    "Move a conversation to a folder. Pass null parent to move to root level.",
    {
      id: z.string().describe("Conversation ID"),
      parent: z.string().nullable().describe("Folder ID to move to, or null for root level"),
    },
    async ({ id, parent }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/conversations/${id}/move`,
          body: { parent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
