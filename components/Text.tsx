import styled from "styled-components";

type TextProps = {
  children?: React.ReactNode;
};

export const Text = styled.p<TextProps>`
  font-size: 16px;
`;
