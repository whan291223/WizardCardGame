"use client";

interface WizardCardProps {
  value: string | number;
  suit: "flare" | "potted_plant" | "auto_awesome" | "nearby" | "star";
  color?: string;
  isWizard?: boolean;
  isJester?: boolean;
  isTrump?: boolean;
  className?: string;
}

export default function WizardCard({
  value,
  suit,
  color = "text-primary",
  isWizard,
  isJester,
  isTrump,
  className = "",
}: WizardCardProps) {
  const textColor = isWizard ? "text-secondary-fixed" : isJester ? "text-tertiary" : color;
  const borderColor = isTrump ? "border-secondary-fixed/30" : isWizard ? "border-primary" : "border-outline-variant/50";
  const shadow = isWizard ? "shadow-[0_0_40px_rgba(145,126,255,0.3)]" : isTrump ? "shadow-[0_0_30px_rgba(255,225,109,0.15)]" : "shadow-2xl";

  return (
    <div
      className={`w-36 h-56 bg-surface-container-highest rounded-2xl border flex flex-col p-4 cursor-pointer transition-all duration-300 group relative ${borderColor} ${shadow} ${className}`}
    >
      {isTrump && <div className="absolute inset-0 bg-secondary-fixed/5 rounded-xl"></div>}

      <div className="flex justify-between items-start">
        <span className={`${textColor} font-headline text-2xl font-bold`}>{value}</span>
        <span className={`material-symbols-outlined ${textColor} text-xl`}
          style={{ fontVariationSettings: suit === 'auto_awesome' || suit === 'star' ? "'FILL' 1" : undefined }}>
          {suit}
        </span>
      </div>

      <div className="flex-grow flex items-center justify-center">
        <span
          className={`material-symbols-outlined ${textColor} text-6xl ${
            isWizard ? "group-hover:scale-110" : "opacity-20 group-hover:opacity-100"
          } transition-all`}
          style={{ fontVariationSettings: suit === 'auto_awesome' || suit === 'star' ? "'FILL' 1" : undefined }}
        >
          {suit}
        </span>
      </div>

      <div className="flex justify-between items-end rotate-180">
        <span className={`${textColor} font-headline text-2xl font-bold`}>{value}</span>
        <span className={`material-symbols-outlined ${textColor} text-xl`}
          style={{ fontVariationSettings: suit === 'auto_awesome' || suit === 'star' ? "'FILL' 1" : undefined }}>
          {suit}
        </span>
      </div>
    </div>
  );
}
