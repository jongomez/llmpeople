import React, { ReactNode, createContext, useContext, useEffect, useState } from "react";

interface GameContext {
  isVolumeOn: boolean;
  toggleVolume: () => void;
  hasAcceptedPrivacyPolicy: boolean;
  acceptPrivacyPolicy: () => void;
}

const defaultGameContext: GameContext = {
  isVolumeOn: true,
  toggleVolume: () => {},
  hasAcceptedPrivacyPolicy: false,
  acceptPrivacyPolicy: () => {},
};

const GameContextContext = createContext<GameContext>(defaultGameContext);

const useGameContext = () => {
  const context = useContext(GameContextContext);
  if (!context) {
    throw new Error("useGameContext must be used within a GameContextProvider");
  }
  return context;
};

interface GameContextProviderProps {
  children: ReactNode;
}

const GameContextProvider: React.FC<GameContextProviderProps> = ({ children }) => {
  const [isVolumeOn, setIsVolumeOn] = useState(true);
  const [hasAcceptedPrivacyPolicy, setHasAcceptedPrivacyPolicy] = useState<boolean>(() => {
    if (typeof window === "undefined") {
      return false;
    }

    const storedValue = window.localStorage.getItem("hasAcceptedPrivacyPolicy");
    return storedValue === "true";
  });

  useEffect(() => {
    localStorage.setItem("hasAcceptedPrivacyPolicy", String(hasAcceptedPrivacyPolicy));
  }, [hasAcceptedPrivacyPolicy]);

  const toggleVolume = () => {
    setIsVolumeOn(!isVolumeOn);
  };

  const acceptPrivacyPolicy = () => {
    setHasAcceptedPrivacyPolicy(true);
  };

  const value = {
    isVolumeOn,
    toggleVolume,
    hasAcceptedPrivacyPolicy,
    acceptPrivacyPolicy,
  };

  return <GameContextContext.Provider value={value}>{children}</GameContextContext.Provider>;
};

export { GameContextProvider, useGameContext };
