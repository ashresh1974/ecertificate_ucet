import React from "react";
import ReactDOM from "react-dom/client";
import Login from "./Login";  // ✅ Correct import path
import "./index.css";             // ✅ Global styles

ReactDOM.createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <Login />
  </React.StrictMode>
);
