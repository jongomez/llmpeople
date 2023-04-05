import { GameContextProvider } from "@my/ui/src/GameContextProvider";
import "@tamagui/core/reset.css";
import "@tamagui/font-inter/css/400.css";
import "@tamagui/font-inter/css/700.css";
import { NextThemeProvider, useRootTheme } from "@tamagui/next-theme";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { Provider } from "app/provider";
import Head from "next/head";
import "raf/polyfill";
import React, { startTransition } from "react";
import type { SolitoAppProps } from "solito";

// Taken from: https://tanstack.com/query/latest/docs/react/overview
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: SolitoAppProps) {
  return (
    <>
      <Head>
        <title>GPT Hangout</title>
        <meta name="description" content="Hangout with GPT characters" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <ThemeProvider>
        <GameContextProvider>
          <QueryClientProvider client={queryClient}>
            <Component {...pageProps} />
          </QueryClientProvider>
        </GameContextProvider>
      </ThemeProvider>
    </>
  );
}

function ThemeProvider({ children }: { children: React.ReactNode }) {
  const [theme, setTheme] = useRootTheme();

  return (
    <NextThemeProvider
      onChangeTheme={(next) => {
        startTransition(() => {
          setTheme(next);
        });
      }}
    >
      <Provider disableRootThemeClass defaultTheme={theme}>
        {children}
      </Provider>
    </NextThemeProvider>
  );
}

export default MyApp;
