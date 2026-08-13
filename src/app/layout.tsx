import type { Metadata, Viewport } from "next";
import { Fraunces, Karla } from "next/font/google";
import { ServiceWorkerRegistration } from "@/components/ServiceWorkerRegistration";
import "./globals.css";

const fraunces = Fraunces({
  variable: "--font-fraunces",
  subsets: ["latin"],
  weight: ["500", "600", "700"],
});

const karla = Karla({
  variable: "--font-karla",
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
});

export const metadata: Metadata = {
  title: "Centro de Servicio",
  description:
    "Hub personal de herramientas para llamamientos de La Iglesia de Jesucristo de los Santos de los Últimos Días.",
};

export const viewport: Viewport = {
  themeColor: "#0E3B43",
  width: "device-width",
  initialScale: 1,
  viewportFit: "cover",
};

export default function RootLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <html lang="es" className={`${fraunces.variable} ${karla.variable}`}>
      <body className="min-h-svh bg-linen text-ink antialiased">
        {children}
        <ServiceWorkerRegistration />
      </body>
    </html>
  );
}
