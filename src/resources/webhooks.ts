import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerWebhookTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_webhooks",
    "List all webhooks. Returns paginated results sorted by creation date (newest first).",
    {
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: "/api/webhooks",
          params: { page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_webhook",
    "Retrieve a single webhook by ID.",
    {
      id: z.string().describe("Webhook ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/webhooks/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_webhook",
    "Create a new webhook to receive real-time event notifications.",
    {
      url: z.string().describe("Webhook endpoint URL (required)"),
      events: z.array(z.string()).optional().describe("Event types to listen for (e.g., invoice.created, task.updated, board.deleted)"),
    },
    async ({ url, events }) => {
      try {
        const body: Record<string, unknown> = { url };
        if (events) body.events = events;
        const result = await client.request({
          method: "POST",
          path: "/api/webhooks",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_webhook",
    "Update an existing webhook. Only provided fields will be changed.",
    {
      id: z.string().describe("Webhook ID"),
      url: z.string().optional().describe("Webhook endpoint URL"),
      events: z.array(z.string()).optional().describe("Event types to listen for"),
      enabled: z.boolean().optional().describe("Whether the webhook is enabled or disabled"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/webhooks/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_webhook",
    "DESTRUCTIVE: Permanently delete a webhook. This cannot be undone.",
    {
      id: z.string().describe("Webhook ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/webhooks/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Webhook ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
