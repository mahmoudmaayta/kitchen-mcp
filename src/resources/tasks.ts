import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerTaskTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_tasks",
    "List all tasks on a board. Returns paginated results sorted by creation date (newest first).",
    {
      board_id: z.string().describe("Board ID"),
      title: z.string().optional().describe("Search by title"),
      status: z.enum(["open", "completed"]).optional().describe("Filter by status"),
      repeating: z.string().optional().describe("Filter by repeating: 1 for repeating, 0 for non-repeating"),
      members: z.array(z.string()).optional().describe("Filter by assigned member user IDs"),
      lists: z.array(z.string()).optional().describe("Filter by list IDs"),
      labels: z.array(z.string()).optional().describe("Filter by label IDs"),
      starts_at: z.string().optional().describe("Filter by start date (Unix timestamp). Prefix with >= or <= for range"),
      due_at: z.string().optional().describe("Filter by due date (Unix timestamp). Prefix with >= or <= for range"),
      expand: z.array(z.string()).optional().describe("Expand: assignee, author, board, completer, milestone, list"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ board_id, expand, members, lists, labels, ...params }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/boards/${board_id}/tasks`,
          params: { ...params, expand, members, lists, labels },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_task",
    "Retrieve a single task by ID.",
    {
      id: z.string().describe("Task ID"),
      expand: z.array(z.string()).optional().describe("Expand: assignee, author, board, completer, milestone, list"),
    },
    async ({ id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/tasks/${id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_task",
    "Create a new task on a board in a specific list.",
    {
      board_id: z.string().describe("Board ID"),
      title: z.string().describe("Task title (required)"),
      list: z.string().describe("List ID to create the task in (required)"),
      assignee: z.string().optional().describe("User ID of the assignee"),
      description: z.string().optional().describe("Task description (can include HTML)"),
      due_at: z.string().optional().describe("Due date/time"),
      due_reminder: z.string().optional().describe("Reminder time before due date"),
      milestone: z.string().optional().describe("Milestone ID"),
      parent: z.string().optional().describe("Parent task ID"),
      remaining_minutes_estimate: z.number().optional().describe("Estimated remaining minutes"),
      start_at: z.string().optional().describe("Start date/time"),
    },
    async ({ board_id, title, list, ...fields }) => {
      try {
        const body: Record<string, unknown> = { title, list };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: `/api/boards/${board_id}/tasks`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_task",
    "Update an existing task. Only provided fields will be changed.",
    {
      id: z.string().describe("Task ID"),
      title: z.string().optional().describe("Task title"),
      assignee: z.string().nullable().optional().describe("Assignee user ID (null to unassign)"),
      description: z.string().nullable().optional().describe("Description (can include HTML)"),
      due_at: z.string().nullable().optional().describe("Due date/time"),
      milestone: z.string().nullable().optional().describe("Milestone ID"),
      remaining_minutes_estimate: z.number().nullable().optional().describe("Estimated remaining minutes"),
      list: z.string().optional().describe("List ID"),
      start_at: z.string().nullable().optional().describe("Start date/time"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/tasks/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_task",
    "DESTRUCTIVE: Permanently delete a task and all associated data. This cannot be undone.",
    {
      id: z.string().describe("Task ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/tasks/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Task ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_task",
    "Move a task to a different list on a board, with optional position control.",
    {
      id: z.string().describe("Task ID"),
      board: z.string().describe("Target board ID (required)"),
      list: z.string().describe("Target list ID (required)"),
      position: z.string().optional().describe("Position: integer, 'top', or 'bottom'"),
    },
    async ({ id, board, list, position }) => {
      try {
        const body: Record<string, unknown> = { board, list };
        if (position) body.position = position;
        await client.request({
          method: "POST",
          path: `/api/tasks/${id}/move`,
          body,
        });
        return { content: [{ type: "text" as const, text: `Task ${id} moved successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "toggle_task_completion",
    "Toggle task completion status. Marks open tasks as completed and vice versa.",
    {
      id: z.string().describe("Task ID"),
      completed: z.boolean().describe("Whether the task should be completed (required)"),
    },
    async ({ id, completed }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/tasks/${id}/completed`,
          params: { completed: completed ? "1" : "0" },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
