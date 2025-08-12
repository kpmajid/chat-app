//frontend\src
import { createRoot } from "react-dom/client";
import "./index.css";
import App from "./App.tsx";
import { Provider } from "react-redux";
import { store } from "./store.ts";

import { ThemeProvider } from "@/components/theme-provider";
import { SocketProvider } from "./context/SocketProvider.tsx";

createRoot(document.getElementById("root")!).render(
  <Provider store={store}>
    <ThemeProvider>
      <SocketProvider>
        <App />
      </SocketProvider>
    </ThemeProvider>
  </Provider>
);
