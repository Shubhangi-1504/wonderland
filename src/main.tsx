import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import App from "./App";
import "./index.css";
import { initGlobalErrors } from "./lib/globalErrors";
import { initDemoMode } from "./lib/demoMode";
import { initSync } from "./store/syncWithSupabase";

// Global window error & unhandledrejection handlers (fire-and-forget, never throws)
initGlobalErrors();

// Demo mode: ?demo=1 preloads sample portfolio and disables remote sync
initDemoMode();

// Attach Supabase auth/persistence once; guests make no table calls.
initSync();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <BrowserRouter>
      <App />
    </BrowserRouter>
  </React.StrictMode>,
);
