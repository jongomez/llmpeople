import { Loader2 } from "lucide-react";
import React, { CSSProperties } from "react";

// Using the style prop instead of styled components. Here's why:
// - When using styled components, the css class takes a while to load.
// - This causes the spinner to show for a split second in the incorrect position.

const spinnerContainerStyles: CSSProperties = {
  display: "flex",
  flexDirection: "column",
  position: "fixed",
  top: 0,
  left: 0,
  width: "100vw",
  height: "100vh",
  backgroundColor: "rgba(255, 255, 255, 0.7)",
  zIndex: 1000000,
  // backgroundColor: "#00001a",
};

const spinnerStyles: CSSProperties = {
  animation: "spin 1s linear infinite",
  margin: "auto",
  // color: "white",
};

type SpinnerProps = {
  isLoading: boolean;
};

export const Loading: React.FC<SpinnerProps> = ({ isLoading }) => {
  if (!isLoading) {
    return null;
  }

  return (
    <div style={spinnerContainerStyles}>
      <Loader2 size={35} style={spinnerStyles} />
    </div>
  );
};
