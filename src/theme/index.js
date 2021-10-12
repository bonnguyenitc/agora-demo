// 1. Import `extendTheme`
import { extendTheme } from "@chakra-ui/react";
// 2. Call `extendTheme` and pass your custom values
const theme = extendTheme({
  colors: {
    "main.1": "#c4d3dc",
    "main.2": "#3f7893",
    "main.3": "#0d2d3e",
    "main.4": "#c53058",
    "main.5": "#5b122c",
  },
});

export default theme;
