import { GameContextProvider } from "@/components/GameContextProvider";
import { QueryClient, QueryClientProvider } from "@tanstack/react-query";
import { AppProps } from "next/app";
import Head from "next/head";
import "raf/polyfill";
import "./globalCSS.css";

// Taken from: https://tanstack.com/query/latest/docs/react/overview
const queryClient = new QueryClient();

function MyApp({ Component, pageProps }: AppProps) {
  return (
    <>
      <Head>
        <title>llmpeople</title>
        <meta name="description" content="Interact with 3d models powered by llms" />
        {/* <link rel="icon" href="/favicon.ico" /> */}
      </Head>
      <GameContextProvider>
        <QueryClientProvider client={queryClient}>
          <Component {...pageProps} />
        </QueryClientProvider>
      </GameContextProvider>
    </>
  );
}

export default MyApp;
