import React from "react";
import ReactDOM from "react-dom/client";
import { BrowserRouter } from "react-router-dom";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import App from "./App";
import { AuthProvider } from "./features/auth/AuthContext";
import { MediaPlayerProvider } from "./features/media/MediaPlayerContext";
import PersistentMediaPlayer from "./features/media/PersistentMediaPlayer";
import "./index.css";
const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <QueryClientProvider client={queryClient}>
      <AuthProvider>
        <MediaPlayerProvider>
          <BrowserRouter>
            <App />
            <PersistentMediaPlayer />
          </BrowserRouter>
        </MediaPlayerProvider>
      </AuthProvider>
    </QueryClientProvider>
  </React.StrictMode>
);