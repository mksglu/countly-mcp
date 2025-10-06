import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class MyMCP extends McpAgent {
	server = new McpServer({
	  name: "Countly MCP Server - Events Only",
	  version: "1.0.0",
	});
  
	// Countly config
	private COUNTLY_BASE_URL = "https://countly-25ead5664e9ef.flex.countly.com";
	private APP_ID = "68e258c2726ef31b361f2f62";
	private API_KEY = "efac210c1e4d5184b39a70178a5a0130"; 
  
	async init() {
	  console.log("🔧 Initializing Events tool...");
  
	  // ← Buraya koyuyorsun
	  this.server.tool("countlyEvents", {}, async () => {
		console.log("📊 Fetching Countly top events...");
		try {
		  const url = `${this.COUNTLY_BASE_URL}/o?api_key=${this.API_KEY}&app_id=${this.APP_ID}&method=top_events&period=7days&limit=10`;
  
		  console.log("🔗 Fetching from:", url.replace(this.API_KEY, "***"));
  
		  const response = await fetch(url);
  
		  if (!response.ok) {
			const errorText = await response.text();
			throw new Error(`Countly API error: ${response.status} - ${errorText}`);
		  }
  
		  const events = await response.json();
		  console.log("✅ Top events fetched successfully");
  
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
	  // ↑ Buraya kadar
	  console.log("✅ Events tool registered");
	}
  }
  