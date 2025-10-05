// test-client.js
const { EventSource } = require("eventsource");
const fetch = (...args) => import('node-fetch').then(({ default: fetch }) => fetch(...args));

const PORT = 8787;

console.log("🚀 Starting Countly Events MCP test...");

// SSE ile yeni session aç
const sseUrl = `http://localhost:${PORT}/sse`;
const es = new EventSource(sseUrl);

es.onopen = () => {
  console.log("🟢 SSE connection opened, waiting for sessionId...");
};

es.onmessage = async (msg) => {
  try {
    const data = JSON.parse(msg.data);

    // MCP server SSE mesajında sessionId gönderiyorsa al
    if (!data.sessionId) return;

    const sessionId = data.sessionId;
    console.log(`📌 Real session ID received: ${sessionId}`);

    // MCP tool çağrısı
    const payload = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { name: "countlyEvents", arguments: {} },
      id: Date.now()
    };

    const res = await fetch(`http://localhost:${PORT}/mcp`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        "Accept": "application/json, text/event-stream",
        "Mcp-Session-Id": sessionId
      },
      body: JSON.stringify(payload)
    });

    const toolData = await res.json();
    console.log("📄 JSON Response:", JSON.stringify(toolData, null, 2));
  } catch (err) {
    console.error("❌ Error calling tool:", err);
  } finally {
    es.close();
    console.log("✅ Test completed!");
  }
};

es.onerror = (err) => {
  console.error("❌ SSE error:", err);
};
