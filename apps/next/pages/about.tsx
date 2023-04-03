import { Header } from "@my/ui/src";
import { HEADER_HEIGHT } from "@my/ui/src/Header";
import { Anchor, H2, Text, YStack, styled } from "tamagui";

const lineHeight = "1.4";

const AboutText = styled(Text, {
  name: "AboutText",
  lineHeight,
  marginBottom: 10,
});

const AboutAnchor = styled(Anchor, {
  name: "AboutAnchor",
  lineHeight,
});

const AboutH2 = styled(H2, {
  name: "AboutH2",
  marginTop: 20,
  marginBottom: 10,
});

export default function About() {
  return (
    <>
      <Header />
      <YStack alignItems="center" padding={20} marginTop={HEADER_HEIGHT}>
        <YStack maxWidth={500}>
          <AboutH2>Data Processing Policy</AboutH2>
          <AboutText>
            This website uses the OpenAI API. They collecy data.{" "}
            <AboutAnchor href="https://openai.com/policies/api-data-usage-policies" target="_blank">
              Check our their API data usage policies.
            </AboutAnchor>
          </AboutText>
          <AboutText>
            This website also uses Google's text to speech API.{" "}
            <AboutAnchor
              href="https://cloud.google.com/text-to-speech/docs/data-logging"
              target="_blank"
            >
              According to this page, they do not collect data.
            </AboutAnchor>
          </AboutText>
          <AboutText>
            I am personally not collecting any data. This means I don't store any of the information
            sent to OpenAI or Google. I also don't store any data received from these APIs.
          </AboutText>

          <AboutH2>About</AboutH2>
          <AboutText>
            Hello! I'm a software developer from Portugal. I made this website because I'm currently
            looking for a job, and wanted to do something besides sending resumes and grinding
            leetcode.
          </AboutText>

          <AboutH2>Contact</AboutH2>
          <AboutText>
            <AboutAnchor href="mailto:hangoutgpt@gmail.com">hangoutgpt@gmail.com</AboutAnchor>
          </AboutText>
        </YStack>
      </YStack>
    </>
  );
}
