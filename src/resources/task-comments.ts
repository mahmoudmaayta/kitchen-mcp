import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerTaskCommentTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_task_comments",
    "List all comments on a task. Returns paginated results sorted by creation date (newest first).",
    {
      task_id: z.string().describe("Task ID"),
      content: z.string().optional().describe("Search by content"),
      expand: z.array(z.string()).optional().describe("Expand: author, task, attachments, board"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ task_id, content, expand, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/tasks/${task_id}/comments`,
          params: { content, expand, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_task_comment",
    "Retrieve a single comment by ID.",
    {
      task_id: z.string().describe("Task ID"),
      comment_id: z.string().describe("Comment ID"),
      expand: z.array(z.string()).optional().describe("Expand: author, task, attachments, board"),
    },
    async ({ task_id, comment_id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/tasks/${task_id}/comments/${comment_id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_task_comment",
    "Create a comment on a task.",
    {
      task_id: z.string().describe("Task ID"),
      content: z.string().describe("Comment content (required)"),
      format: z.enum(["text", "html"]).describe("Comment format: text or html (required)"),
    },
    async ({ task_id, content: commentContent, format }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/tasks/${task_id}/comments`,
          body: { content: commentContent, format },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_task_comment",
    "Update a comment's content.",
    {
      task_id: z.string().describe("Task ID"),
      comment_id: z.string().describe("Comment ID"),
      content: z.string().describe("Updated comment content (required)"),
    },
    async ({ task_id, comment_id, content: commentContent }) => {
      try {
        const result = await client.request({
          method: "PUT",
          path: `/api/tasks/${task_id}/comments/${comment_id}`,
          body: { content: commentContent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_task_comment",
    "DESTRUCTIVE: Permanently delete a comment. This cannot be undone.",
    {
      task_id: z.string().describe("Task ID"),
      comment_id: z.string().describe("Comment ID"),
    },
    async ({ task_id, comment_id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/tasks/${task_id}/comments/${comment_id}`,
        });
        return { content: [{ type: "text" as const, text: `Comment ${comment_id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
