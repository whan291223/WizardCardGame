"use client";

import React, { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";
import type { Liff } from "@line/liff";

interface LiffContextType {
  liff: Liff | null;
  isReady: boolean;
  error: string | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  isReady: false,
  error: null,
});

export const useLiff = () => useContext(LiffContext);

export const LiffProvider: React.FC<{ children: React.ReactNode; liffId: string }> = ({
  children,
  liffId,
}) => {
  const [liffObject, setLiffObject] = useState<Liff | null>(null);
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    const initLiff = async () => {
      if (!liffId) {
        setError("LIFF ID is required");
        return;
      }

      try {
        await liff.init({ liffId });
        setLiffObject(liff);
        setIsReady(true);
      } catch (err: unknown) {
        console.error("LIFF init failed", err);
        setError(err instanceof Error ? err.message : "Unknown error");
      }
    };

    initLiff();
  }, [liffId]);

  return (
    <LiffContext.Provider value={{ liff: liffObject, isReady, error }}>
      {children}
    </LiffContext.Provider>
  );
};
