import type { Metadata } from "next";
import { Geist } from "next/font/google";
import "./globals.css";

const geist = Geist({
  subsets: ["latin"],
});

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aroundcities.my"),

  title: {
    default: "AroundCities",
    template: "%s | AroundCities",
  },

  description:
    "Discover photos, places, events and city life around Kuching, Sarawak.",

  keywords: [
    "Kuching",
    "Sarawak",
    "Malaysia",
    "AroundCities",
    "Kuching photos",
    "Kuching attractions",
    "Carpenter Street",
    "Kuching Waterfront",
    "Travel",
    "Photography",
  ],

  openGraph: {
    title: "AroundCities",
    description:
      "Discover photos, places, events and city life around Kuching, Sarawak.",
    url: "https://www.aroundcities.my",
    siteName: "AroundCities",
    locale: "en_MY",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AroundCities",
    description:
      "Discover photos, places, events and city life around Kuching, Sarawak.",
  },

  robots: {
    index: true,
    follow: true,
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body
        className={`${geist.className} min-h-screen bg-neutral-950 text-neutral-100`}
      >
        {children}
      </body>
    </html>
  );
}