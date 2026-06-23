"use client";

import React, { useState, useEffect } from "react";
import { PLATFORMS, Preset } from "../utils/presets";

interface PlatformPickerProps {
  onPresetSelect: (preset: Preset, category: string) => void;
  selectedPreset: Preset | null;
  selectedCategory: string;
}

export default function PlatformPicker({
  onPresetSelect,
  selectedPreset,
  selectedCategory,
}: PlatformPickerProps): JSX.Element {
  const [customW, setCustomW] = useState<string>("1080");
  const [customH, setCustomH] = useState<string>("1080");

  const activePlatform = PLATFORMS.find((p) => p.category === selectedCategory) || PLATFORMS[0];

  // Handle custom input change
  useEffect(() => {
    if (selectedCategory === "Custom") {
      const w = parseInt(customW) || 0;
      const h = parseInt(customH) || 0;
      onPresetSelect({ name: "User-defined", w, h }, "Custom");
    }
  }, [customW, customH, selectedCategory]);

  return (
    <div className="space-y-6">
      {/* Category Selection Grid */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          1. Choose Platform
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedCategory === platform.category;
            const isCustom = platform.category === "Custom";

            return (
              <button
                key={platform.category}
                type="button"
                onClick={() => {
                  if (platform.category === "Custom") {
                    const w = parseInt(customW) || 1080;
                    const h = parseInt(customH) || 1080;
                    onPresetSelect({ name: "User-defined", w, h }, "Custom");
                  } else {
                    onPresetSelect(platform.presets[0], platform.category);
                  }
                }}
                className={`py-2 px-3 sm:px-4 sm:py-2.5 rounded-xl border text-center transition-all duration-300 text-xs font-semibold ${
                  isCustom ? "col-span-3 sm:col-span-auto sm:flex-shrink-0" : "flex-shrink-0"
                } ${
                  isSelected
                    ? "border-primary bg-primary/10 text-white shadow-md"
                    : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 hover:bg-[#161616]/80 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {platform.category}
              </button>
            );
          })}
        </div>
      </div>

      {/* Preset Cards Selection */}
      <div>
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          2. Select Dimension
        </h3>

        {selectedCategory === "Custom" ? (
          /* Custom W x H inputs */
          <div className="glass-card p-5 border-neutral-800/80 max-w-md animate-fade-in">
            <p className="text-xs text-neutral-400 mb-4">
              Enter your desired dimensions in pixels.
            </p>
            <div className="grid grid-cols-2 gap-4">
              <div>
                <label
                  htmlFor="custom-width"
                  className="block text-xs font-medium text-neutral-400 mb-1.5"
                >
                  Width (px)
                </label>
                <input
                  id="custom-width"
                  type="number"
                  min="1"
                  max="10000"
                  value={customW}
                  onChange={(e) => setCustomW(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
              <div>
                <label
                  htmlFor="custom-height"
                  className="block text-xs font-medium text-neutral-400 mb-1.5"
                >
                  Height (px)
                </label>
                <input
                  id="custom-height"
                  type="number"
                  min="1"
                  max="10000"
                  value={customH}
                  onChange={(e) => setCustomH(e.target.value)}
                  className="w-full bg-[#0D0D0D] border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors"
                />
              </div>
            </div>
          </div>
        ) : (
          /* Preset lists */
          <div className="grid grid-cols-2 sm:grid-cols-3 gap-2.5">
            {activePlatform.presets.map((preset) => {
              const isSelected =
                selectedPreset?.name === preset.name &&
                selectedCategory === activePlatform.category;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onPresetSelect(preset, activePlatform.category)}
                  className={`flex flex-col sm:flex-row sm:items-center justify-between p-3.5 sm:p-4 rounded-2xl border text-left transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md text-white"
                      : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 hover:bg-[#161616]/80 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-[10px] text-neutral-500 block">
                      {selectedCategory}
                    </span>
                    <span className="text-xs sm:text-sm font-semibold text-white block truncate max-w-[120px] sm:max-w-none">
                      {preset.name}
                    </span>
                  </div>
                  <div className="mt-2 sm:mt-0 sm:text-right">
                    <span className="text-[9px] sm:text-xs font-mono px-1.5 py-0.5 sm:px-2 sm:py-1 rounded bg-neutral-900 border border-neutral-800 font-semibold text-accent-light inline-block">
                      {preset.w} × {preset.h}
                    </span>
                  </div>
                </button>
              );
            })}
          </div>
        )}
      </div>
    </div>
  );
}
