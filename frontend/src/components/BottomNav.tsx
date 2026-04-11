"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";

export default function BottomNav() {
  const pathname = usePathname();

  const navItems = [
    { label: "Play", icon: "playing_cards", href: "/", activeIcon: "playing_cards" },
    { label: "Friends", icon: "group", href: "#" },
    { label: "Decks", icon: "style", href: "#" },
    { label: "Ranks", icon: "leaderboard", href: "#" },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#101417]/90 backdrop-blur-xl border-t border-[#c9bfff]/15 rounded-t-[2rem] shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => {
        const isActive = pathname === item.href;
        return (
          <Link
            key={item.label}
            href={item.href}
            className={`flex flex-col items-center justify-center px-5 py-2 transition-all active:scale-90 duration-150 ${
              isActive
                ? "bg-[#c9bfff] text-[#101417] rounded-xl shadow-[0_0_15px_rgba(201,191,255,0.4)]"
                : "text-[#c9bfff]/50 hover:text-[#ffe16d]"
            }`}
          >
            <span
              className="material-symbols-outlined"
              style={{
                fontVariationSettings: isActive ? "'FILL' 1" : undefined,
              }}
            >
              {item.icon}
            </span>
            <span className="font-body text-[10px] font-bold uppercase tracking-widest mt-1">
              {item.label}
            </span>
          </Link>
        );
      })}
    </nav>
  );
}
