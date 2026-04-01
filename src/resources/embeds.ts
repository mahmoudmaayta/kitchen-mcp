import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerEmbedTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_embeds",
    "List all embeds. Returns paginated results sorted by creation date (newest first).",
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
          path: "/api/embeds",
          params: { state, title, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_embed",
    "Retrieve a single embed by ID.",
    {
      id: z.string().describe("Embed ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/embeds/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_embed",
    "Create a new embed with a URL.",
    {
      title: z.string().describe("Embed title (required)"),
      url: z.string().describe("Embed URL (required)"),
      visibility: z.enum(["private", "internal", "shared"]).describe("Embed visibility (required)"),
      description: z.string().optional().describe("Embed description"),
      folder: z.string().optional().describe("Folder ID to create the embed in"),
      role: z.enum(["embed_admin", "embed_manager", "embed_viewer"]).optional().describe("Default role for team members (only for internal visibility)"),
    },
    async ({ title, url, visibility, ...fields }) => {
      try {
        const body: Record<string, unknown> = { title, url, visibility };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: "/api/embeds",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_embed",
    "Update an existing embed. Only provided fields will be changed.",
    {
      id: z.string().describe("Embed ID"),
      title: z.string().optional().describe("Embed title"),
      description: z.string().optional().describe("Embed description"),
      url: z.string().optional().describe("Embed URL"),
      visibility: z.enum(["private", "internal", "shared"]).optional().describe("Embed visibility"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/embeds/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_embed",
    "DESTRUCTIVE: Permanently delete an embed. This cannot be undone.",
    {
      id: z.string().describe("Embed ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/embeds/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Embed ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "archive_embed",
    "Move an embed to archive. Can be restored later.",
    {
      id: z.string().describe("Embed ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/embeds/${id}/archive`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "restore_embed",
    "Restore an embed from archive.",
    {
      id: z.string().describe("Embed ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/embeds/${id}/restore`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_embed",
    "Move an embed to a folder. Pass null parent to move to root level.",
    {
      id: z.string().describe("Embed ID"),
      parent: z.string().nullable().describe("Folder ID to move to, or null for root level"),
    },
    async ({ id, parent }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/embeds/${id}/move`,
          body: { parent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
