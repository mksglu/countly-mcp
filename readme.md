# Countly MCP Server

> ⚠️ **UNOFFICIAL PROJECT** - This is NOT an official Countly project. It's an independent MCP server implementation for Countly Analytics integration.

A production-ready **Cloudflare Workers-based MCP (Model Context Protocol) Server** for seamless integration with Countly Analytics. Built with TypeScript and SSE (Server-Sent Events) for real-time session management.

## 🎯 Overview

This MCP server acts as a bridge between AI assistants (like Claude) and Countly Analytics, enabling:
- **Real-time event tracking** - Send custom events to Countly
- **Analytics data retrieval** - Fetch event statistics and metrics
- **Session-based communication** - SSE-powered stateful connections
- **Edge deployment** - Runs on Cloudflare's global network for low latency

---

## ✨ Features

### Implemented Tools
| Tool | Status | Description |
|------|--------|-------------|
| `sendCountlyEvent` | ✅ Live | Send custom events with segmentation to Countly |
| `countlyEvents` | ✅ Live | Fetch all events and their statistics from Countly |

### Technical Features
- ✅ **Cloudflare Workers** - Edge computing for global low-latency
- ✅ **SSE (Server-Sent Events)** - Real-time bidirectional communication
- ✅ **TypeScript** - Full type safety
- ✅ **CORS Support** - Cross-origin requests enabled
- ✅ **Error Handling** - Comprehensive error responses
- ✅ **Environment Variables** - Secure credential management

### Roadmap
| Plugin | Priority | Status |
|--------|----------|--------|
| Events | P0 | ✅ Completed |
| Funnels | P1 | ⬜ Planned |
| Sessions | P1 | ⬜ Planned |
| User Profiles | P2 | ⬜ Planned |
| Crashes | P2 | ⬜ Planned |
| A/B Testing | P3 | ⬜ Planned |
| Push Notifications | P3 | ⬜ Planned |
| Cohorts | P3 | ⬜ Planned |

---

## 🚀 Quick Start

### Prerequisites
- **Node.js 20+** (LTS recommended)
- **npm** or **yarn**
- **Cloudflare account** (for deployment)
- **Countly account** (free tier available)

### Installation

```bash
# Clone repository
git clone https://github.com/your-username/countly-mcp.git
cd countly-mcp/mcp-server

# Install dependencies
npm install

# Configure environment variables
cp .env.example .env
# Edit .env with your Countly credentials
```

### Environment Variables

Create a `.env` file in the `mcp-server/` directory:

```env
# Countly Configuration
COUNTLY_BASE_URL=https://your-countly-instance.countly.com
COUNTLY_APP_ID=your_app_id
COUNTLY_API_KEY=your_api_key
COUNTLY_APP_KEY=your_app_key  # For sending events
```

<details>
<summary>📘 How to get Countly credentials</summary>

1. **Sign up** at [count.ly](https://count.ly) or use your self-hosted instance
2. **Create an application** in the Countly dashboard
3. **Get credentials** from:
   - `Management` → `Applications` → Select your app
   - **APP_KEY**: Found in SDK configuration
   - **API_KEY**: `Management` → `API Keys` → Create new
   - **APP_ID**: Visible in the application URL
</details>

### Local Development

```bash
# Start development server
npm run dev

# Server will start at http://localhost:8787
# Watch mode enabled - changes auto-reload
```

**Test the server:**

```bash
# Health check
curl http://localhost:8787/

# Expected response:
{
  "name": "Countly MCP Server",
  "version": "1.0.0",
  "status": "running",
  "tools": ["sendCountlyEvent", "countlyEvents"]
}
```

---

## 📡 API Endpoints

### 1. Health Check
**GET** `/`

Returns server status and available tools.

```bash
curl http://localhost:8787/
```

**Response:**
```json
{
  "name": "Countly MCP Server",
  "version": "1.0.0",
  "status": "running",
  "tools": ["sendCountlyEvent", "countlyEvents"]
}
```

---

### 2. SSE Connection
**GET** `/sse`

Establishes a Server-Sent Events connection for session management.

```bash
curl -N http://localhost:8787/sse
```

**Response Stream:**
```
event: endpoint
data: /sse/message?sessionId=a3f5c2d1e4b6

event: message
data: {"type":"session","sessionId":"a3f5c2d1e4b6"}
```

💡 **Session ID** is automatically generated and sent via SSE. Save it for MCP calls.

---

### 3. MCP Tool Calls
**POST** `/mcp`

Call MCP tools using JSON-RPC 2.0 protocol.

**Headers:**
- `Content-Type: application/json`
- `Mcp-Session-Id: <your-session-id>`

---

## 🛠️ Using MCP Tools

### Tool 1: `sendCountlyEvent`
Send custom events to Countly with optional segmentation.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "sendCountlyEvent",
    "arguments": {
      "eventKey": "button_click",
      "count": 1,
      "sum": 5.99,
      "segmentation": {
        "button": "checkout",
        "page": "product_detail",
        "category": "electronics"
      }
    }
  },
  "id": 1
}
```

**Parameters:**
| Parameter | Type | Required | Description |
|-----------|------|----------|-------------|
| `eventKey` | string | ✅ Yes | Event identifier (e.g., "button_click") |
| `count` | number | ❌ No | Event count (default: 1) |
| `sum` | number | ❌ No | Numeric value for revenue tracking |
| `segmentation` | object | ❌ No | Custom key-value pairs for filtering |

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "✅ Event 'button_click' sent successfully!\nCount: 1\nSum: 5.99\nResult: {\"result\": \"Success\"}"
      }
    ]
  },
  "id": 1
}
```

**Example with cURL:**
```bash
SESSION_ID="a3f5c2d1e4b6"  # Replace with your session ID

curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "sendCountlyEvent",
      "arguments": {
        "eventKey": "purchase",
        "count": 1,
        "sum": 49.99,
        "segmentation": {"product": "premium_plan"}
      }
    },
    "id": 1
  }'
```

---

### Tool 2: `countlyEvents`
Fetch all events and their analytics from Countly.

**Request:**
```json
{
  "jsonrpc": "2.0",
  "method": "tools/call",
  "params": {
    "name": "countlyEvents",
    "arguments": {}
  },
  "id": 2
}
```

**Response:**
```json
{
  "jsonrpc": "2.0",
  "result": {
    "content": [
      {
        "type": "text",
        "text": "{\n  \"button_click\": {\n    \"name\": \"button_click\",\n    \"count\": 1523,\n    \"sum\": 0,\n    \"dur\": 0,\n    \"segment\": {\n      \"button\": {\n        \"checkout\": 823,\n        \"add_to_cart\": 700\n      },\n      \"page\": {\n        \"product_detail\": 1200,\n        \"home\": 323\n      }\n    }\n  },\n  \"purchase\": {\n    \"name\": \"purchase\",\n    \"count\": 342,\n    \"sum\": 15432.50,\n    \"dur\": 0\n  }\n}"
      }
    ]
  },
  "id": 2
}
```

**Example with cURL:**
```bash
SESSION_ID="a3f5c2d1e4b6"  # Replace with your session ID

curl -X POST http://localhost:8787/mcp \
  -H "Content-Type: application/json" \
  -H "Mcp-Session-Id: $SESSION_ID" \
  -d '{
    "jsonrpc": "2.0",
    "method": "tools/call",
    "params": {
      "name": "countlyEvents",
      "arguments": {}
    },
    "id": 2
  }'
```

---

## 🧪 Testing

### Test Scripts Included

#### 1. Send Test Event
```bash
cd mcp-server
node send-test-event.js
```

**Output:**
```
✅ Event gönderildi: { result: 'Success' }
```

#### 2. Fetch Events
```bash
cd mcp-server
node fetch-top-events.js
```

**Output:**
```
🔌 SSE bağlantısı açılıyor...
✅ Session ID alındı: a3f5c2d1e4b6
📊 Top events isteniyor...
✅ Request gönderildi: {"status":"ok"}

📈 Events Verisi:
{
  "button_click": {
    "name": "button_click",
    "count": 1523,
    ...
  }
}
```

### Manual Testing with Postman

1. **Open SSE Connection**
   - Method: `GET`
   - URL: `http://localhost:8787/sse`
   - Keep connection open to receive session ID

2. **Call MCP Tool**
   - Method: `POST`
   - URL: `http://localhost:8787/mcp`
   - Headers: 
     - `Content-Type: application/json`
     - `Mcp-Session-Id: <from-sse>`
   - Body: (see examples above)

---

## 🚢 Deployment to Cloudflare

### Step 1: Configure Secrets

```bash
# Set environment variables as Cloudflare secrets
wrangler secret put COUNTLY_BASE_URL
wrangler secret put COUNTLY_APP_ID
wrangler secret put COUNTLY_API_KEY
wrangler secret put COUNTLY_APP_KEY
```

### Step 2: Deploy

```bash
# Deploy to production
npm run deploy

# Output:
# ✨ Deployed to: https://mcp-server.your-worker.workers.dev
```

### Step 3: Test Production

```bash
curl https://mcp-server.mksglu.workers.dev/

# Expected: Server status JSON
```

---

## 🔧 Development

### Project Structure

```
mcp-server/
├── src/
│   └── index.ts              # Main MCP server implementation
├── .env.example              # Environment variables template
├── package.json              # Dependencies and scripts
├── wrangler.toml             # Cloudflare Workers config
├── tsconfig.json             # TypeScript configuration
├── biome.json                # Code formatter config
├── send-test-event.js        # Test script: Send event
└── fetch-top-events.js       # Test script: Fetch events
```

### Available Scripts

```bash
npm run dev          # Start development server (hot reload)
npm run deploy       # Deploy to Cloudflare Workers
npm run format       # Format code with Biome
npm run lint:fix     # Fix linting issues
npm run type-check   # TypeScript type checking
npm run cf-typegen   # Generate Cloudflare types
```

---

## 📚 Additional Resources

- **MCP Protocol:** [https://modelcontextprotocol.io](https://modelcontextprotocol.io)
- **Countly Docs:** [https://support.count.ly/hc/en-us](https://support.count.ly/hc/en-us)
- **Cloudflare Workers:** [https://developers.cloudflare.com/workers](https://developers.cloudflare.com/workers)

---