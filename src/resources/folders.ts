import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerFolderTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_folders",
    "List all folders. Returns paginated results sorted by creation date (newest first).",
    {
      state: z.enum(["all", "active", "archived"]).optional().describe("Filter by state (default: active)"),
      name: z.string().optional().describe("Search by folder name"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ state, name, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: "/api/folders",
          params: { state, name, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_folder",
    "Retrieve a single folder by ID.",
    {
      id: z.string().describe("Folder ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/folders/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_folder",
    "Create a new folder to organize resources like conversations, boards, invoices, and docs.",
    {
      name: z.string().describe("Folder name (required)"),
      visibility: z.enum(["private", "internal", "shared"]).describe("Folder visibility (required)"),
      description: z.string().optional().describe("Folder description"),
      folder: z.string().optional().describe("Parent folder ID to create this folder in"),
      role: z.enum(["folder_admin", "folder_manager", "folder_viewer"]).optional().describe("Default role for team members (only for internal visibility)"),
    },
    async ({ name, visibility, ...fields }) => {
      try {
        const body: Record<string, unknown> = { name, visibility };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: "/api/folders",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_folder",
    "Update an existing folder. Only provided fields will be changed.",
    {
      id: z.string().describe("Folder ID"),
      name: z.string().optional().describe("Folder name"),
      description: z.string().optional().describe("Folder description"),
      visibility: z.enum(["private", "internal", "shared"]).optional().describe("Folder visibility"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/folders/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_folder",
    "DESTRUCTIVE: Permanently delete a folder. This cannot be undone.",
    {
      id: z.string().describe("Folder ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/folders/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Folder ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "archive_folder",
    "Move a folder to archive. All items in the folder will be archived too. Can be restored later.",
    {
      id: z.string().describe("Folder ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/folders/${id}/archive`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "restore_folder",
    "Restore a folder from archive.",
    {
      id: z.string().describe("Folder ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/folders/${id}/restore`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_folder",
    "Move a folder to a parent folder. Pass null parent to move to root level.",
    {
      id: z.string().describe("Folder ID"),
      parent: z.string().nullable().describe("Parent folder ID to move to, or null for root level"),
    },
    async ({ id, parent }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/folders/${id}/move`,
          body: { parent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "list_folder_children",
    "List all children (conversations, invoices, boards, docs, etc.) inside a folder.",
    {
      id: z.string().describe("Folder ID"),
      object: z.array(z.string()).optional().describe("Filter by type: conversation, invoice, folder, embed, milestone, board, doc, link"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ id, object, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/folders/${id}/children`,
          params: { object, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "list_folder_files",
    "List all files within a folder. Returns paginated results sorted by creation date (newest first).",
    {
      id: z.string().describe("Folder ID"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ id, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/folders/${id}/files`,
          params: { page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
