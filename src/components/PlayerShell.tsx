import React from "react";

export default function PlayerShell({
  children,
  ariaLabel = "Live video area",
}: {
  children: React.ReactNode;
  ariaLabel?: string;
}) {
  return (
    <div
      className="relative rounded-2xl border border-brand-gray-300 bg-white shadow-sm"
      aria-label={ariaLabel}
    >
      {/* The player viewport */}
      <div className="aspect-video rounded-2xl overflow-hidden">
        {children}
      </div>
    </div>
  );
}