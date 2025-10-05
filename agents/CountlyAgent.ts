export class CountlyAgent {
  apiKey: string;
  appId: string;
  baseUrl: string;

  constructor({ 
    apiKey, 
    appId, 
    baseUrl = "https://countly-25ead5664e9ef.flex.countly.com"
  }: { 
    apiKey: string; 
    appId: string; 
    baseUrl?: string;
  }) {
    this.apiKey = apiKey;
    this.appId = appId;
    this.baseUrl = baseUrl;
  }

  async fetchEvents() {
    const url = `${this.baseUrl}/o?api_key=${this.apiKey}&app_id=${this.appId}&method=get_events`;
    console.log("🌐 Fetching events from:", url);
    
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ API Error:", res.status, text);
      throw new Error(`Countly API error: ${res.status} - ${text}`);
    }
    
    const data = await res.json();
    return data;
  }

  async fetchFunnels() {
    const url = `${this.baseUrl}/o?api_key=${this.apiKey}&app_id=${this.appId}&method=funnels`;
    console.log("🌐 Fetching funnels from:", url);
    
    const res = await fetch(url);
    if (!res.ok) {
      const text = await res.text();
      console.error("❌ API Error:", res.status, text);
      throw new Error(`Countly API error: ${res.status} - ${text}`);
    }
    
    const data = await res.json();
    return data;
  }
}