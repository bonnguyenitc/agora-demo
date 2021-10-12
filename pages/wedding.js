import dynamic from "next/dynamic";

const Main = dynamic(
  () => {
    return import("../src/components/Main");
  },
  { ssr: false }
);

export default function Wedding() {
  return <Main />;
}
