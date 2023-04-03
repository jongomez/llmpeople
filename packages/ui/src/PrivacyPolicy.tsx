import { useLayoutEffect, useState } from "react";
import { Anchor, Button, Text, XStack } from "tamagui";
import { useGameContext } from "./GameContextProvider";

interface PrivacyPolicyProps {}

export const PrivacyPolicy: React.FC<PrivacyPolicyProps> = () => {
  const { acceptPrivacyPolicy, hasAcceptedPrivacyPolicy } = useGameContext();
  const lineHeight = 20;
  const [showPrivacyPolicy, setShowPrivacyPolicy] = useState(false);

  // useLayoutEffect is used here to avoid a flash of the privacy policy.
  useLayoutEffect(() => {
    setShowPrivacyPolicy(!hasAcceptedPrivacyPolicy);
  }, [hasAcceptedPrivacyPolicy]);

  return (
    <XStack
      position={"absolute"}
      bottom={12}
      left={0}
      right={0}
      jc="center"
      display={showPrivacyPolicy ? "flex" : "none"}
    >
      <XStack
        borderWidth={1}
        borderColor="#dee2e6"
        borderRadius={10}
        maxWidth="100%"
        width="500px"
        padding={10}
        ai="center"
        backgroundColor="white"
      >
        <Text mr={12} textAlign="center" lineHeight={lineHeight}>
          This website uses the the OpenAI API. They collect data. Be sure to read and accept the{" "}
          <Anchor
            onPress={() => window.open("/about", "_blank")}
            lineHeight={lineHeight}
            color="#007bff"
            cursor="pointer"
          >
            data processing policy.
          </Anchor>
        </Text>
        <Button
          onPress={() => acceptPrivacyPolicy()}
          marginTop={10}
          backgroundColor="$blue10"
          color="white"
          hoverStyle={{ backgroundColor: "$blue8" }}
        >
          I Accept
        </Button>
      </XStack>
    </XStack>
  );
};
