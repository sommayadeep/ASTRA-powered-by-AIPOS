import AppShell from "@/components/app-shell";

export const metadata = {
  title: "AIPOS powered by ASTRA",
  description: "AIPOS powered by ASTRA — the autonomous AI operating system for thinkers and builders.",
};

export default function RootLayout(props: any) {
  const { children } = props;
  return (
    <html lang="en">
      <head>
        <link rel="stylesheet" href="/styles/tailwind.css" />
      </head>
      <body>
        <AppShell>{children}</AppShell>
      </body>
    </html>
  );
}
