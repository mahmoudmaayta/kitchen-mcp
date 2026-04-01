import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerFileTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "show_file",
    "Retrieve a single file by ID. Returns file metadata including name, size, mime type, and URL.",
    {
      id: z.string().describe("File ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/files/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_file",
    "DESTRUCTIVE: Permanently delete a file. This cannot be undone.",
    {
      id: z.string().describe("File ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/files/${id}`,
        });
        return { content: [{ type: "text" as const, text: `File ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
