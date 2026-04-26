"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { Sparkles } from "lucide-react";

export default function Navbar() {
  const pathname = usePathname();

  const nav = [
    { name: "Home", href: "/" },
    { name: "Create", href: "/create" },
  ];

  return (
    <div className="sticky top-0 z-50 w-full border-b border-white/10 bg-[#020617]/80 backdrop-blur-md">
      <div className="mx-auto flex h-14 max-w-4xl items-center justify-between px-5">
        
        {/* Logo */}
        <Link href="/" className="flex items-center gap-2 font-bold text-white">
          <Sparkles className="h-5 w-5 text-purple-400" />
          Poll Party
        </Link>

        {/* Nav Links */}
        <div className="flex items-center gap-4 text-sm">
          {nav.map((item) => {
            const active = pathname === item.href;
            return (
              <Link
                key={item.href}
                href={item.href}
                className={`transition ${
                  active
                    ? "text-white"
                    : "text-gray-400 hover:text-white"
                }`}
              >
                {item.name}
              </Link>
            );
          })}
        </div>
      </div>
    </div>
  );
}