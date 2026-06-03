"use client";
import React, { createContext, useContext, useState, useEffect } from 'react';

interface GiftingModeContextType {
  isGiftingMode: boolean;
  giftMessage: string;
  setGiftMessage: (msg: string) => void;
  giftPackaging: string; // "cloth-wrap" | "wooden-crate" | "none"
  setGiftPackaging: (pkg: string) => void;
  toggleGiftingMode: () => void;
}

const GiftingModeContext = createContext<GiftingModeContextType | undefined>(undefined);

export function GiftingModeProvider({ children }: { children: React.ReactNode }) {
  const [isGiftingMode, setIsGiftingMode] = useState(false);
  const [giftMessage, setGiftMessage] = useState('');
  const [giftPackaging, setGiftPackaging] = useState('none');

  // Load state from localStorage on mount
  useEffect(() => {
    const savedMode = localStorage.getItem("gifting_mode_active");
    if (savedMode === "true") {
      setIsGiftingMode(true);
    }
    const savedMsg = localStorage.getItem("gifting_message");
    if (savedMsg) {
      setGiftMessage(savedMsg);
    }
    const savedPkg = localStorage.getItem("gifting_packaging");
    if (savedPkg) {
      setGiftPackaging(savedPkg);
    }
  }, []);

  // Save changes to localStorage
  useEffect(() => {
    localStorage.setItem("gifting_mode_active", isGiftingMode ? "true" : "false");
  }, [isGiftingMode]);

  useEffect(() => {
    localStorage.setItem("gifting_message", giftMessage);
  }, [giftMessage]);

  useEffect(() => {
    localStorage.setItem("gifting_packaging", giftPackaging);
  }, [giftPackaging]);

  const toggleGiftingMode = () => {
    setIsGiftingMode(prev => !prev);
  };

  return (
    <GiftingModeContext.Provider value={{
      isGiftingMode,
      giftMessage,
      setGiftMessage,
      giftPackaging,
      setGiftPackaging,
      toggleGiftingMode
    }}>
      {children}
    </GiftingModeContext.Provider>
  );
}

export function useGiftingMode() {
  const context = useContext(GiftingModeContext);
  if (!context) {
    throw new Error('useGiftingMode must be used within a GiftingModeProvider');
  }
  return context;
}
