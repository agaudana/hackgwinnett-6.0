import type { Metadata, Viewport } from "next";
import { Fredoka, Geist } from "next/font/google";
import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const fredoka = Fredoka({
  variable: "--font-fredoka",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "StudySprint — Your study plan in seconds",
  description:
    "Enter your subject, test topic, and how much time you have. StudySprint builds a focused study plan and a short practice quiz.",
};

export const viewport: Viewport = {
  themeColor: "#f5f8fa",
  width: "device-width",
  initialScale: 1,
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" className={`${geistSans.variable} ${fredoka.variable} bg-background`}>
      <body className="antialiased">{children}</body>
    </html>
  );
}
