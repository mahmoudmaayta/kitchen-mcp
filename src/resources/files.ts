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
    "create_file_upload",
    "Start a Kitchen file upload: returns a file id and a one-time presigned upload_url (valid about 5 minutes). This tool does not send file bytes. Next steps: (1) HTTP PUT the raw file bytes to upload_url with Content-Type set to the file's actual MIME type (do not send the Kitchen API Bearer token on that PUT; the URL is already signed). (2) After PUT succeeds, finalize with POST /api/files/{id}/complete per Kitchen docs (MCP may expose this as a separate tool later). Upload must be completed within 24 hours or it may be deleted.",
    {
      filename: z.string().describe("Name of the file to be uploaded (e.g. report.pdf)"),
    },
    async ({ filename }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: "/api/files",
          body: { filename },
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
