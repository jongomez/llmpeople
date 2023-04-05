import { Info, X } from "@tamagui/lucide-icons";
import { Anchor, Button, Dialog, H2, ScrollView, Text, Unspaced, styled } from "tamagui";

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

function About() {
  return (
    <ScrollView maxWidth={500} maxHeight="80vh" alignItems="center">
      <AboutH2 mt="40px">Data Processing Policy</AboutH2>
      <AboutText>
        This website uses the OpenAI API. They collect data.{" "}
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
        This website does not collect any data. This means none of the information sent to OpenAI or
        Google is stored by gpthangout. The same goes for any data received from these APIs.
      </AboutText>

      <AboutH2>About</AboutH2>
      <AboutText>
        Hello! I'm a software developer from Portugal. I started this project because I'm currently
        looking for a new job, and wanted something else to do besides sending resumes and grinding
        leetcode. More updates to come!
      </AboutText>

      <AboutH2>Contact</AboutH2>
      <AboutText>
        Please get in touch if you have any questions, suggestions, or anything really:{" "}
        <AboutAnchor href="mailto:hangoutgpt@gmail.com">hangoutgpt@gmail.com</AboutAnchor>
      </AboutText>
    </ScrollView>
  );
}

type AboutDialogProps = {
  aboutDialogTriggerRef: React.RefObject<HTMLButtonElement>;
};

export function AboutDialog({ aboutDialogTriggerRef }: AboutDialogProps) {
  const size = "$2";
  const iconColor = "black";

  return (
    <Dialog modal>
      <Dialog.Trigger asChild>
        <Button
          ref={aboutDialogTriggerRef}
          position={"fixed" as any}
          top={10}
          left={10}
          size={30}
          backgroundColor={"none"}
          borderColor="none"
          // focusStyle={{ borderColor: "none", backgroundColor = "none" }}
          unstyled
          icon={<Info color={iconColor} size={size} />}
        />
      </Dialog.Trigger>

      {/* <Adapt when="sm" platform="touch">
        <Sheet zIndex={200000} modal dismissOnSnapToBottom>
          <Sheet.Frame padding="$4" space>
            <Adapt.Contents />
          </Sheet.Frame>
          <Sheet.Overlay />
        </Sheet>
      </Adapt> */}

      <Dialog.Portal>
        <Dialog.Overlay
          key="overlay"
          animation="quick"
          o={0.5}
          enterStyle={{ o: 0 }}
          exitStyle={{ o: 0 }}
        />

        <Dialog.Content
          bordered
          elevate
          key="content"
          animation={[
            "quick",
            {
              opacity: {
                overshootClamping: true,
              },
            },
          ]}
          enterStyle={{ x: 0, y: -20, opacity: 0, scale: 0.9 }}
          exitStyle={{ x: 0, y: 10, opacity: 0, scale: 0.95 }}
          space
        >
          <Unspaced>
            <Dialog.Close asChild>
              <Button
                pos="absolute"
                t="$5"
                r="$5"
                size="$2"
                circular
                icon={X}
                color="black"
                backgroundColor="white"
                zIndex={100}
              />
            </Dialog.Close>
          </Unspaced>

          <About />
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog>
  );
}
