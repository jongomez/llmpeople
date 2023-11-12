import styled from "styled-components";

// Exporting HEADER_HEIGHT as a constant
export const HEADER_HEIGHT = 40;

// Type definition for the Anchor properties
interface AnchorProps {
  href: string;
  cursor?: string;
  fontWeight?: string | number;
  fontSize?: string;
  children: React.ReactNode;
}

export const Header: React.FC = () => {
  return (
    <HeaderContainer>
      <StyledAnchor href="/" cursor="pointer" fontWeight="bold" fontSize="24px">
        llmpeople
      </StyledAnchor>
    </HeaderContainer>
  );
};

const StyledAnchor = styled.a<AnchorProps>`
  cursor: ${(props) => props.cursor || "auto"};
  font-weight: ${(props) => props.fontWeight || "normal"};
  font-size: ${(props) => props.fontSize || "inherit"};
`;

const HeaderContainer = styled.div`
  position: fixed;
  background-color: rgba(255, 255, 255, 0.8);
  width: 100vw;
  z-index: 1000;
  justify-content: center;
  align-items: center;
  height: ${HEADER_HEIGHT}px;
  box-shadow: 0 0 7px rgba(0, 0, 0, 0.2);
`;
