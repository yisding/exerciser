import type { Metadata } from "next";
import "./globals.css";

export const metadata: Metadata = {
  title: "Exerciser - Bay Area Fitness Classes",
  description: "Find and book fitness classes across the Bay Area from multiple studios",
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en">
      <body className="antialiased">
        {children}
      </body>
    </html>
  );
}
