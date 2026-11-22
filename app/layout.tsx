import type { Metadata } from "next";
import localFont from "next/font/local";
import "./globals.css";
import Chrome from "./chrome";

const inter = localFont({
  src: "./fonts/inter-latin-wght-normal.woff2",
  variable: "--font-inter",
  weight: "100 900",
  display: "swap",
});

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
