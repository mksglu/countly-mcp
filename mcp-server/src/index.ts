  import { McpAgent } from "agents/mcp";
  import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";
  import { CountlyAgent } from "../../agents/CountlyAgent";
  
  export class MyMCP extends McpAgent {
	server = new McpServer({
	  name: "Countly MCP Server - Events Only",
	  version: "1.0.0",
	});
  
	countly = new CountlyAgent({
	  apiKey: "a2d94b6c2a46ae542e8a2c52fb26168696d2ffe6", // ✅ App Key
	  appId: "68e258c2726ef31b361f2f62",
	  baseUrl: "https://countly-25ead5664e9ef.flex.countly.com",
	});
  
	async init() {
	  console.log("🔧 Initializing Events tool...");
	  
	  this.server.tool("countlyEvents", {}, async () => {
		console.log("📊 Fetching Countly events...");
		try {
		  const events = await this.countly.fetchEvents();
		  console.log("✅ Events fetched:", events);
		  
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
  
  export default {
	async fetch(request: Request, env: Env, ctx: ExecutionContext) {
	  const url = new URL(request.url);
	  console.log(`📨 ${request.method} ${url.pathname}`);
  
	  if (url.pathname === "/") {
		return new Response(
		  JSON.stringify({
			name: "Countly MCP Server - Events Only",
			version: "1.0.0",
			status: "running",
			tools: ["countlyEvents"],
		  }, null, 2),
		  { headers: { "Content-Type": "application/json" } }
		);
	  }
  
	  if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
		console.log("📡 SSE request");
		return MyMCP.serveSSE("/sse").fetch(request, env, ctx);
	  }
  
	  if (url.pathname === "/mcp") {
		console.log("🔧 MCP request");
		const sessionId = request.headers.get("Mcp-Session-Id");
		console.log("📌 Session ID:", sessionId);
		return MyMCP.serve("/mcp").fetch(request, env, ctx);
	  }
  
	  return new Response("Not found", { status: 404 });
	},
  };
  