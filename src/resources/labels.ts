import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

const updateBoardLabelShape = z
  .object({
    board_id: z.string(),
    label_id: z.string(),
    title: z.string().optional(),
    hex_color: z.string().optional(),
  })
  .refine((data) => data.title !== undefined || data.hex_color !== undefined, {
    message: "Provide at least one of title or hex_color to update.",
  });

export function registerLabelTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_board_labels",
    "List all labels on a board. Labels organize cards on the board; results sorted by creation date (newest first).",
    {
      board_id: z.string().describe("Board ID"),
      title: z.string().optional().describe("Search by label title"),
    },
    async ({ board_id, title }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/boards/${board_id}/labels`,
          params: { title },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_board_label",
    "Create a new label on a board.",
    {
      board_id: z.string().describe("Board ID"),
      hex_color: z.string().describe("Color in hexadecimal format (e.g. #FF00FF) (required)"),
      title: z.string().optional().describe("Label title"),
    },
    async ({ board_id, hex_color, title }) => {
      try {
        const body: Record<string, unknown> = { hex_color };
        if (title !== undefined) body.title = title;
        const result = await client.request({
          method: "POST",
          path: `/api/boards/${board_id}/labels`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_board_label",
    "Update an existing board label. Only provided fields are changed; provide at least title or hex_color.",
    {
      board_id: z.string().describe("Board ID"),
      label_id: z.string().describe("Label ID"),
      title: z.string().optional().describe("Label title"),
      hex_color: z.string().optional().describe("Color in hexadecimal format (e.g. #FF00FF)"),
    },
    async (args) => {
      const parsed = updateBoardLabelShape.safeParse(args);
      if (!parsed.success) {
        const msg = parsed.error.issues[0]?.message ?? "Invalid update parameters.";
        return { content: [{ type: "text" as const, text: msg }], isError: true };
      }
      const { board_id, label_id, title, hex_color } = parsed.data;
      try {
        const body: Record<string, unknown> = {};
        if (title !== undefined) body.title = title;
        if (hex_color !== undefined) body.hex_color = hex_color;
        const result = await client.request({
          method: "PUT",
          path: `/api/boards/${board_id}/labels/${label_id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_board_label",
    "DESTRUCTIVE: Permanently delete a board label. This cannot be undone.",
    {
      board_id: z.string().describe("Board ID"),
      label_id: z.string().describe("Label ID"),
    },
    async ({ board_id, label_id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/boards/${board_id}/labels/${label_id}`,
        });
        return { content: [{ type: "text" as const, text: `Label ${label_id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
