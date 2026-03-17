import type { Metadata } from "next";
import { DM_Sans, DM_Serif_Display } from "next/font/google";

import { AppProviders } from "@/app/providers";

import "./globals.css";

const fontSans = DM_Sans({
  subsets: ["latin"],
  variable: "--font-sans",
});

const fontSerif = DM_Serif_Display({
  subsets: ["latin"],
  weight: "400",
  variable: "--font-serif",
});

export const metadata: Metadata = {
  title: {
    default: "BorderlessCV",
    template: "%s | BorderlessCV",
  },
  description:
    "BorderlessCV helps students and early-career professionals build country-aware, ATS-friendly resumes, tailor them to jobs, and track applications in one private workspace.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${fontSans.variable} ${fontSerif.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
