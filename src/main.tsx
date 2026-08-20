import React from "react";
import ReactDOM from "react-dom/client";
import { RouterProvider } from "react-router-dom";
import { AuthProvider } from "./auth/AuthProvider";
import { router } from "./app/router";
import "./styles/global.css";

const rootEl = document.getElementById("root");
if (!rootEl) throw new Error("عنصر #root غير موجود في index.html");

ReactDOM.createRoot(rootEl).render(
  <React.StrictMode>
    <AuthProvider>
      <RouterProvider router={router} />
    </AuthProvider>
  </React.StrictMode>
);
