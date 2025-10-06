import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Countly MCP Server",
    version: "1.0.0",
  });

  // Countly config
  private COUNTLY_BASE_URL = "https://countly-25ead5664e9ef.flex.countly.com";
  private APP_ID = "68e258c2726ef31b361f2f62";
  private API_KEY = "efac210c1e4d5184b39a70178a5a0130";

  async init() {
    console.log("🔧 Initializing Events tool...");

    this.server.tool("countlyEvents", {}, async () => {
      console.log("📊 Fetching Countly top events...");
      try {
        const url = `${this.COUNTLY_BASE_URL}/o?api_key=${this.API_KEY}&app_id=${this.APP_ID}&method=events`;

        console.log("🔗 Fetching from:", url.replace(this.API_KEY, "***"));

        const response = await fetch(url);

        if (!response.ok) {
          const errorText = await response.text();
          throw new Error(`Countly API error: ${response.status} - ${errorText}`);
        }

        const events = await response.json();
        console.log("✅ Events fetched successfully");

        return {
          content: [
            {
              type: "text",
              text: JSON.stringify(events, null, 2),
            },
          ],
        };
      } catch (error: any) {
        console.error("❌ Error fetching events:", error);
        return {
          content: [
            {
              type: "text",
              text: `Error: ${error.message}`,
            },
          ],
        };
      }
    });

    console.log("✅ Events tool registered");
  }
}

// ✅ ES Module export format
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    console.log(`📨 ${request.method} ${url.pathname}`);

    // Health check endpoint
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          name: "Countly MCP Server",
          version: "1.0.0",
          status: "running",
          tools: ["countlyEvents"],
        }, null, 2),
        { 
          headers: { "Content-Type": "application/json" },
          status: 200
        }
      );
    }

    // SSE endpoint
    if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
      console.log("📡 SSE request");
      return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      console.log("🔧 MCP request");
      const sessionId = request.headers.get("Mcp-Session-Id");
      console.log("📌 Session ID:", sessionId);
      return MyMCP.serve("/mcp").fetch(request, env, ctx);
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: "Not found" }), 
      { 
        status: 404,
        headers: { "Content-Type": "application/json" }
      }
    );
  },
};