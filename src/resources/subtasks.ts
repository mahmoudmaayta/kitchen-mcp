import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerSubtaskTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_subtasks",
    "List all subtasks of a parent task. Returns paginated results.",
    {
      task_id: z.string().describe("Parent task ID"),
      expand: z.array(z.string()).optional().describe("Expand: members, parent, subtask_list"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ task_id, expand, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/tasks/${task_id}/subtasks`,
          params: { expand, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_subtask",
    "Retrieve a single subtask by ID.",
    {
      task_id: z.string().describe("Parent task ID"),
      subtask_id: z.string().describe("Subtask ID"),
      expand: z.array(z.string()).optional().describe("Expand: members, parent, subtask_list"),
    },
    async ({ task_id, subtask_id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/tasks/${task_id}/subtasks/${subtask_id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_subtask",
    "Create a new subtask under a parent task.",
    {
      task_id: z.string().describe("Parent task ID"),
      title: z.string().describe("Subtask title (required)"),
      subtask_list: z.string().describe("Subtask list ID (required)"),
      due_at: z.string().optional().describe("Due date in Y-m-d format (e.g., 2026-03-25)"),
      expand: z.array(z.string()).optional().describe("Expand: members, parent, subtask_list"),
    },
    async ({ task_id, title, subtask_list, due_at, expand }) => {
      try {
        const body: Record<string, unknown> = { title, subtask_list };
        if (due_at) body.due_at = due_at;
        if (expand) body.expand = expand;
        const result = await client.request({
          method: "POST",
          path: `/api/tasks/${task_id}/subtasks`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_subtask",
    "Update an existing subtask. Only provided fields will be changed.",
    {
      task_id: z.string().describe("Parent task ID"),
      subtask_id: z.string().describe("Subtask ID"),
      title: z.string().optional().describe("Subtask title"),
      due_at: z.string().nullable().optional().describe("Due date in Y-m-d format"),
      expand: z.array(z.string()).optional().describe("Expand: members, parent, subtask_list"),
    },
    async ({ task_id, subtask_id, expand, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        if (expand) body.expand = expand;
        const result = await client.request({
          method: "PUT",
          path: `/api/tasks/${task_id}/subtasks/${subtask_id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_subtask",
    "DESTRUCTIVE: Permanently delete a subtask. This cannot be undone.",
    {
      task_id: z.string().describe("Parent task ID"),
      subtask_id: z.string().describe("Subtask ID"),
    },
    async ({ task_id, subtask_id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/tasks/${task_id}/subtasks/${subtask_id}`,
        });
        return { content: [{ type: "text" as const, text: `Subtask ${subtask_id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
