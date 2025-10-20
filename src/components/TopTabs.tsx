// src/components/TopTabs.tsx
import React, { useMemo } from "react";

export type TabKey = "ALL" | "DAIL" | "SEANAD" | "COMMITTEES" | "SEARCH";

type Props = {
  value: TabKey;
  onChange: (t: TabKey) => void;
  tabs?: TabKey[];
};

/**
 * Segmented "pill" tabs with a sliding indicator, evenly spaced and responsive.
 * Adds a small horizontal inset so the gold indicator never touches the edges.
 */
export function TopTabs({
  value,
  onChange,
  tabs = ["ALL", "DAIL", "SEANAD", "COMMITTEES", "SEARCH"],
}: Props) {
  const activeIdx = useMemo(
    () => Math.max(0, tabs.indexOf(value)),
    [tabs, value]
  );

  // segment width
  const segWidth = `${100 / tabs.length}%`;

  // small horizontal inset in px so the slider never touches the sides
  const H_INSET_PX = 6; // tweak 4–8 for taste
  const leftWithInset = `calc(${activeIdx} * (100% / ${tabs.length}) + ${H_INSET_PX}px)`;
  const widthWithInset = `calc((100% / ${tabs.length}) - ${H_INSET_PX * 2}px)`;

  return (
    <div className="w-full">
      <div
        className="
          relative w-full rounded-full border border-brand-gray-300
          bg-white/70 backdrop-blur p-1 shadow-sm
        "
        role="tablist"
        aria-label="Browse video on demand"
      >
        {/* Sliding indicator (gold) */}
        <div
          aria-hidden
          className="
            absolute top-1 bottom-1 rounded-full
            bg-brand-gold text-white shadow
            transition-[left,width] duration-300 ease-out
          "
          // override the raw segment values with a tiny inset
          style={{ width: widthWithInset, left: leftWithInset }}
        />

        {/* Buttons */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }}
        >
          {tabs.map((key, i) => {
            const isActive = i === activeIdx;
            const label =
              key === "ALL"
                ? "Explore"
                : key === "DAIL"
                ? "Dáil Éireann"
                : key === "SEANAD"
                ? "Seanad Éireann"
                : key === "COMMITTEES"
                ? "Committees"
                : "Search";

            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${key.toLowerCase()}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(key)}
                className={[
                  "relative z-10 h-10 sm:h-11 rounded-full",
                  "px-3 sm:px-4 text-sm sm:text-[15px] font-medium",
                  "transition-colors",
                  isActive
                    ? "text-white"
                    : "text-[#444444] hover:text-brand-gray-900",
                ].join(" ")}
              >
                {label}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TopTabs;