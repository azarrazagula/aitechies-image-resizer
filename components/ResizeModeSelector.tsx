"use client";

import React from "react";

interface ResizeModeSelectorProps {
  mode: "fit" | "fill" | "stretch";
  onModeSelect: (mode: "fit" | "fill" | "stretch") => void;
  bgColor: string;
  onBgColorChange: (color: string) => void;
}

const PRESET_COLORS = [
  { name: "White", value: "#ffffff" },
  { name: "Black", value: "#000000" },
  { name: "Gray", value: "#f3f4f6" },
  { name: "Primary", value: "#6C47FF" },
  { name: "Accent", value: "#00C2A8" },
  { name: "Transparent", value: "transparent" },
];

export default function ResizeModeSelector({
  mode,
  onModeSelect,
  bgColor,
  onBgColorChange,
}: ResizeModeSelectorProps): JSX.Element {
  return (
    <div className="space-y-4">
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          3. Resize Mode
        </h3>
        <div className="grid grid-cols-3 gap-3">
          {(["fit", "fill", "stretch"] as const).map((m) => {
            const isSelected = mode === m;
            let description = "";
            if (m === "fit") description = "Letterbox with padding";
            if (m === "fill") description = "Center-crop to fill";
            if (m === "stretch") description = "Stretch to fit";

            return (
              <button
                key={m}
                type="button"
                onClick={() => onModeSelect(m)}
                className={`flex flex-col items-center p-4 rounded-2xl border text-center transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-white shadow-md"
                    : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                <span className="text-sm font-bold capitalize mb-1">{m}</span>
                <span className="text-[10px] opacity-75">{description}</span>
              </button>
            );
          })}
        </div>
      </div>

      {mode === "fit" && (
        <div className="p-4 bg-[#161616]/40 border border-neutral-800 rounded-2xl animate-fade-in space-y-3">
          <label className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
            Background Color
          </label>
          <div className="flex flex-wrap items-center gap-3">
            {PRESET_COLORS.map((color) => {
              const isSelected = bgColor === color.value;
              const isTransparent = color.value === "transparent";

              return (
                <button
                  key={color.name}
                  type="button"
                  onClick={() => onBgColorChange(color.value)}
                  className={`w-8 h-8 rounded-full border transition-transform duration-200 relative ${
                    isSelected
                      ? "scale-110 border-white ring-2 ring-primary/45"
                      : "border-neutral-700 hover:scale-105"
                  }`}
                  style={{
                    backgroundColor: isTransparent ? undefined : color.value,
                    backgroundImage: isTransparent
                      ? "linear-gradient(45deg, #ccc 25%, transparent 25%), linear-gradient(-45deg, #ccc 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #ccc 75%), linear-gradient(-45deg, transparent 75%, #ccc 75%)"
                      : undefined,
                    backgroundSize: isTransparent ? "8px 8px" : undefined,
                    backgroundPosition: isTransparent ? "0 0, 0 4px, 4px -4px, -4px 0" : undefined,
                  }}
                  title={color.name}
                >
                  {isSelected && (
                    <span className="absolute inset-0 flex items-center justify-center text-xs font-bold text-neutral-900 pointer-events-none">
                      ✓
                    </span>
                  )}
                </button>
              );
            })}

            {/* Custom Color Input */}
            <div className="flex items-center gap-2 pl-2 border-l border-neutral-800">
              <input
                type="color"
                value={bgColor === "transparent" ? "#ffffff" : bgColor}
                onChange={(e) => onBgColorChange(e.target.value)}
                className="w-8 h-8 rounded-lg border border-neutral-700 cursor-pointer bg-transparent"
              />
              <span className="text-xs font-mono text-neutral-400 uppercase">
                {bgColor}
              </span>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
