import { Volume2, VolumeX } from "@tamagui/lucide-icons";
import React from "react";
import { Button } from "tamagui";
import { useGameContext } from "./GameContextProvider";

export const Volume = React.memo(function Volume() {
  const { isVolumeOn, toggleVolume } = useGameContext();
  const size = "$2";
  const iconColor = "black";

  return (
    <div style={{ position: "fixed", top: 10, left: 10 }}>
      <Button
        size={30}
        backgroundColor={"none"}
        onPress={toggleVolume}
        borderColor="none"
        // focusStyle={{ borderColor: "none", backgroundColor = "none" }}
        unstyled
        icon={
          isVolumeOn ? (
            <Volume2 color={iconColor} size={size} />
          ) : (
            <VolumeX color={iconColor} size={size} />
          )
        }
      />
    </div>
  );
});
