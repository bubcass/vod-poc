import React, { useMemo } from "react";

export type TabKey = "ALL" | "DAIL" | "SEANAD" | "COMMITTEES" | "SEARCH";

type Props = {
  value: TabKey;
  onChange: (t: TabKey) => void;
  tabs?: TabKey[];
};

/**
 * Segmented "pill" tabs with sliding gold border indicator and mild corner rounding.
 * Search tab uses a magnifying glass icon instead of text.
 */
export function TopTabs({
  value,
  onChange,
  tabs = ["ALL", "DAIL", "SEANAD", "COMMITTEES", "SEARCH"],
}: Props) {
  const activeIdx = useMemo(() => Math.max(0, tabs.indexOf(value)), [tabs, value]);

  const H_INSET_PX = 6;
  const leftWithInset = `calc(${activeIdx} * (100% / ${tabs.length}) + ${H_INSET_PX}px)`;
  const widthWithInset = `calc((100% / ${tabs.length}) - ${H_INSET_PX * 2}px)`;

  return (
    <div className="w-full">
      <div
        className="relative w-full rounded-md border-[1.5px] border-brand-gold bg-white/70 backdrop-blur p-1 shadow-sm"
        role="tablist"
        aria-label="Browse"
      >
        {/* gold slider border */}
        <div
          aria-hidden
          className="absolute top-1 bottom-1 rounded-md border-[3px] border-brand-gold transition-[left,width] duration-300 ease-out"
          style={{ width: widthWithInset, left: leftWithInset }}
        />

        {/* buttons */}
        <div
          className="grid"
          style={{ gridTemplateColumns: `repeat(${tabs.length}, minmax(0,1fr))` }}
        >
          {tabs.map((key, i) => {
            const isActive = i === activeIdx;
            const label =
              key === "ALL"
                ? "On now"
                : key === "DAIL"
                ? "Dáil Éireann"
                : key === "SEANAD"
                ? "Seanad Éireann"
                : key === "COMMITTEES"
                ? "Committees"
                : "";

            return (
              <button
                key={key}
                role="tab"
                aria-selected={isActive}
                aria-controls={`panel-${key.toLowerCase()}`}
                tabIndex={isActive ? 0 : -1}
                onClick={() => onChange(key)}
                className={[
                  "relative z-10 h-10 sm:h-11 rounded-md flex items-center justify-center",
                  "px-3 sm:px-4 text-sm sm:text-[15px] font-medium transition-colors",
                  isActive
                    ? "text-brand-gray-900"
                    : "text-[#444444] hover:text-brand-gray-900",
                ].join(" ")}
              >
                {key === "SEARCH" ? (
                  <svg
                    xmlns="http://www.w3.org/2000/svg"
                    className={`w-5 h-5 sm:w-6 sm:h-6 transition-transform duration-150 ${
                      isActive
                        ? "scale-110 text-brand-gold"
                        : "text-[#444444] group-hover:text-brand-gold"
                    }`}
                    fill="none"
                    viewBox="0 0 24 24"
                    stroke="currentColor"
                    strokeWidth={2.2}
                  >
                    <path
                      strokeLinecap="round"
                      strokeLinejoin="round"
                      d="M21 21l-4.35-4.35M11 19a8 8 0 1 1 0-16 8 8 0 0 1 0 16z"
                    />
                  </svg>
                ) : (
                  label
                )}
              </button>
            );
          })}
        </div>
      </div>
    </div>
  );
}

export default TopTabs;