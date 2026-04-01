import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerBoardTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_boards",
    "List all boards. Returns paginated results sorted by creation date (newest first).",
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
          path: "/api/boards",
          params: { state, title, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_board",
    "Retrieve a single board by ID.",
    {
      id: z.string().describe("Board ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/boards/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_board",
    "Create a new board.",
    {
      title: z.string().describe("Board title (required)"),
      visibility: z.enum(["private", "internal", "shared"]).describe("Board visibility (required)"),
      description: z.string().optional().describe("Board description"),
      folder: z.string().optional().describe("Folder ID to create the board in"),
      role: z.enum(["board_admin", "board_manager", "board_editor", "board_full_creator", "board_creator", "board_commenter", "board_viewer"]).optional().describe("Default role for team members (only for internal visibility)"),
    },
    async ({ title, visibility, ...fields }) => {
      try {
        const body: Record<string, unknown> = { title, visibility };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: "/api/boards",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_board",
    "Update an existing board. Only provided fields will be changed.",
    {
      id: z.string().describe("Board ID"),
      title: z.string().optional().describe("Board title"),
      description: z.string().optional().describe("Board description"),
      visibility: z.enum(["private", "internal", "shared"]).optional().describe("Board visibility"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/boards/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_board",
    "DESTRUCTIVE: Permanently delete a board. This cannot be undone.",
    {
      id: z.string().describe("Board ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/boards/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Board ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "archive_board",
    "Move a board to archive. Can be restored later.",
    {
      id: z.string().describe("Board ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/boards/${id}/archive`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "restore_board",
    "Restore a board from archive.",
    {
      id: z.string().describe("Board ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/boards/${id}/restore`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_board",
    "Move a board to a folder. Pass null parent to move to root level.",
    {
      id: z.string().describe("Board ID"),
      parent: z.string().nullable().describe("Folder ID to move to, or null for root level"),
    },
    async ({ id, parent }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/boards/${id}/move`,
          body: { parent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
