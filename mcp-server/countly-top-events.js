// countly-top-events-direct.js
import fetch from "node-fetch"; // Node 18+ kullanıyorsan global fetch de kullanabilirsin

// Countly API bilgilerin
const COUNTLY_API_URL = "https://countly-25ead5664e9ef.flex.countly.com/i";
const APP_KEY = "a2d94b6c2a46ae542e8a2c52fb26168696d2ffe6"; // app_key parametresi
const APP_ID = "68e258c2726ef31b361f2f62";
const PERIOD = "7days"; // "7days", "30days", "today"
const LIMIT = 10;
const DEVICE_ID = "test-device-1"; // benzersiz test cihazı id’si

async function getTopEvents() {
  try {
    const url = `${COUNTLY_API_URL}?method=top_events&app_key=${APP_KEY}&app_id=${APP_ID}&period=${PERIOD}&limit=${LIMIT}&device_id=${DEVICE_ID}&format=json`;
    const res = await fetch(url);
    const data = await res.json();

    console.log("📄 Top Events Response:", JSON.stringify(data, null, 2));
  } catch (err) {
    console.error("❌ Error fetching top events:", err);
  }
}

// Çağır
getTopEvents();
