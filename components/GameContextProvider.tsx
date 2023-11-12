import { Humanoid } from "@/lib/babylonjs/Humanoid";
import { CurrentSoundRef, HumanoidRef } from "@/lib/types";
import React, { ReactNode, createContext, useContext, useRef } from "react";

type GameContext = {
  humanoidRef: HumanoidRef;
  currentSoundRef: CurrentSoundRef;
};

const defaultGameContext: GameContext = {
  humanoidRef: { current: null },
  currentSoundRef: { current: null },
};

const GameContextContext = createContext<GameContext>(defaultGameContext);

const useGameContext = () => {
  return useContext(GameContextContext);
};

interface GameContextProviderProps {
  children: ReactNode;
}

const GameContextProvider: React.FC<GameContextProviderProps> = ({ children }) => {
  const humanoidRef = useRef<Humanoid | null>(null);
  const currentSoundRef = useRef<HTMLAudioElement | null>(null);

  return (
    <GameContextContext.Provider value={{ humanoidRef, currentSoundRef }}>
      {children}
    </GameContextContext.Provider>
  );
};

export { GameContextProvider, useGameContext };
