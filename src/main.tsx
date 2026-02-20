import React from "react";
import ReactDOM from "react-dom/client";
import { MidlProvider } from "@midl/react";
import { WagmiMidlProvider } from "@midl/executor-react";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { WagmiProvider } from "wagmi";
import { midlConfig } from "./config/midlConfig";
import { wagmiConfig } from "./config/wagmiConfig";
import App from "./App";
import "./index.css";

const queryClient = new QueryClient();

ReactDOM.createRoot(document.getElementById("root")!).render(
  <React.StrictMode>
    <MidlProvider config={midlConfig}>
      <WagmiProvider config={wagmiConfig}>
        <QueryClientProvider client={queryClient}>
          <WagmiMidlProvider>
            <App />
          </WagmiMidlProvider>
        </QueryClientProvider>
      </WagmiProvider>
    </MidlProvider>
  </React.StrictMode>
);
