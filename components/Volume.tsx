import { CORNER_ICON_SIZE } from "@/lib/constants";
import { MainStateDispatch } from "@/lib/types";
import { Volume2, VolumeX } from "lucide-react";
import styled from "styled-components";
import { IconContainer } from "./IconContainer";

type VolumeProps = {
  mainStateDispatch: MainStateDispatch;
  isVolumeOn: boolean;
};

export const Volume = ({ mainStateDispatch, isVolumeOn }: VolumeProps) => {
  const iconColor = "black";

  const IconComponent = isVolumeOn ? Volume2 : VolumeX;

  return (
    <IconContainer onClick={() => mainStateDispatch({ type: "TOGGLE_VOLUME" })}>
      <IconComponent color={iconColor} size={CORNER_ICON_SIZE} />
    </IconContainer>
  );
};

const VolumeContainer = styled.div`
  cursor: pointer;

  background-color: transparent;

  border: none;

  display: flex;
  align-items: center;
  justify-content: center;
`;
