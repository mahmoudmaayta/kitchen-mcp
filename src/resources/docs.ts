import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerDocTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_docs",
    "List all docs. Returns paginated results sorted by creation date (newest first).",
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
          path: "/api/docs",
          params: { state, title, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_doc",
    "Retrieve a single doc by ID.",
    {
      id: z.string().describe("Doc ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/docs/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_doc",
    "Create a new doc.",
    {
      visibility: z.enum(["private", "internal", "shared"]).describe("Doc visibility (required)"),
      title: z.string().optional().describe("Doc title"),
      description: z.string().optional().describe("Doc description"),
      folder: z.string().optional().describe("Folder ID to create the doc in"),
      role: z.enum(["document_admin", "document_manager", "document_editor", "document_viewer"]).optional().describe("Default role for team members (only for internal visibility)"),
    },
    async ({ visibility, ...fields }) => {
      try {
        const body: Record<string, unknown> = { visibility };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: "/api/docs",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_doc",
    "Update an existing doc. Only provided fields will be changed.",
    {
      id: z.string().describe("Doc ID"),
      title: z.string().optional().describe("Doc title"),
      description: z.string().optional().describe("Doc description"),
      visibility: z.enum(["private", "internal", "shared"]).optional().describe("Doc visibility"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/docs/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_doc",
    "DESTRUCTIVE: Permanently delete a doc. This cannot be undone.",
    {
      id: z.string().describe("Doc ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/docs/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Doc ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "archive_doc",
    "Move a doc to archive. Can be restored later.",
    {
      id: z.string().describe("Doc ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/docs/${id}/archive`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "restore_doc",
    "Restore a doc from archive.",
    {
      id: z.string().describe("Doc ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/docs/${id}/restore`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_doc",
    "Move a doc to a folder. Pass null parent to move to root level.",
    {
      id: z.string().describe("Doc ID"),
      parent: z.string().nullable().describe("Folder ID to move to, or null for root level"),
    },
    async ({ id, parent }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/docs/${id}/move`,
          body: { parent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
