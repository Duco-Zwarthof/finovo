import type { Metadata } from "next";
import {
  Geist,
  Geist_Mono,
} from "next/font/google";

import AutomaticLocalSnapshots from "@/components/shared/AutomaticLocalSnapshots";

import "./globals.css";

const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "Finovo",
  description:
    "Personal finance intelligence and planning.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${geistSans.variable} ${geistMono.variable} h-full antialiased`}
    >
      <body className="min-h-full flex flex-col">
        <AutomaticLocalSnapshots />
        {children}
      </body>
    </html>
  );
}
