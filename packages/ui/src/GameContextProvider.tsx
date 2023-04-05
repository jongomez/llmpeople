import React, { ReactNode, createContext, useContext, useEffect, useRef, useState } from "react";

interface SoundController {
  isVolumeOn: boolean;
  toggleVolume: () => void;
  humanoidSound: React.MutableRefObject<HTMLAudioElement | null>;
}
export interface GameContext {
  // Sound stuff:
  soundController: SoundController;
  // Privacy policy stuff:
  hasAcceptedPrivacyPolicy: boolean;
  acceptPrivacyPolicy: () => void;
}

const defaultGameContext: GameContext = {
  // Sound stuff:
  soundController: {
    isVolumeOn: true,
    toggleVolume: () => {},
    humanoidSound: { current: null },
  },
  // Privacy policy stuff:
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
  const humanoidSound = useRef<HTMLAudioElement | null>(null);
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
    const newIsVolumeOn = !isVolumeOn;

    if (humanoidSound.current) {
      humanoidSound.current.volume = newIsVolumeOn ? 1 : 0;
    }

    setIsVolumeOn(newIsVolumeOn);
  };

  const acceptPrivacyPolicy = () => {
    setHasAcceptedPrivacyPolicy(true);
  };

  const value = {
    soundController: {
      humanoidSound,
      isVolumeOn,
      toggleVolume,
    },
    hasAcceptedPrivacyPolicy,
    acceptPrivacyPolicy,
  };

  return <GameContextContext.Provider value={value}>{children}</GameContextContext.Provider>;
};

export { GameContextProvider, useGameContext };
