"use client";

import { createContext, useContext, useEffect, useState } from "react";

export type Mode = "supplier" | "agent";

interface ModeContextValue {
  mode: Mode;
  setMode: (m: Mode) => void;
}

const ModeContext = createContext<ModeContextValue>({
  mode: "supplier",
  setMode: () => {},
});

export function ModeProvider({ children }: { children: React.ReactNode }) {
  const [mode, setModeState] = useState<Mode>("supplier");

  useEffect(() => {
    const stored = localStorage.getItem("jellynet_mode") as Mode | null;
    if (stored === "supplier" || stored === "agent") setModeState(stored);
  }, []);

  function setMode(m: Mode) {
    setModeState(m);
    localStorage.setItem("jellynet_mode", m);
  }

  return (
    <ModeContext.Provider value={{ mode, setMode }}>
      {children}
    </ModeContext.Provider>
  );
}

export function useMode() {
  return useContext(ModeContext);
}
