// import React, { useEffect, useMemo, useRef, useState } from "react";
// import { useNavigate } from "react-router-dom";

// function uid() {
//   let id = localStorage.getItem("chat_session_id");
//   if (!id) {
//     id = "u_" + Math.random().toString(36).slice(2, 10);
//     localStorage.setItem("chat_session_id", id);
//   }
//   return id;
// }

// export default function Assistant() {
//   const nav = useNavigate();
//   const sessionId = useMemo(() => uid(), []);
//   const [messages, setMessages] = useState([
//     { from: "bot", text: "Hi! How can I help you?." }
//   ]);
//   const [input, setInput] = useState("");
//   const boxRef = useRef(null);

//   useEffect(() => {
//     boxRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
//   }, [messages]);

//   function add(from, text) {
//     setMessages((m) => [...m, { from, text }]);
//   }

//   async function send() {
//     const text = input.trim();
//     if (!text) return;
//     add("user", text);
//     setInput("");

//     const token = localStorage.getItem("token"); // your app stores JWT here
//     try {
//       const resp = await fetch("http://localhost:5000/api/chat/query", {
//         method: "POST",
//         headers: {
//           "Content-Type": "application/json",
//           ...(token ? { Authorization: `Bearer ${token}` } : {})
//         },
//         body: JSON.stringify({ text, sessionId })
//       });
//       const data = await resp.json();
//       console.log("[Assistant] response", data);

//       // Handle normalized shapes from backend
//       if (data.type === "navigate") {
//         if (data.allowed) {
//           add("bot", data.say || "Opening…");
//           nav(data.route); // go to the route
//         } else {
//           add("bot", data.say || "Please login with the correct role.");
//         }
//       } else if (data.type === "data") {
//         add("bot", data.say || "Here you go.");
//         // optionally render data.payload in your UI
//       } else if (data.type === "answer") {
//         add("bot", data.say || "Okay.");
//       } else {
//         add("bot", data.message || "Sorry, I didn't get that.");
//       }
//     } catch (e) {
//       console.error(e);
//       add("bot", "Server error. Please try again.");
//     }
//   }

//   function onKey(e) {
//     if (e.key === "Enter") send();
//   }

//   return (
//     <div style={{ position: "fixed", right: 24, bottom: 24, width: 360, background: "#fff", borderRadius: 12, boxShadow: "0 10px 30px rgba(0,0,0,.15)" }}>
//       <div style={{ padding: 12, fontWeight: 600 }}>Site Assistant</div>
//       <div ref={boxRef} style={{ height: 260, overflowY: "auto", padding: 12, display: "flex", flexDirection: "column", gap: 8 }}>
//         {messages.map((m, i) => (
//           <div key={i} style={{
//             alignSelf: m.from === "user" ? "flex-end" : "flex-start",
//             background: m.from === "user" ? "#5b6cff" : "#f1f3f5",
//             color: m.from === "user" ? "#fff" : "#111",
//             padding: "8px 12px",
//             borderRadius: 12,
//             maxWidth: "85%"
//           }}>
//             {m.text}
//           </div>
//         ))}
//       </div>
//       <div style={{ display: "flex", gap: 8, padding: 12, borderTop: "1px solid #eee" }}>
//         <input
//           value={input}
//           onChange={(e) => setInput(e.target.value)}
//           onKeyDown={onKey}
//           placeholder="Ask or say 'Go to dashboard'"
//           style={{ flex: 1, padding: "10px 12px", borderRadius: 8, border: "1px solid #ddd" }}
//         />
//         <button onClick={send} style={{ padding: "10px 16px", borderRadius: 8, background: "#5b6cff", color: "#fff", border: "none" }}>
//           Send
//         </button>
//       </div>
//     </div>
//   );
// }


import React, { useEffect, useMemo, useRef, useState, useContext } from "react";
import { useNavigate } from "react-router-dom";
import AuthContext from "../context/AuthContext";

function uid() {
  let id = localStorage.getItem("chat_session_id");
  if (!id) {
    id = "u_" + Math.random().toString(36).slice(2, 10);
    localStorage.setItem("chat_session_id", id);
  }
  return id;
}

export default function Assistant() {
  const nav = useNavigate();
  const sessionId = useMemo(() => uid(), []);
  const authContext = useContext(AuthContext) || {};
  const { accessToken, user } = authContext;
  const [messages, setMessages] = useState([
    { from: "bot", text: "Hi! How can I help you?.'" }
  ]);
  const [input, setInput] = useState("");
  const [open, setOpen] = useState(false); // 🔹 controls visibility of the chat box
  const boxRef = useRef(null);

  useEffect(() => {
    boxRef.current?.scrollTo({ top: 999999, behavior: "smooth" });
  }, [messages]);

  function add(from, text) {
    setMessages((m) => [...m, { from, text }]);
  }

  async function send() {
    const text = input.trim();
    if (!text) return;
    add("user", text);
    setInput("");

    const token = accessToken || localStorage.getItem("token");
    try {
      const resp = await fetch("http://localhost:5000/api/chat/query", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          ...(token ? { Authorization: `Bearer ${token}` } : {})
        },
        // include user role explicitly as a fallback for non-authenticated paths
        body: JSON.stringify({ text, sessionId, role: user?.role })
      });
      const data = await resp.json();

      if (data.type === "answer") {
        add("bot", data.say || "Okay.");
      } else {
        add("bot", data.message || "Sorry, I didn’t get that.");
      }
    } catch (e) {
      console.error(e);
      add("bot", "Server error. Please try again.");
    }
  }

  function onKey(e) {
    if (e.key === "Enter") send();
  }

  return (
    <>
      {/* Floating toggle button */}
      <button
        onClick={() => setOpen(!open)}
        style={{
          position: "fixed",
          bottom: 24,
          right: 24,
          backgroundColor: "#5b6cff",
          color: "white",
          border: "none",
          borderRadius: "50px",
          padding: "12px 20px",
          cursor: "pointer",
          boxShadow: "0 4px 10px rgba(0,0,0,0.2)",
          fontWeight: "600",
          zIndex: 9999
        }}
      >
        {open ? "Close Assistant" : "Assistant"}
      </button>

      {/* Chat window */}
      {open && (
        <div
          style={{
            position: "fixed",
            right: 24,
            bottom: 80,
            width: 360,
            background: "#fff",
            borderRadius: 12,
            boxShadow: "0 10px 30px rgba(0,0,0,.15)",
            display: "flex",
            flexDirection: "column",
            overflow: "hidden",
            zIndex: 9998
          }}
        >
          <div
            style={{
              padding: 12,
              fontWeight: 600,
              borderBottom: "1px solid #eee",
              backgroundColor: "#5b6cff",
              color: "white"
            }}
          >
            AI Assistant
          </div>
          <div
            ref={boxRef}
            style={{
              height: 260,
              overflowY: "auto",
              padding: 12,
              display: "flex",
              flexDirection: "column",
              gap: 8
            }}
          >
            {messages.map((m, i) => (
              <div
                key={i}
                style={{
                  alignSelf: m.from === "user" ? "flex-end" : "flex-start",
                  background: m.from === "user" ? "#5b6cff" : "#f1f3f5",
                  color: m.from === "user" ? "#fff" : "#111",
                  padding: "8px 12px",
                  borderRadius: 12,
                  maxWidth: "85%"
                }}
              >
                {m.text}
              </div>
            ))}
          </div>
          <div
            style={{
              display: "flex",
              gap: 8,
              padding: 12,
              borderTop: "1px solid #eee"
            }}
          >
            <input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              onKeyDown={onKey}
              placeholder="Ask something..."
              style={{
                flex: 1,
                padding: "10px 12px",
                borderRadius: 8,
                border: "1px solid #ddd"
              }}
            />
            <button
              onClick={send}
              style={{
                padding: "10px 16px",
                borderRadius: 8,
                background: "#5b6cff",
                color: "#fff",
                border: "none"
              }}
            >
              Send
            </button>
          </div>
        </div>
      )}
    </>
  );
}
