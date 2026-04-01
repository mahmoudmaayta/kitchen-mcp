import "dotenv/config";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
import { StdioServerTransport } from "@modelcontextprotocol/sdk/server/stdio.js";
import { KitchenClient } from "./kitchen-client.js";
import { registerClientTools } from "./resources/clients.js";
import { registerCompanyTools } from "./resources/companies.js";
import { registerConversationTools } from "./resources/conversations.js";
import { registerMessageTools } from "./resources/messages.js";
import { registerConversationNoteTools } from "./resources/conversation-notes.js";
import { registerTaskTools } from "./resources/tasks.js";
import { registerSubtaskTools } from "./resources/subtasks.js";
import { registerTaskCommentTools } from "./resources/task-comments.js";
import { registerInvoiceTools } from "./resources/invoices.js";
import { registerBoardTools } from "./resources/boards.js";
import { registerFolderTools } from "./resources/folders.js";
import { registerDocTools } from "./resources/docs.js";
import { registerFileTools } from "./resources/files.js";
import { registerEmbedTools } from "./resources/embeds.js";
import { registerWebhookTools } from "./resources/webhooks.js";

const server = new McpServer({
  name: "kitchen-crm",
  version: "1.0.0",
  description: "MCP server for Kitchen.co CRM API — manage clients, companies, conversations, tasks, invoices, and boards.",
});

const kitchenClient = new KitchenClient();

registerClientTools(server, kitchenClient);
registerCompanyTools(server, kitchenClient);
registerConversationTools(server, kitchenClient);
registerMessageTools(server, kitchenClient);
registerConversationNoteTools(server, kitchenClient);
registerTaskTools(server, kitchenClient);
registerSubtaskTools(server, kitchenClient);
registerTaskCommentTools(server, kitchenClient);
registerInvoiceTools(server, kitchenClient);
registerBoardTools(server, kitchenClient);
registerFolderTools(server, kitchenClient);
registerDocTools(server, kitchenClient);
registerFileTools(server, kitchenClient);
registerEmbedTools(server, kitchenClient);
registerWebhookTools(server, kitchenClient);

async function main() {
  const transport = new StdioServerTransport();
  await server.connect(transport);
}

main().catch((error) => {
  console.error("Failed to start Kitchen MCP server:", error);
  process.exit(1);
});
