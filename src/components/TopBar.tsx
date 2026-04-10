"use client";

import Image from "next/image";

interface TopBarProps {
  showProfileInfo?: boolean;
}

export default function TopBar({ showProfileInfo = true }: TopBarProps) {
  return (
    <header className="w-full top-0 sticky z-50 shadow-[0_4px_20px_rgba(123,97,255,0.15)] bg-[#101417] flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        {showProfileInfo && (
          <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-primary/20 outline outline-2 outline-primary/20">
            <Image
              alt="Player Profile"
              className="w-full h-full object-cover"
              src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnmbk4MpewHk1nzH-YB-Q2sK_bUbLuiVfVbo-JdaZdkb0K_YOw0gPB4ZFrqTUJb_EZbaSiyhSR6QkzM_PvxHaM8z1oBdRLq2L-8UFmV4SLCt3cITJEsyyjPweKv0bumFkDhh8_9ySn4jMP6Zn4Cl6fTJVwOm9tX01UCV4ccENJA23sz73B02lUG32ng4Qb6A8A88Aca465Fk-21YJAmX2PHuIukK-lWkVAarZpp_0DG9e-tUdwFfrXMXRp7oSvTJuT6wNf-4OA41aN"
              width={40}
              height={40}
            />
          </div>
        )}
        <div className={showProfileInfo ? "hidden md:block" : ""}>
          {showProfileInfo && (
            <p className="font-label text-xs text-on-surface-variant uppercase tracking-tighter leading-tight">
              Archmage
            </p>
          )}
          <span className="text-[#c9bfff] font-black tracking-tighter text-2xl font-headline uppercase leading-none">
            WIZARD
          </span>
        </div>
      </div>

      <div className="flex items-center gap-4">
        <div className="bg-surface-container-high px-4 py-1.5 rounded-full flex items-center gap-2 border border-outline-variant/20 active:scale-95 duration-200 cursor-pointer">
          <span className="text-secondary-fixed font-headline font-bold text-lg">
            1,250 🪙
          </span>
        </div>
        <button className="material-symbols-outlined text-[#c9bfff] hover:bg-[#c9bfff]/10 p-2 rounded-full transition-colors active:scale-95 duration-200">
          settings
        </button>
      </div>
    </header>
  );
}
