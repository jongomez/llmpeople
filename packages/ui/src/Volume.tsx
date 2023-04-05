import { Volume2, VolumeX } from "@tamagui/lucide-icons";
import { Button } from "tamagui";
import { GameContext } from "./GameContextProvider";

type VolumeProps = {
  soundController: GameContext["soundController"];
};

export const Volume = ({ soundController }: VolumeProps) => {
  const size = "$2";
  const iconColor = "black";

  return (
    <Button
      position={"fixed" as any}
      top={10}
      left={50}
      size={30}
      backgroundColor={"none"}
      onPress={soundController.toggleVolume}
      borderColor="none"
      // focusStyle={{ borderColor: "none", backgroundColor = "none" }}
      unstyled
      icon={
        soundController.isVolumeOn ? (
          <Volume2 color={iconColor} size={size} />
        ) : (
          <VolumeX color={iconColor} size={size} />
        )
      }
    />
  );
};
