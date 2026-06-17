import type { Metadata } from "next";
import { Suspense } from "react";
import { GlobalLoadingProvider } from "@/components/GlobalLoading";
import "./globals.css";

export const metadata: Metadata = {
  metadataBase: new URL("https://www.aroundcities.my"),

  title: {
    default: "AroundCities",
    template: "%s | AroundCities",
  },

  description:
    "An independent local media feed about what is happening around Kuching.",

  keywords: [
    "Kuching",
    "Sarawak",
    "Malaysia",
    "AroundCities",
    "Kuching local media",
    "Kuching feed",
    "Carpenter Street",
    "Kuching Waterfront",
    "Local discovery",
  ],

  openGraph: {
    title: "AroundCities",
    description:
      "An independent local media feed about what is happening around Kuching.",
    url: "https://www.aroundcities.my",
    siteName: "AroundCities",
    locale: "en_MY",
    type: "website",
  },

  twitter: {
    card: "summary_large_image",
    title: "AroundCities",
    description:
      "An independent local media feed about what is happening around Kuching.",
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
      <body className="min-h-screen bg-neutral-950 text-neutral-100">
        <Suspense fallback={null}>
          <GlobalLoadingProvider>{children}</GlobalLoadingProvider>
        </Suspense>
      </body>
    </html>
  );
}
