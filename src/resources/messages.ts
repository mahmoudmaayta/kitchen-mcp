import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerMessageTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_messages",
    "List all messages in a conversation. Returns paginated results sorted by creation date (newest first).",
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
          path: `/api/conversations/${conversation_id}/messages`,
          params: { content, expand, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_message",
    "Retrieve a single message by ID.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      message_id: z.string().describe("Message ID"),
      expand: z.array(z.string()).optional().describe("Expand relationships: author, attachments, conversation"),
    },
    async ({ conversation_id, message_id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/conversations/${conversation_id}/messages/${message_id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_message",
    "Create and send a message in a conversation.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      content: z.string().describe("Content of the message (required)"),
      format: z.enum(["text", "html"]).describe("Message format: text or html (required)"),
      send_at: z.string().optional().describe("Schedule send time. Leave blank to send immediately"),
    },
    async ({ conversation_id, content: msgContent, format, send_at }) => {
      try {
        const body: Record<string, unknown> = { content: msgContent, format };
        if (send_at) body.send_at = send_at;
        const result = await client.request({
          method: "POST",
          path: `/api/conversations/${conversation_id}/messages`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_message",
    "Update an existing message. Only provided fields will be changed.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      message_id: z.string().describe("Message ID"),
      content: z.string().optional().describe("Updated message content"),
      send_at: z.string().optional().describe("Updated scheduled send time"),
    },
    async ({ conversation_id, message_id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/conversations/${conversation_id}/messages/${message_id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_message",
    "DESTRUCTIVE: Permanently delete a message. This cannot be undone.",
    {
      conversation_id: z.string().describe("Conversation ID"),
      message_id: z.string().describe("Message ID"),
    },
    async ({ conversation_id, message_id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/conversations/${conversation_id}/messages/${message_id}`,
        });
        return { content: [{ type: "text" as const, text: `Message ${message_id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
