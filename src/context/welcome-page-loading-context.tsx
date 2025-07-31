'use client';

import React, { createContext, useContext, useState, ReactNode } from 'react';

interface WelcomePageLoadingContextType {
  isWelcomePageLoading: boolean;
  setWelcomePageLoading: (isLoading: boolean) => void;
}

const WelcomePageLoadingContext = createContext<WelcomePageLoadingContextType | undefined>(undefined);

export const WelcomePageLoadingProvider = ({ children }: { children: ReactNode }) => {
  const [isWelcomePageLoading, setWelcomePageLoading] = useState(true); // Default to true as page starts loading

  return (
    <WelcomePageLoadingContext.Provider value={{ isWelcomePageLoading, setWelcomePageLoading }}>
      {children}
    </WelcomePageLoadingContext.Provider>
  );
};

export const useWelcomePageLoading = () => {
  const context = useContext(WelcomePageLoadingContext);
  if (context === undefined) {
    throw new Error('useWelcomePageLoading must be used within a WelcomePageLoadingProvider');
  }
  return context;
};
