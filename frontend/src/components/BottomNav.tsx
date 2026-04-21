import React from "react";
import { Link, useLocation } from "react-router-dom";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export const BottomNav: React.FC = () => {
  const location = useLocation();
  const isArena = location.pathname === "/arena";

  const navItems = [
    { label: "Play", icon: "playing_cards", href: "/", active: !isArena },
    { label: "Friends", icon: "group", href: "#", active: false },
    { label: "Decks", icon: "style", href: "#", active: false },
    { label: "Ranks", icon: "leaderboard", href: "#", active: false },
  ];

  return (
    <nav className="fixed bottom-0 left-0 w-full z-50 flex justify-around items-center px-4 pb-6 pt-3 bg-[#101417]/90 backdrop-blur-xl border-t border-[#c9bfff]/15 rounded-t-4xl shadow-[0_-10px_40px_rgba(0,0,0,0.5)]">
      {navItems.map((item) => (
        <Link
          key={item.label}
          to={item.href}
          className={cn(
            "flex flex-col items-center justify-center px-5 py-2 duration-150 transition-all active:scale-90",
            item.active
              ? "bg-[#c9bfff] text-[#101417] rounded-xl shadow-[0_0_15px_rgba(201,191,255,0.4)]"
              : "text-[#c9bfff]/50 hover:text-[#ffe16d]"
          )}
        >
          <span className="material-symbols-outlined">{item.icon}</span>
          <span className="font-['Inter'] text-[10px] font-bold uppercase tracking-widest mt-1">
            {item.label}
          </span>
        </Link>
      ))}
    </nav>
  );
};
