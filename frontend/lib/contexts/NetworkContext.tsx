"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Network = "testnet" | "mainnet";

interface NetworkContextValue {
  network: Network;
  setNetwork: (n: Network) => void;
  isTestnet: boolean;
}

const NetworkContext = createContext<NetworkContextValue>({
  network: "testnet",
  setNetwork: () => {},
  isTestnet: true,
});

export function NetworkProvider({ children }: { children: React.ReactNode }) {
  const [network, setNetworkState] = useState<Network>("testnet");

  useEffect(() => {
    const stored = localStorage.getItem("jellynet_network") as Network | null;
    if (stored === "testnet" || stored === "mainnet") setNetworkState(stored);
  }, []);

  function setNetwork(n: Network) {
    setNetworkState(n);
    localStorage.setItem("jellynet_network", n);
  }

  return (
    <NetworkContext.Provider value={{ network, setNetwork, isTestnet: network === "testnet" }}>
      {children}
    </NetworkContext.Provider>
  );
}

export function useNetwork() {
  return useContext(NetworkContext);
}
