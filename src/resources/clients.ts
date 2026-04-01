import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerClientTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_clients",
    "List all clients. Returns paginated results sorted by creation date (newest first).",
    {
      name: z.string().optional().describe("Filter by client name"),
      email: z.string().optional().describe("Filter by client email"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ name, email, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: "/api/clients",
          params: { name, email, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_client",
    "Retrieve a single client by ID.",
    {
      id: z.string().describe("Client ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/clients/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_client",
    "Create a new client user.",
    {
      email: z.string().describe("Email address of the client (required)"),
      name: z.string().describe("Name of the client (required)"),
      title: z.string().optional().describe("Job title of the client"),
      notification: z.string().optional().describe("Message to send to the client. If omitted, no notification is sent"),
    },
    async ({ email, name, title, notification }) => {
      try {
        const body: Record<string, unknown> = { email, name };
        if (title) body.title = title;
        if (notification) body.notification = notification;
        const result = await client.request({
          method: "POST",
          path: "/api/clients",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_client",
    "Update an existing client. Only provided fields will be changed.",
    {
      id: z.string().describe("Client ID"),
      name: z.string().optional().describe("Name of the client"),
      email: z.string().optional().describe("Email address"),
      title: z.string().optional().describe("Job title"),
      color: z.string().optional().describe("Color in hex"),
      language: z.string().optional().describe("ISO language code"),
      timezone: z.string().optional().describe("Valid timezone"),
      username: z.string().optional().describe("Unique username"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/clients/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_client",
    "DESTRUCTIVE: Permanently delete a client. This cannot be undone.",
    {
      id: z.string().describe("Client ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/clients/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Client ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
