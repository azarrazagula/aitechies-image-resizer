import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";

const inter = Inter({
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700", "800"],
  variable: "--font-inter",
  display: "swap",
});

export const metadata: Metadata = {
  title: "AI Techies - Free Social Media Image Resizer",
  description:
    "Resize your images for Instagram, LinkedIn, Twitter, Facebook, YouTube, and WhatsApp instantly. 100% client-side, secure and private.",
  keywords:
    "image resizer, social media resizer, instagram post size, linkedin banner size, resize image online, free image resizer",
  authors: [{ name: "AI Techies" }],
  openGraph: {
    title: "AI Techies - Free Social Media Image Resizer",
    description:
      "Resize your images for social media platforms instantly. 100% client-side, free and secure.",
    type: "website",
  },
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="en" className={`${inter.variable} h-full`}>
      <head>
        <meta charSet="utf-8" />
        <meta name="viewport" content="width=device-width, initial-scale=1" />
        <link rel="icon" href="https://aitechies.in/favicon.ico" />
      </head>
      <body className="flex flex-col h-full bg-[#0D0D0D] text-[#F8FAFC]">
        {children}
      </body>
    </html>
  );
}
