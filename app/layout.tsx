import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";
import { Navbar } from "@/components/layout/Navbar";
import { Providers } from "./providers";

const geist = Geist({ variable: "--font-geist-sans", subsets: ["latin"] });

export const metadata: Metadata = {
  title: "MarketCap — Stock Prices, News & Portfolio",
  description: "Track live stock prices, read financial news, and manage your portfolio.",
};

export default function RootLayout({ children }: { children: React.ReactNode }) {
  return (
    <html lang="en" className={`${geist.variable} h-full antialiased`}>
      <body className="flex min-h-full flex-col bg-gray-50 dark:bg-gray-950">
        <Providers>
          <Navbar />
          <div className="flex-1">{children}</div>
          <footer className="border-t border-gray-200 py-4 text-center text-xs text-gray-400 dark:border-gray-800">
            All data provided for informational purposes only. Not financial advice. © {new Date().getFullYear()} MarketCap
          </footer>
        </Providers>
      </body>
    </html>
  );
}
