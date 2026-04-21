import React from "react";
import { clsx, type ClassValue } from "clsx";
import { twMerge } from "tailwind-merge";

function cn(...inputs: ClassValue[]) {
  return twMerge(clsx(inputs));
}

export type Suit = "flare" | "potted_plant" | "star" | "nearby" | "auto_awesome";

interface WizardCardProps {
  value: string | number;
  suit?: Suit;
  isWizard?: boolean;
  isJester?: boolean;
  className?: string;
}

const suitIcons: Record<Suit, string> = {
  flare: "flare",
  potted_plant: "potted_plant",
  star: "star",
  nearby: "nearby",
  auto_awesome: "auto_awesome",
};

export const WizardCard: React.FC<WizardCardProps> = ({
  value,
  suit,
  isWizard,
  isJester,
  className,
}) => {
  const isSpecial = isWizard || isJester;

  const textColor = isWizard
    ? "text-secondary-fixed"
    : isJester
    ? "text-tertiary"
    : suit === "flare"
    ? "text-primary"
    : suit === "potted_plant"
    ? "text-on-surface"
    : suit === "star"
    ? "text-secondary-fixed"
    : "text-error";

  return (
    <div
      className={cn(
        "w-36 h-56 bg-surface-container-highest rounded-2xl border border-outline-variant/50 shadow-2xl flex flex-col p-4 cursor-pointer transition-all duration-300 group",
        isWizard && "border-2 border-secondary-fixed shadow-[0_0_30px_rgba(255,225,109,0.15)]",
        className
      )}
    >
      <div className="flex justify-between items-start">
        <span className={cn("font-headline text-2xl font-bold", textColor)}>{value}</span>
        {suit && (
          <span className={cn("material-symbols-outlined text-xl", textColor)}>
            {suitIcons[suit]}
          </span>
        )}
      </div>
      <div className="grow flex items-center justify-center">
        {suit && (
          <span
            className={cn(
              "material-symbols-outlined text-6xl opacity-20 group-hover:opacity-100 transition-opacity",
              isSpecial && "opacity-100",
              textColor
            )}
          >
            {suitIcons[suit]}
          </span>
        )}
      </div>
      <div className="flex justify-between items-end rotate-180">
        <span className={cn("font-headline text-2xl font-bold", textColor)}>{value}</span>
        {suit && (
          <span className={cn("material-symbols-outlined text-xl", textColor)}>
            {suitIcons[suit]}
          </span>
        )}
      </div>
    </div>
  );
};
