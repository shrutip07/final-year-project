import React from "react";
import { Navigate } from "react-router-dom";
import { jwtDecode } from "jwt-decode";


export default function ProtectedRoute({ children, role }) {
  const token = localStorage.getItem("token");
  if (!token) return <Navigate to="/" />;

  try {
    const decoded = jwtDecode(token);
    if (role && decoded.role !== role) return <Navigate to="/" />;
    return children;
  } catch (err) {
    return <Navigate to="/" />;
  }
}
