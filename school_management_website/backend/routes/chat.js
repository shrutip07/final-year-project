// // routes/chat.js
// const express = require("express");
// const natural = require("natural");
// const stringSimilarity = require("string-similarity");

// const router = express.Router();

// // ------------------ Training Data ------------------
// // Map high-level intents to example utterances and optional payloads.
// const TRAINING = [
//   { intent: "navigate:dashboard", examples: ["go to dashboard", "open dashboard", "show my dashboard", "home screen"] },
//   { intent: "navigate:login", examples: ["login", "sign in", "take me to login", "open sign in"] },
//   { intent: "navigate:tables", examples: ["open tables", "show tables page", "tables screen"] },
//   { intent: "navigate:charts", examples: ["open charts", "show analytics", "charts page"] },
//   { intent: "navigate:principal", examples: ["principal page", "open principal section"] },
//   { intent: "navigate:teacher", examples: ["teacher page", "teachers section", "faculty"] },

//   // FAQs (answer directly)
//   { intent: "faq:fees", examples: ["how to pay fees", "fees payment steps", "where can i pay fees"] },
//   { intent: "faq:admissions", examples: ["admission process", "how to apply for admission"] },
//   { intent: "faq:forgotPassword", examples: ["forgot password", "reset my password", "password help"] },
// ];

// // Optional canonical answers for FAQs
// const FAQ_ANSWERS = {
//   fees:
//     "To pay fees: go to Fees → select term → verify amount → proceed to payment. If issues arise, open Contact and raise a ticket.",
//   admissions:
//     "Admissions: Go to Admissions → Select program → Fill the form → Upload documents → Submit. Track status from Dashboard.",
//   forgotPassword:
//     "Reset your password from Login → 'Forgot Password'. A reset link will be sent to your registered email.",
// };

// // ------------------ Classifier ------------------
// const tokenizer = new natural.WordTokenizer();
// const stemmer = natural.PorterStemmer;
// const classifier = new natural.BayesClassifier(stemmer);

// for (const row of TRAINING) {
//   for (const ex of row.examples) {
//     classifier.addDocument(ex.toLowerCase(), row.intent);
//   }
// }
// classifier.train();

// // Basic synonyms → route keys (matches your React routes below)
// const ROUTE_MAP = {
//   dashboard: "/admin",         // Admin dashboard route in your app
//   charts: "/teacher/charts",   // Charts live under teacher
//   tables: "/admin/tables",
//   login: "/",                  // Login is '/'
//   principal: "/principal",
//   teacher: "/teacher",
// };


// // Helper: try fuzzy-match to known route words when classifier is unsure
// const ROUTE_KEYWORDS = Object.keys(ROUTE_MAP);

// // ------------------ POST /api/chat/query ------------------
// router.post("/query", (req, res) => {
//   const textRaw = (req.body?.text || "").toLowerCase().trim();
//   if (!textRaw) return res.json({ type: "fallback", message: "Say something like: 'Go to dashboard'." });

//   // 1) Classify
//   const label = classifier.classify(textRaw);
//   const scores = classifier.getClassifications(textRaw);
//   const top = scores[0]?.value || 0;

//   // 2) Confidence threshold (tuneable)
//   const CONF = 0.25;

//   // 3) If confident, act on intent
//   if (top >= CONF) {
//     if (label.startsWith("navigate:")) {
//       const routeKey = label.split(":")[1];
//       const route = ROUTE_MAP[routeKey];
//       if (route) return res.json({ type: "navigate", route, say: `Taking you to ${routeKey}…` });
//     }
//     if (label.startsWith("faq:")) {
//       const key = label.split(":")[1];
//       return res.json({ type: "answer", say: FAQ_ANSWERS[key] || "Here’s the info you need." });
//     }
//   }

//   // 4) Fallback: fuzzy search keywords inside the text
//   const best = stringSimilarity.findBestMatch(textRaw, ROUTE_KEYWORDS).bestMatch;
//   if (best.rating >= 0.35) {
//     const route = ROUTE_MAP[best.target];
//     return res.json({ type: "navigate", route, say: `On it! Opening ${best.target}…` });
//   }

//   // 5) Final fallback
//   return res.json({
//     type: "fallback",
//     message:
//       "Sorry, I couldn't find that. Try: 'Go to dashboard', 'Open charts', 'Login', or ask 'How to pay fees?'.",
//   });
// });

// module.exports = router;
// backend/routes/chat.js
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
