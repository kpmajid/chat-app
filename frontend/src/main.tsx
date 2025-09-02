//frontend\src
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store.ts";

import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "./context/SocketProvider.tsx";
import { Toaster } from "./components/ui/sonner.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider>
      <SocketProvider>
        <App />
        <Toaster />
      </SocketProvider>
    </ThemeProvider>
  </Provider>
);
