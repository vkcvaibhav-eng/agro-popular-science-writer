import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Agro Popular Science Writer",
  description:
    "Plan and draft subject-first agricultural popular-science articles with evidence gates, author frameworks and APA 7 references.",
  icons: {
    icon: "/favicon.svg",
    shortcut: "/favicon.svg",
  },
};

export default function RootLayout({ children }: Readonly<{ children: React.ReactNode }>) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
