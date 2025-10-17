import { McpAgent } from "agents/mcp";
import { McpServer } from "@modelcontextprotocol/sdk/server/mcp.js";

export class MyMCP extends McpAgent {
  server = new McpServer({
    name: "Countly MCP Server",
    version: "1.0.0",
  });

  // Countly config
  private COUNTLY_BASE_URL = "https://countly-0fc41dd055e6d.flex.countly.com";
  private APP_ID = "68f24d6acf33bd33431ea01f";
  private API_KEY = "4d4235ae05b9685d285340a8ae763484";

  async init() {
    console.log("🔧 Initializing tools...");
    
    // Tool 1: Event Gönder
    this.server.tool(
      "sendCountlyEvent",
      {
        eventKey: { 
          type: "string", 
          description: "Event key (e.g., 'button_click')" 
        },
        count: { 
          type: "number", 
          description: "Event count", 
          default: 1 
        },
        sum: { 
          type: "number", 
          description: "Optional sum value", 
          optional: true 
        },
        segmentation: { 
          type: "object", 
          description: "Optional segmentation data", 
          optional: true 
        }
      },
      async (params: any) => {
        console.log("📤 Sending event to Countly:", params);
        try {
          const event = {
            key: params.eventKey,
            count: params.count || 1,
            timestamp: Date.now(),
            ...(params.sum && { sum: params.sum }),
            ...(params.segmentation && { segmentation: params.segmentation })
          };

          const url = `${this.COUNTLY_BASE_URL}/i?app_key=a2d94b6c2a46ae542e8a2c52fb26168696d2ffe6&device_id=claude_user&events=${encodeURIComponent(JSON.stringify([event]))}`;
          
          console.log("🔗 Request URL:", url.substring(0, 100) + "...");
          
          const response = await fetch(url);
          const result = await response.json();
          
          console.log("✅ Event sent successfully:", result);
          
          return {
            content: [
              {
                type: "text",
                text: `✅ Event '${params.eventKey}' sent successfully!\nCount: ${params.count}\n${params.sum ? `Sum: ${params.sum}\n` : ''}Result: ${JSON.stringify(result, null, 2)}`,
              },
            ],
          };
        } catch (error: any) {
          console.error("❌ Error sending event:", error);
          return {
            content: [
              {
                type: "text",
                text: `❌ Error: ${error.message}`,
              },
            ],
            isError: true
          };
        }
      }
    );

    // Tool 2: Event'leri Çek
    this.server.tool(
      "countlyEvents", 
      {},
      async () => {
        console.log("📊 Fetching Countly events...");
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
                text: `❌ Error: ${error.message}`,
              },
            ],
            isError: true
          };
        }
      }
    );

    console.log("✅ Both tools registered: sendCountlyEvent, countlyEvents");
  }
}

// Export default handler
export default {
  async fetch(request: Request, env: Env, ctx: ExecutionContext): Promise<Response> {
    const url = new URL(request.url);
    console.log(`📨 ${request.method} ${url.pathname}`);

    // CORS headers
    const corsHeaders = {
      'Access-Control-Allow-Origin': '*',
      'Access-Control-Allow-Methods': 'GET, POST, OPTIONS',
      'Access-Control-Allow-Headers': 'Content-Type, Mcp-Session-Id',
    };

    // Handle OPTIONS
    if (request.method === 'OPTIONS') {
      return new Response(null, { 
        status: 204,
        headers: corsHeaders 
      });
    }

    // Health check endpoint
    if (url.pathname === "/") {
      return new Response(
        JSON.stringify({
          name: "Countly MCP Server",
          version: "1.0.0",
          status: "running",
          tools: ["sendCountlyEvent", "countlyEvents"], // ✅ İkisi de burada
        }, null, 2),
        { 
          headers: { 
            ...corsHeaders,
            "Content-Type": "application/json" 
          },
          status: 200
        }
      );
    }

    // SSE endpoint
    if (url.pathname === "/sse" || url.pathname.startsWith("/sse/")) {
      console.log("📡 SSE request");
      const response = await MyMCP.serveSSE("/sse").fetch(request, env, ctx);
      
      // Add CORS headers to SSE response
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    // MCP endpoint
    if (url.pathname === "/mcp") {
      console.log("🔧 MCP request");
      const sessionId = request.headers.get("Mcp-Session-Id");
      console.log("📌 Session ID:", sessionId);
      
      const response = await MyMCP.serve("/mcp").fetch(request, env, ctx);
      
      // Add CORS headers
      const headers = new Headers(response.headers);
      Object.entries(corsHeaders).forEach(([key, value]) => {
        headers.set(key, value);
      });
      
      return new Response(response.body, {
        status: response.status,
        statusText: response.statusText,
        headers
      });
    }

    // 404 for unknown routes
    return new Response(
      JSON.stringify({ error: "Not found" }), 
      { 
        status: 404,
        headers: { 
          ...corsHeaders,
          "Content-Type": "application/json" 
        }
      }
    );
  },
};