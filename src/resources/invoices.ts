import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { z } from "zod";
import { KitchenClient, formatError } from "../kitchen-client.js";

export function registerInvoiceTools(server: McpServer, client: KitchenClient) {
  server.tool(
    "list_invoices",
    "List all invoices. Returns paginated results sorted by creation date (newest first).",
    {
      state: z.enum(["all", "active", "archived"]).optional().describe("Filter by state (default: active)"),
      number: z.string().optional().describe("Search by invoice number"),
      expand: z.array(z.string()).optional().describe("Expand: billing_profile, client, creator"),
      page: z.string().optional().describe("Page number (default: 1)"),
      per_page: z.string().optional().describe("Items per page (default: 20)"),
    },
    async ({ state, number, expand, page, per_page }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: "/api/invoices",
          params: { state, number, expand, page, per_page },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "show_invoice",
    "Retrieve a single invoice by ID.",
    {
      id: z.string().describe("Invoice ID"),
      expand: z.array(z.string()).optional().describe("Expand: billing_profile, client, creator"),
    },
    async ({ id, expand }) => {
      try {
        const result = await client.request({
          method: "GET",
          path: `/api/invoices/${id}`,
          params: { expand },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "create_invoice",
    "Create a new invoice.",
    {
      visibility: z.enum(["private", "internal", "shared"]).describe("Invoice visibility (required)"),
      client_id: z.string().optional().describe("Client user ID"),
      currency: z.string().optional().describe("Three-letter ISO currency code (e.g., USD)"),
      due_date_in_days: z.number().optional().describe("Days until due after finalization"),
      due_reminder_message: z.string().optional().describe("Reminder message"),
      due_reminder_send_days: z.number().optional().describe("Days before/after due to send reminder"),
      folder: z.string().optional().describe("Folder ID to create invoice in"),
      footer_notes: z.string().optional().describe("Footer notes"),
      issue_date: z.string().optional().describe("Issue date"),
      language: z.string().optional().describe("Display language (Java Locale, e.g., en_US)"),
      memo: z.string().optional().describe("Invoice memo"),
      number: z.string().optional().describe("Unique invoice number"),
      shipping_amount: z.number().optional().describe("Shipping amount"),
      role: z.enum(["invoice_admin", "invoice_manager", "invoice_viewer"]).optional().describe("Default role (only for internal visibility)"),
      items: z.string().optional().describe("JSON string of line items array: [{title, description, quantity, amount, currency}]"),
      discounts: z.string().optional().describe("JSON string of discounts array: [{title, amount, currency, type}]"),
      tax_items: z.string().optional().describe("JSON string of tax items array: [{title, amount, currency}]"),
    },
    async ({ visibility, client_id, items, discounts, tax_items, ...fields }) => {
      try {
        const body: Record<string, unknown> = { visibility };
        if (client_id) body.client = client_id;
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        try {
          if (items) body.items = JSON.parse(items);
          if (discounts) body.discounts = JSON.parse(discounts);
          if (tax_items) body.tax_items = JSON.parse(tax_items);
        } catch {
          return { content: [{ type: "text" as const, text: "Invalid JSON in items, discounts, or tax_items. Each must be a valid JSON array." }], isError: true };
        }
        const result = await client.request({
          method: "POST",
          path: "/api/invoices",
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "update_invoice",
    "Update an existing invoice. Only provided fields will be changed.",
    {
      id: z.string().describe("Invoice ID"),
      client_id: z.string().nullable().optional().describe("Client user ID"),
      currency: z.string().optional().describe("Three-letter ISO currency code"),
      due_date_in_days: z.number().nullable().optional().describe("Days until due"),
      due_reminder_message: z.string().nullable().optional().describe("Reminder message"),
      due_reminder_send_days: z.number().nullable().optional().describe("Days before/after due to send reminder"),
      footer_notes: z.string().nullable().optional().describe("Footer notes"),
      issue_date: z.string().nullable().optional().describe("Issue date"),
      language: z.string().optional().describe("Display language"),
      memo: z.string().nullable().optional().describe("Memo"),
      number: z.string().optional().describe("Invoice number"),
      shipping_amount: z.number().optional().describe("Shipping amount"),
      visibility: z.enum(["private", "internal", "shared"]).optional().describe("Visibility"),
      items: z.string().optional().describe("JSON string of line items array"),
      discounts: z.string().optional().describe("JSON string of discounts array"),
      tax_items: z.string().optional().describe("JSON string of tax items array"),
    },
    async ({ id, client_id, items, discounts, tax_items, ...fields }) => {
      try {
        const body: Record<string, unknown> = {};
        if (client_id !== undefined) body.client = client_id;
        for (const [key, value] of Object.entries(fields)) {
          if (value !== undefined) body[key] = value;
        }
        try {
          if (items) body.items = JSON.parse(items);
          if (discounts) body.discounts = JSON.parse(discounts);
          if (tax_items) body.tax_items = JSON.parse(tax_items);
        } catch {
          return { content: [{ type: "text" as const, text: "Invalid JSON in items, discounts, or tax_items. Each must be a valid JSON array." }], isError: true };
        }
        const result = await client.request({
          method: "PUT",
          path: `/api/invoices/${id}`,
          body,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "delete_invoice",
    "DESTRUCTIVE: Permanently delete an invoice. This cannot be undone.",
    {
      id: z.string().describe("Invoice ID"),
    },
    async ({ id }) => {
      try {
        await client.request({
          method: "DELETE",
          path: `/api/invoices/${id}`,
        });
        return { content: [{ type: "text" as const, text: `Invoice ${id} deleted successfully.` }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "archive_invoice",
    "Move an invoice to archive. Can be restored later.",
    {
      id: z.string().describe("Invoice ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/invoices/${id}/archive`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "restore_invoice",
    "Restore an invoice from archive.",
    {
      id: z.string().describe("Invoice ID"),
    },
    async ({ id }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/invoices/${id}/restore`,
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );

  server.tool(
    "move_invoice",
    "Move an invoice to a folder. Pass null parent to move to root level.",
    {
      id: z.string().describe("Invoice ID"),
      parent: z.string().nullable().describe("Folder ID to move to, or null for root level"),
    },
    async ({ id, parent }) => {
      try {
        const result = await client.request({
          method: "POST",
          path: `/api/invoices/${id}/move`,
          body: { parent },
        });
        return { content: [{ type: "text" as const, text: JSON.stringify(result, null, 2) }] };
      } catch (error) {
        return { content: [{ type: "text" as const, text: formatError(error) }], isError: true };
      }
    }
  );
}
