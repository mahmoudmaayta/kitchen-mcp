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
    "Start a Kitchen file upload: returns a file id and a one-time presigned upload_url (valid about 5 minutes). This tool does not send file bytes. Next steps: (1) HTTP PUT the raw file bytes to upload_url with Content-Type set to the file's actual MIME type (do not send the Kitchen API Bearer token on that PUT; the URL is already signed). (2) After PUT succeeds, call complete_file_upload with the same file id (POST /api/files/{id}/complete). Upload must be completed within 24 hours or it may be deleted.",
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
    "complete_file_upload",
    "Finalize a Kitchen file upload after bytes were PUT to the presigned upload_url from create_file_upload. Intended order: (1) create_file_upload, (2) HTTP PUT raw bytes to upload_url with the file's real Content-Type (see Kitchen create-file docs), (3) complete_file_upload with the same file id. The presigned URL is short-lived (about 5 minutes); if it expired or the PUT failed, complete often errors—check Kitchen docs for details. Wrong Content-Type, truncated upload, or skipping the PUT also commonly surface as errors here. Returns the finalized file object. Completing does not attach the file anywhere; attaching to a folder, message, or task still requires separate Kitchen APIs.",
    {
      id: z.string().describe("File ID returned by create_file_upload"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/files/${id}/complete`,
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
