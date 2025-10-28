import React from "react";
import { jwtDecode } from "jwt-decode";

import { useNavigate } from "react-router-dom";

export default function Navbar() {
  const token = localStorage.getItem("token");
  const navigate = useNavigate();
  let email = "";

  if (token) {
    try {
      const decoded = jwtDecode(token);
      email = decoded.email || "";
    } catch (err) {}
  }

  function handleLogout() {
    localStorage.removeItem("token");
    navigate("/");
  }

  return (
    <nav style={{ padding: "1rem", background: "#eee", display: "flex", justifyContent: "space-between" }}>
      <span style={{ fontWeight: "bold" }}>School Management App</span>
      {token ? (
        <span>
          {email && <span>Logged in as: {email}</span>}
          <button style={{ marginLeft: "1rem" }} onClick={handleLogout}>
            Logout
          </button>
        </span>
      ) : null}
    </nav>
  );
}
