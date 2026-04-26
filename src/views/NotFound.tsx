"use client";

import { usePathname } from "next/navigation";
import { useEffect } from "react";
import Link from "next/link";
import { motion } from "framer-motion";

export default function NotFound() {
  const pathname = usePathname();

  useEffect(() => {
    console.error("404 Error:", pathname);
  }, [pathname]);

  return (
    <div className="app-bg flex min-h-screen items-center justify-center px-6">
      <motion.div
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        className="card text-center max-w-md w-full space-y-6 p-8"
      >
        {/* Emoji */}
        <div className="text-5xl">🚫</div>

        {/* Title */}
        <h1 className="text-4xl font-black text-white">404</h1>

        {/* Message */}
        <p className="text-gray-400 text-sm">
          This page doesn’t exist… or your friend broke it 😂
        </p>

        {/* Button */}
        <Link
          href="/"
          className="inline-block rounded-xl bg-gradient-primary px-6 py-3 font-semibold text-white shadow-glow hover:scale-105 transition"
        >
          Go back home
        </Link>
      </motion.div>
    </div>
  );
}