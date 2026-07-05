import type { Metadata } from "next";
import { Cinzel, Spectral, UnifrakturCook, Pirata_One } from "next/font/google";
import "./globals.css";

const cinzel = Cinzel({
  variable: "--font-cinzel",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700", "900"],
});

const spectral = Spectral({
  variable: "--font-spectral",
  subsets: ["latin"],
  weight: ["300", "400", "500", "600", "700"],
  style: ["normal", "italic"],
});

const unifraktur = UnifrakturCook({
  variable: "--font-blackletter",
  subsets: ["latin"],
  weight: ["700"],
});

const pirata = Pirata_One({
  variable: "--font-pirata",
  subsets: ["latin"],
  weight: ["400"],
});

export const metadata: Metadata = {
  title: "Oathforge — Character Card Generator",
  description:
    "Generate ornate RPG character cards with AI art, stats, and lore.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html
      lang="en"
      className={`${cinzel.variable} ${spectral.variable} ${unifraktur.variable} ${pirata.variable} h-full antialiased`}
    >
      <body className="min-h-full">{children}</body>
    </html>
  );
}
