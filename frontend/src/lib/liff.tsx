import React, { createContext, useContext, useEffect, useState } from "react";
import liff from "@line/liff";

interface LiffContextType {
  liff: typeof liff | null;
  isReady: boolean;
  error: string | null;
}

const LiffContext = createContext<LiffContextType>({
  liff: null,
  isReady: false,
  error: null,
});

export const LiffProvider: React.FC<{ liffId: string; children: React.ReactNode }> = ({
  liffId,
  children,
}) => {
  const [isReady, setIsReady] = useState(false);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    liff
      .init({ liffId })
      .then(() => {
        setIsReady(true);
      })
      .catch((err: Error) => {
        setError(err.toString());
      });
  }, [liffId]);

  return (
    <LiffContext.Provider value={{ liff, isReady, error }}>
      {children}
    </LiffContext.Provider>
  );
};

export const useLiff = () => useContext(LiffContext);
