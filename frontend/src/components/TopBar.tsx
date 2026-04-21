import React from "react";
import { Settings } from "lucide-react";

export const TopBar: React.FC = () => {
  return (
    <header className="w-full top-0 sticky z-50 shadow-[0_4px_20px_rgba(123,97,255,0.15)] bg-[#101417] flex justify-between items-center px-6 py-4">
      <div className="flex items-center gap-3">
        <div className="w-10 h-10 rounded-full bg-primary-container flex items-center justify-center overflow-hidden border border-primary/20">
          <img
            alt="Player Profile"
            className="w-full h-full object-cover"
            src="https://lh3.googleusercontent.com/aida-public/AB6AXuBnmbk4MpewHk1nzH-YB-Q2sK_bUbLuiVfVbo-JdaZdkb0K_YOw0gPB4ZFrqTUJb_EZbaSiyhSR6QkzM_PvxHaM8z1oBdRLq2L-8UFmV4SLCt3cITJEsyyjPweKv0bumFkDhh8_9ySn4jMP6Zn4Cl6fTJVwOm9tX01UCV4ccENJA23sz73B02lUG32ng4Qb6A8A88Aca465Fk-21YJAmX2PHuIukK-lWkVAarZpp_0DG9e-tUdwFfrXMXRp7oSvTJuT6wNf-4OA41aN"
          />
        </div>
        <span className="text-[#c9bfff] font-black tracking-tighter text-2xl font-headline">
          WIZARD
        </span>
      </div>
      <div className="flex items-center gap-4">
        <div className="bg-surface-container-high px-4 py-1.5 rounded-full flex items-center gap-2 border border-outline-variant/20">
          <span className="text-secondary-fixed font-bold">1,250</span>
          <span className="text-lg">🪙</span>
        </div>
        <button className="text-[#c9bfff] hover:bg-[#c9bfff]/10 p-2 rounded-full transition-colors active:scale-95 duration-200">
          <Settings className="w-6 h-6" />
        </button>
      </div>
    </header>
  );
};
