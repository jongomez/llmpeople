import { CORNER_ICON_SIZE } from "@/lib/constants";
import { MainStateDispatch } from "@/lib/types";
import { InfoIcon } from "lucide-react";
import { FC } from "react";
import styled from "styled-components";
import { IconContainer } from "./IconContainer";
import { Modal } from "./Modal";

function About() {
  return (
    <AboutContainer>
      <AboutH2>Data Processing Policy</AboutH2>
      <AboutText>
        This website uses the OpenAI API. They collect data.{" "}
        <AboutAnchor href="https://openai.com/policies/api-data-usage-policies" target="_blank">
          Check out their API data usage policies.
        </AboutAnchor>
      </AboutText>
      <AboutText>
        This website also uses Google&apos;s text to speech API.{" "}
        <AboutAnchor
          href="https://cloud.google.com/text-to-speech/docs/data-logging"
          target="_blank"
        >
          According to this page, they do not collect data.
        </AboutAnchor>
      </AboutText>
      <AboutText>
        No data is collected by the llmpeople servers. This means none of the information sent to
        OpenAI or Google is stored by llmpeople. The same goes for any data received from their
        APIs.
      </AboutText>

      <AboutH2>About</AboutH2>

      <AboutText>
        This is a personal project I made just for fun - it&apos;s 100% free and open source.{" "}
        <AboutAnchor href="https://github.com/jongomez/llmpeople" target="_blank">
          Check out the source code on github.
        </AboutAnchor>
      </AboutText>

      <AboutH2>Contact</AboutH2>
      <AboutText style={{ paddingBottom: 40 }}>
        Please get in touch if you have any questions, suggestions, or anything really:{" "}
        <AboutAnchor href="mailto:hangoutgpt@gmail.com">hangoutgpt@gmail.com</AboutAnchor>
      </AboutText>
    </AboutContainer>
  );
}

type AboutModalProps = {
  isOpen: boolean;
  mainStateDispatch: MainStateDispatch;
};

export const AboutModal: FC<AboutModalProps> = ({ isOpen, mainStateDispatch }) => {
  return (
    <>
      <IconContainer onClick={() => mainStateDispatch({ type: "TOGGLE_ABOUT_MODAL" })}>
        <InfoIcon size={CORNER_ICON_SIZE} />
      </IconContainer>
      {isOpen && (
        <Modal onClose={() => mainStateDispatch({ type: "TOGGLE_ABOUT_MODAL" })}>
          <About />
        </Modal>
      )}
    </>
  );
};

const AboutText = styled.p`
  margin-bottom: 10px;
`;

const AboutAnchor = styled.a`
  text-decoration: none;
  &:hover {
    text-decoration: underline;
  }
`;

const AboutH2 = styled.h2`
  margin-top: 20px;
  margin-bottom: 10px;
`;

const AboutContainer = styled.div`
  max-width: 100%;
  max-height: 80vh;
  width: 500px;
  align-items: center;
  background-color: white;
  flex-direction: column;
  display: flex;
`;
