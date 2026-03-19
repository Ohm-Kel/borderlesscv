import type { Metadata } from "next";
import { Montserrat, Merriweather, Ubuntu_Mono } from "next/font/google";

import { AppProviders } from "@/app/providers";

import "./globals.css";

const fontSans = Montserrat({
  subsets: ["latin"],
  variable: "--font-sans",
  weight: ["300", "400", "500", "600", "700"],
});

const fontSerif = Merriweather({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-serif",
});

const fontMono = Ubuntu_Mono({
  subsets: ["latin"],
  weight: ["400", "700"],
  variable: "--font-mono",
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
      <body className={`${fontSans.variable} ${fontSerif.variable} ${fontMono.variable} min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased`}>
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
