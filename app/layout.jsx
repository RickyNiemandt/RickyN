import "./globals.css";
import { Inter } from "next/font/google";
import LenisProvider from "@/components/LenisProvider";
import BackgroundMesh from "@/components/BackgroundMesh";
import PageTransition from "@/components/PageTransition";
import Nav from "@/components/Nav";

const inter = Inter({ subsets: ["latin"], variable: "--font-sans" });

export const metadata = {
  title: "Charm Systems — AI-Powered Creative & Business App Studio",
  description:
    "Charm Systems is an AI-powered creative and business app studio based in South Africa, building fast, responsive, high-craft digital experiences.",
};

export const viewport = {
  themeColor: "#000000",
  width: "device-width",
  initialScale: 1,
  // Allow pinch-zoom for accessibility while keeping a stable base layout
  maximumScale: 5,
};

export default function RootLayout({ children }) {
  return (
    <html lang="en" className={inter.variable}>
      <body className="min-h-screen antialiased">
        <LenisProvider>
          <BackgroundMesh />
          <Nav />
          <PageTransition>{children}</PageTransition>
        </LenisProvider>
      </body>
    </html>
  );
}
