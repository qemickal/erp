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

const spaceGrotesk = localFont({
  src: "./fonts/space-grotesk-latin-wght-normal.woff2",
  variable: "--font-grotesk",
  weight: "300 700",
  display: "swap",
});

const firaMono = localFont({
  src: [
    { path: "./fonts/fira-mono-latin-400-normal.woff2", weight: "400", style: "normal" },
    { path: "./fonts/fira-mono-latin-700-normal.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-fira-mono",
  display: "swap",
});

export const metadata: Metadata = {
  title: "Mono Cromat & Co. — ERP",
  description: "Sistema de gestión del taller de artes gráficas Mono Cromat & Co. Cotizaciones, pedidos, producción, calidad y postventa.",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es">
      <body
        className={`${inter.variable} ${spaceGrotesk.variable} ${firaMono.variable} font-sans antialiased text-foreground bg-background`}
      >
        <Chrome>{children}</Chrome>
      </body>
    </html>
  );
}
