import type { Metadata } from "next";
import { Space_Grotesk, Inter, Manrope } from "next/font/google";
import "./globals.css";
import { LiffProvider } from "@/lib/liff";

const spaceGrotesk = Space_Grotesk({
  variable: "--font-headline",
  subsets: ["latin"],
});

const inter = Inter({
  variable: "--font-body",
  subsets: ["latin"],
});

const manrope = Manrope({
  variable: "--font-label",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "WIZARD",
  description: "A magical card game for LINE LIFF",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  // In a real scenario, LIFF_ID would come from env
  const liffId = process.env.NEXT_PUBLIC_LIFF_ID || "mock-liff-id";

  return (
    <html
      lang="en"
      className={`${spaceGrotesk.variable} ${inter.variable} ${manrope.variable} h-full antialiased dark`}
    >
      <body className="min-h-full flex flex-col bg-background text-on-background">
        <LiffProvider liffId={liffId}>
          {children}
        </LiffProvider>
      </body>
    </html>
  );
}
