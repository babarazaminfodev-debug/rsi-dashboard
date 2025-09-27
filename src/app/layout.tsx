import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Providers from "./providers";

const inter = Inter({ subsets: ["latin"] });

export const metadata: Metadata = {
  title: "RSI Realtime Trading Dashboard",
  description: "A realtime dashboard that displays RSI alerts, allows users to log paper trades, and tracks the status of open and closed trades with a full backend.",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className={`${inter.className} bg-gray-900 text-gray-100`}>
        <Providers>
          {children}
        </Providers>
      </body>
    </html>
  );
}
