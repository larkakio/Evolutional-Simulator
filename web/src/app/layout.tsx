import type { Metadata } from "next";
import { IBM_Plex_Mono, Orbitron } from "next/font/google";
import { headers } from "next/headers";
import { cookieToInitialState } from "wagmi";

import { Providers } from "@/components/providers";
import { config } from "@/lib/wagmi/config";

import "./globals.css";

const display = Orbitron({
  subsets: ["latin"],
  variable: "--font-display",
  weight: ["400", "600", "700"],
});

const mono = IBM_Plex_Mono({
  subsets: ["latin"],
  variable: "--font-mono-ui",
  weight: ["400", "500"],
});

const siteUrl =
  process.env.NEXT_PUBLIC_SITE_URL ??
  "https://evolutional-simulator.vercel.app";

export const metadata: Metadata = {
  title: "Evolution Simulator",
  description:
    "Swipe-to-evolve grid runner on Base. Daily on-chain check-in with builder attribution.",
  metadataBase: new URL(siteUrl),
  openGraph: {
    title: "Evolution Simulator",
    description: "Cyberpunk evolution grid — built for Base App.",
    images: [{ url: "/app-thumbnail.jpg", width: 1200, height: 630 }],
  },
  icons: {
    icon: "/app-icon.jpg",
    apple: "/app-icon.jpg",
  },
};

export default async function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  const cookie = (await headers()).get("cookie");
  const initialState = cookieToInitialState(config, cookie ?? undefined);
  const baseAppId =
    process.env.NEXT_PUBLIC_BASE_APP_ID ?? "69e880d30521103d06399224";

  return (
    <html
      lang="en"
      className={`${display.variable} ${mono.variable} h-full antialiased`}
    >
      <head>
        <meta name="base:app_id" content={baseAppId} />
        <meta name="viewport" content="width=device-width, initial-scale=1, maximum-scale=1, viewport-fit=cover" />
      </head>
      <body className="min-h-full">
        <Providers initialState={initialState}>{children}</Providers>
      </body>
    </html>
  );
}
