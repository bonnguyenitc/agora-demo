import dynamic from "next/dynamic";

const DemoComponent = dynamic(
  () => {
    return import("../src/components/Demo");
  },
  { ssr: false }
);

export default function Home() {
  return <DemoComponent />;
}
