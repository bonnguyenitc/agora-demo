import "../styles/globals.css";
import { ChakraProvider } from "@chakra-ui/react";
import { QueryClient, QueryClientProvider, useQuery } from "react-query";
import theme from "../src/theme";

const queryClient = new QueryClient();

function MyApp({ Component, pageProps }) {
  return (
    <QueryClientProvider client={queryClient}>
      <ChakraProvider theme={theme}>
        <Component {...pageProps} />
      </ChakraProvider>
    </QueryClientProvider>
  );
}

export default MyApp;
