import { Anchor, XStack } from "tamagui";

export const HEADER_HEIGHT = 40;

/*

Example:
https://github.com/tamagui/tamagui/blob/cd6e5f9e89ab87db27954fbff426cf23153db059/apps/site/components/QuickNav.tsx

*/

export const Header = () => {
  return (
    <XStack
      position={"fixed" as any}
      backgroundColor="rgba(255,255,255,0.8)"
      // borderBottomWidth={1}
      width="100vw"
      zIndex={1000}
      jc="center"
      // @ts-ignore
      style={{ boxShadow: "0 0 7px rgba(0,0,0,0.2)" as any }}
      ai="center"
      height={HEADER_HEIGHT}
    >
      <Anchor href="/" cursor="pointer" fontWeight="bold" fontSize="$5">
        gpthangout
      </Anchor>
    </XStack>
  );
};
