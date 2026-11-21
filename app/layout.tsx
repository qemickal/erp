import type { Metadata } from "next";
import { Inter } from "next/font/google";
import "./globals.css";
import Chrome from "./chrome";

const inter = Inter({ subsets: ["latin"], variable: "--font-inter" });

export const metadata: Metadata = {
  title: "ArteGráfico ERP",
  description: "Sistema de gestión para estudio de artes gráficas",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body className={`${inter.variable} font-sans antialiased text-foreground bg-background`}>
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
