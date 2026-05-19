import AppShell from "@/components/app-shell";

export const metadata = {
  title: "ASTRA powered by AIPOS",
  description: "ASTRA powered by AIPOS — the autonomous AI operating system for thinkers and builders.",
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
