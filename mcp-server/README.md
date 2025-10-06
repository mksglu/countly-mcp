Countly MCP Server
🚀 About This Project
This project is a Cloudflare Workers-based MCP Server designed to fetch Countly data via MCP (Model Context Protocol).

Currently, only the Events tool is active. You can connect to the Countly API through the MCP server to retrieve Event data in JSON format.

✨ Features
✅ MCP server runs on Cloudflare

✅ countlyEvents tool is ready

✅ SSE (Server-Sent Events) support

✅ Deployable on Cloudflare

🔄 Directly integrated with the Countly panel (Event data can be fetched but is not displayed on the panel)

🧪 Optional test client (can be used to test MCP calls)

🛠️ Setup and Execution
Requirements:

Node.js 20+

Clone the repository and install dependencies:

Bash

git clone <repository-url>
cd <repository-directory>
npm install
Start the MCP server in development mode:

Bash

npm run dev
Check the server status:
After the server starts, you can check its status from the / endpoint.

Bash

curl http://localhost:PORT/
Note: The PORT value will be displayed in the terminal when you run the npm run dev command.

Example Response:

JSON

{
  "name": "Countly MCP Server - Events Only",
  "version": "1.0.0",
  "status": "running",
  "tools": ["countlyEvents"]
}
Establish an SSE connection:

Bash

curl http://localhost:PORT/sse?sessionId=YOUR_SESSION_ID
📝 MCP Tool Usage (Events)
You can fetch Event data by making a POST request with the Mcp-Session-Id header.

Example Payload:

JSON

{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "countlyEvents",
    "arguments": {}
  },
  "id": 1
}
📊 Countly Plugin List & Roadmap
Plugin	Status
Events	✅ Completed
Funnels	⬜ Planned
Sessions	⬜ Planned
User Profiles	⬜ Planned
Crashes	⬜ Planned
A/B Testing	⬜ Planned
Push Notifications	⬜ Planned
Cohorts	⬜ Planned

E-Tablolar'a aktar
💡 MCP Information
MCP (Model Context Protocol): A protocol used to fetch Countly data and make model-based API calls.

MCP Server: A server running on Cloudflare that manages sessions via SSE and provides MCP tools.

Events tool: Designed to fetch Countly Event data.

Session Management: A unique sessionId is created via SSE, and this ID is used in MCP calls.

📷 Test Screenshot
You can connect to the MCP server and call the countlyEvents tool using Claude UI, Postman, or a similar tool.

Example SSE Session and Event JSON Output:

🔌 Connecting to SSE with initial ID: test-session-12345
🟢 SSE connection opened
📨 Received endpoint event: /sse/message?sessionId=test-session-12345
✅ Real session ID extracted: test-session-12345
📌 Using session ID for tool call: test-session-12345
🔧 Calling countlyEvents tool...
📄 JSON Response:
{
  "events": [
    {"name":"app_open","count":120},
    {"name":"purchase","count":45}
  ]
}