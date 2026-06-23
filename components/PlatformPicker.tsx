"use client";

import React, { useState, useEffect } from "react";
import { PLATFORMS, Preset } from "../utils/presets";
import { PLATFORMS_METADATA } from "../constants/platforms";

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
        <div className="grid grid-cols-2 sm:grid-cols-4 md:grid-cols-7 gap-3">
          {PLATFORMS.map((platform) => {
            const meta = PLATFORMS_METADATA[platform.category];
            const isSelected = selectedCategory === platform.category;

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
                className={`flex flex-col items-center justify-center p-3.5 rounded-2xl border text-center transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/10 shadow-lg shadow-primary/5 text-white"
                    : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 hover:bg-[#161616]/80 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {/* Visual Icon indicator */}
                <div
                  className={`w-9 h-9 rounded-xl flex items-center justify-center text-white mb-2 shadow-sm ${
                    meta?.iconBg || "bg-neutral-800"
                  }`}
                >
                  <span className="font-bold text-sm">
                    {platform.category.charAt(0)}
                  </span>
                </div>
                <span className="text-xs font-semibold tracking-wide">
                  {platform.category}
                </span>
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
          <div className="grid grid-cols-1 sm:grid-cols-3 gap-3">
            {activePlatform.presets.map((preset) => {
              const isSelected =
                selectedPreset?.name === preset.name &&
                selectedCategory === activePlatform.category;

              return (
                <button
                  key={preset.name}
                  type="button"
                  onClick={() => onPresetSelect(preset, activePlatform.category)}
                  className={`flex items-center justify-between p-4 rounded-2xl border text-left transition-all duration-300 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-md text-white"
                      : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 hover:bg-[#161616]/80 text-neutral-400 hover:text-neutral-200"
                  }`}
                >
                  <div className="space-y-1">
                    <span className="text-xs text-neutral-500 block">
                      {selectedCategory}
                    </span>
                    <span className="text-sm font-semibold text-white">
                      {preset.name}
                    </span>
                  </div>
                  <div className="text-right">
                    <span className="text-xs font-mono px-2 py-1 rounded bg-neutral-900 border border-neutral-800 font-semibold text-accent-light block">
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
