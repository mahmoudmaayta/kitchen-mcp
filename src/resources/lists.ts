import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerListTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_board_lists",
    "List all lists (columns / table groups) on a board. Returns paginated results sorted by creation date (newest first).",
    {
      board_id: z.string().describe("Board ID"),
      title: z.string().optional().describe("Search by list title"),
      expand: z.array(z.string()).optional().describe("Expand relationships: board"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ board_id, title, expand, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/boards/${board_id}/lists`,
          params: { title, expand, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_board_list",
    "Create a new list (column or table group) on a board.",
    {
      board_id: z.string().describe("Board ID"),
      title: z.string().describe("Title of the list (required)"),
    },
    async ({ board_id, title }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/boards/${board_id}/lists`,
          body: { title },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_list",
    "Retrieve a single board list by ID.",
    {
      id: z.string().describe("List ID"),
      expand: z.array(z.string()).optional().describe("Expand relationships: board"),
    },
    async ({ id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/lists/${id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_list",
    "Update an existing board list. Per Kitchen API, provide the new title.",
    {
      id: z.string().describe("List ID"),
      title: z.string().describe("New list title (required)"),
    },
    async ({ id, title }) => {
      try {
        const result = await client.request({
          method: "PUT",
          path: `/api/lists/${id}`,
          body: { title },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_list",
    "DESTRUCTIVE: Permanently delete a board list and all tasks inside it. This cannot be undone.",
    {
      id: z.string().describe("List ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/lists/${id}`,
        });
        return { content: [{ type: "text" as const, text: `List ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
