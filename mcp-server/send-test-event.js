import fetch from "node-fetch";

const COUNTLY_URL = "https://countly-0fc41dd055e6d.flex.countly.com/i";
const APP_KEY = "d4687fc38a203db03490efef271cabc7efd7ec98"; // SDK
const DEVICE_ID = "test-device-1";

async function sendTestEvent() {
  const events = [
    {
      key: "button_click",
      count: 1,
      segmentation: { button: "purchase", page: "home" }
    }
  ];

  const url = `${COUNTLY_URL}?app_key=${APP_KEY}&device_id=${DEVICE_ID}&events=${encodeURIComponent(JSON.stringify(events))}`;

  try {
    const res = await fetch(url);
    const data = await res.json();
    console.log("✅ Event gönderildi:", data);
  } catch (err) {
    console.error("❌ Event gönderme hatası:", err);
  }
}

sendTestEvent();