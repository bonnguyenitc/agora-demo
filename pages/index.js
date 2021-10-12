import dynamic from "next/dynamic";

const Demo = dynamic(
  () => {
    return import("../src/components/Demo");
  },
  { ssr: false }
);

export default function Home() {
  return <Demo />;
}
