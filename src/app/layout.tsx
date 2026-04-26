import type { ReactNode } from "react";
import "./globals.css";
import Navbar from "@/components/Navbar";

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body className="app-bg">
        <Navbar />
        <main className="pt-14">{children}</main>
      </body>
    </html>
  );
}