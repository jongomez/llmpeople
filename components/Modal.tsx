import { X } from "lucide-react";
import { ReactNode, useEffect } from "react";
import styled, { keyframes } from "styled-components";

export const MODAL_PADDING = 20;

type OverlayProps = React.HTMLAttributes<HTMLDivElement> & {
  children?: ReactNode;
};

export const Overlay: React.FC<OverlayProps> = ({ children, ...props }) => (
  <StyledOverlay {...props}>{children}</StyledOverlay>
);

type ModalProps = {
  children?: ReactNode;
  onClose?: () => void;
};

export const Modal: React.FC<ModalProps> = ({ children, onClose }) => {
  // Handle click on overlay (outside modal content)
  const handleOverlayClick = (e: React.MouseEvent<HTMLDivElement>) => {
    if (onClose) onClose();
  };

  // When esc key is pressed, close the modal.
  useEffect(() => {
    const handleEsc = (e: KeyboardEvent) => {
      if (e.key === "Escape" && onClose) {
        onClose();
      }
    };

    window.addEventListener("keydown", handleEsc);

    return () => window.removeEventListener("keydown", handleEsc);
  }, [onClose]);

  return (
    <OverlayAndModalContainer>
      <Overlay onClick={handleOverlayClick} />
      <ModalContent className="active">
        <CloseIcon onClick={onClose} />
        {children}
      </ModalContent>
    </OverlayAndModalContainer>
  );
};

const CloseIcon = styled(X)`
  position: absolute;
  top: 15px;
  right: 15px;
  cursor: pointer;
`;

const OverlayAndModalContainer = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100vw;
  height: 100vh;
  display: block;

  z-index: 1000000;
`;

const StyledOverlay = styled.div`
  position: fixed;
  top: 0;
  left: 0;
  width: 100%;
  height: 100%;
  background-color: rgba(0, 0, 0, 0.5);
  transition: opacity 0.3s;
`;

const modalEnter = keyframes`
  from {
    transform: translate(-50%, -50%) scale(0);
  }
  to {
    transform: translate(-50%, -50%) scale(1);
  }
`;

const ModalContent = styled.div`
  max-width: 80vw;
  max-height: 80vh;

  position: fixed;
  top: 50%;
  left: 50%;
  transform: translate(-50%, -50%) scale(1);
  opacity: 1;

  padding: ${MODAL_PADDING}px;

  background-color: white;

  overflow: auto;

  padding-bottom: 40px;

  border-radius: 6px;

  animation: ${modalEnter} 0.3s forwards;
`;
