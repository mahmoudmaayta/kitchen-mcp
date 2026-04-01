import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerCompanyTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_companies",
    "List all companies. Returns paginated results sorted by creation date (newest first).",
    {
      title: z.string().optional().describe("Search by company title"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ title, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: "/api/companies",
          params: { title, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_company",
    "Retrieve a single company by ID.",
    {
      id: z.string().describe("Company ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/companies/${id}`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_company",
    "Create a new company.",
    {
      name: z.string().describe("Company name (required, must be unique)"),
      initials: z.string().optional().describe("Short initials for the company"),
      website: z.string().optional().describe("Website URL"),
      email: z.string().optional().describe("Contact email"),
      phone_number: z.string().optional().describe("Contact phone number"),
      address: z.string().optional().describe("Company address"),
    },
    async ({ name, ...fields }) => {
      try {
        const body: Record<string, unknown> = { name };
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "POST",
          path: "/api/companies",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_company",
    "Update an existing company. Only provided fields will be changed.",
    {
      id: z.string().describe("Company ID"),
      name: z.string().optional().describe("Company name (must be unique)"),
      initials: z.string().optional().describe("Short initials"),
      website: z.string().optional().describe("Website URL"),
      email: z.string().optional().describe("Contact email"),
      phone_number: z.string().optional().describe("Contact phone number"),
      address: z.string().optional().describe("Company address"),
    },
    async ({ id, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/companies/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_company",
    "DESTRUCTIVE: Permanently delete a company. This cannot be undone. Client members will NOT be deleted.",
    {
      id: z.string().describe("Company ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/companies/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Company ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
