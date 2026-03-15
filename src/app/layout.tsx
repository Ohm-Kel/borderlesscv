import type { Metadata } from "next";

import { AppProviders } from "@/app/providers";

import "./globals.css";

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
      <body className="min-h-screen bg-[var(--background)] font-sans text-[var(--foreground)] antialiased">
        <AppProviders>{children}</AppProviders>
      </body>
    </html>
  );
}
