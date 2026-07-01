import type { Metadata } from "next";
import { Great_Vibes, Playfair_Display, Montserrat } from "next/font/google";
import "./globals.css";

const greatVibes = Great_Vibes({
  weight: "400",
  subsets: ["latin"],
  variable: "--font-script",
  display: "swap",
});

const playfair = Playfair_Display({
  weight: ["400", "600", "700"],
  style: ["normal", "italic"],
  subsets: ["latin"],
  variable: "--font-serif",
  display: "swap",
});

const montserrat = Montserrat({
  weight: ["300", "400", "500"],
  subsets: ["latin"],
  variable: "--font-sans",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Kelvin & Lora | August 10, 2026",
  description:
    "Join us as we celebrate the union of Kelvin Agena and Lora Candolesas. August 10, 2026 · Hillcreek Gardens Tagaytay.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html
      lang="en"
      className={`${greatVibes.variable} ${playfair.variable} ${montserrat.variable}`}
    >
      <body className="min-h-screen bg-[#F5F0E8] text-[#3D4A28]">
        {children}
      </body>
    </html>
  );
}
