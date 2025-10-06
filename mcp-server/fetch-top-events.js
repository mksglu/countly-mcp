import fetch from "node-fetch";

const MCP_URL = "https://mcp-server.mksglu.workers.dev";

async function fetchTopEvents() {
  let sessionId = null;
  let sseConnection = null;

  try {
    // 1️⃣ SSE bağlantısı aç ve sessionId'yi al
    console.log("🔌 SSE bağlantısı açılıyor...");
    const sseRes = await fetch(`${MCP_URL}/sse`);
    
    if (!sseRes.ok) {
      throw new Error(`SSE bağlantısı başarısız: ${sseRes.status}`);
    }

    sseConnection = sseRes.body;
    let buffer = "";
    let foundSession = false;
    
    // SSE mesajlarını dinle
    const processSSE = async () => {
      for await (const chunk of sseConnection) {
        buffer += chunk.toString();
        const lines = buffer.split('\n');
        buffer = lines.pop() || ""; // Son satırı buffer'da tut
        
        for (const line of lines) {
          // Session ID'yi yakala
          if (!foundSession && line.includes('sessionId=')) {
            const match = line.match(/sessionId=([a-f0-9]+)/);
            if (match) {
              sessionId = match[1];
              foundSession = true;
              console.log("✅ Session ID alındı:", sessionId);
              
              // 2️⃣ Session alındıktan sonra event'leri iste
              setTimeout(() => requestEvents(sessionId), 100);
            }
          }
          
          // SSE mesajlarını göster
          if (line.startsWith('data: ')) {
            const data = line.substring(6);
            try {
              const parsed = JSON.parse(data);
              
              // Event yanıtı geldi mi?
              if (parsed.result?.content) {
                console.log("\n📈 Events Verisi:");
                parsed.result.content.forEach(item => {
                  if (item.type === "text") {
                    console.log(item.text);
                  }
                });
                process.exit(0); // Başarılı, çık
              } else if (parsed.error) {
                console.error("\n❌ API Hatası:", parsed.error);
                process.exit(1);
              } else {
                console.log("\n📦 Mesaj:", JSON.stringify(parsed, null, 2));
              }
            } catch (e) {
              // JSON değilse skip
            }
          }
        }
      }
    };

    // SSE dinlemeyi başlat
    processSSE().catch(err => {
      console.error("❌ SSE Hatası:", err.message);
      process.exit(1);
    });

  } catch (err) {
    console.error("❌ Hata:", err.message);
    process.exit(1);
  }
}

// Event'leri istemek için ayrı fonksiyon
async function requestEvents(sessionId) {
  try {
    console.log("\n📊 Top events isteniyor...");
    
    const payload = {
      jsonrpc: "2.0",
      method: "tools/call",
      params: { 
        name: "countlyEvents", 
        arguments: {} 
      },
      id: Date.now()
    };

    const messageUrl = `${MCP_URL}/sse/message?sessionId=${sessionId}`;
    
    const res = await fetch(messageUrl, {
      method: "POST",
      headers: {
        "Content-Type": "application/json"
      },
      body: JSON.stringify(payload)
    });

    const text = await res.text();
    console.log("✅ Request gönderildi:", text);
    
    // 10 saniye sonra timeout
    setTimeout(() => {
      console.log("\n⏱️ Timeout - yanıt gelmedi");
      process.exit(1);
    }, 10000);

  } catch (err) {
    console.error("❌ Request Hatası:", err.message);
    process.exit(1);
  }
}

fetchTopEvents();