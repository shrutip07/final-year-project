
const express = require("express");
const axios = require("axios");

const router = express.Router();

router.get("/ping", (req, res) => res.json({ ok: true }));

function getRoleFromAuth(req) {
  const a = req.headers.authorization || "";
  if (!a.startsWith("Bearer ")) return "guest";
  try {
    const payload = JSON.parse(Buffer.from(a.split(".")[1], "base64").toString());
    return payload?.role || "guest";
  } catch { return "guest"; }
}

router.post("/query", async (req, res) => {
  const { text, sessionId } = req.body || {};
  console.log("[CHAT] incoming body:", req.body);
  if (!text) return res.json({ type: "fallback", message: "No text" });

  const role = getRoleFromAuth(req);
  const sender = `${sessionId || "anon"}|${role}`;

  try {
    const { data } = await axios.post("http://localhost:5005/webhooks/rest/webhook", {
      sender,
      message: text
    }, { timeout: 10000 });

    console.log("[CHAT] Rasa response:", JSON.stringify(data));

    // Pick last message that has custom or text
    const last = [...(data || [])].reverse().find(m => m.custom || m.text);

    if (last?.custom) return res.json(last.custom);
    if (last?.text)   return res.json({ type: "answer", say: last.text });

    return res.json({ type: "fallback", message: "No response from assistant" });
  } catch (e) {
    console.error("[CHAT] error:", e.message);
    return res.status(500).json({ type: "error", message: "Chat server error" });
  }
});

module.exports = router;
