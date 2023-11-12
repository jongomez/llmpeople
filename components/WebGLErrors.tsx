import styled from "styled-components";

export interface WebGLNotSupportedProps {}

// XXX: Not currently used.
export function WebGLMajorPerformanceCaveat({}: WebGLNotSupportedProps) {
  return (
    <Container>
      <TextHeader>WebGL performance is not great :(</TextHeader>
      <TextParagraph>
        This may mean your device does not have hardware acceleration enabled.
      </TextParagraph>
      {/* <TextHeader>Good luck {"\uD83D\uDCAA"}</TextHeader> */}
    </Container>
  );
}

export function WebGLNotSupported({}: WebGLNotSupportedProps) {
  return (
    <Container>
      <TextHeader>WebGL not supported :(</TextHeader>
      <TextParagraph>WebGL is necessary to play this game.</TextParagraph>
      <TextHeader>How can I fix this?</TextHeader>
      <TextParagraph>
        It&apos;s hard to pinpoint an exact cause and fix. My suggestion would be to search online
        for `&quot;`How to enable WebGL in`&quot;` followed by the device and/or browser you&apos;re
        using.
      </TextParagraph>
      <TextParagraph>
        For example: `&quot;`How to enable WebGL in iPhone Safari`&quot;`
      </TextParagraph>
      {/* <TextHeader>Good luck {"\uD83D\uDCAA"}</TextHeader> */}
    </Container>
  );
}

const Container = styled.div`
  display: flex;
  flex-direction: column;
  align-items: center;
  padding: 20px;
`;

const TextHeader = styled.h1`
  color: black;
  font-weight: bold;
  font-size: 25px;
`;

const TextParagraph = styled.p`
  color: black;
  text-align: center;
  margin-bottom: 4px;
`;
