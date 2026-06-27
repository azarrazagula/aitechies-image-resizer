"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
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
  const activePlatform =
    PLATFORMS.find((p) => p.category === selectedCategory) || PLATFORMS[0];

  return (
    <div className="space-y-6">
      {/* Category Selection Grid */}
      <div>
        <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          1. Choose Platform
        </h3>
        <div className="grid grid-cols-3 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedCategory === platform.category;

            return (
              <motion.button
                key={platform.category}
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() =>
                  onPresetSelect(platform.presets[0], platform.category)
                }
                className={`py-2 px-3 sm:px-4 sm:py-2.5 rounded-xl border text-center transition-colors duration-300 text-xs sm:text-sm md:text-base font-semibold flex-shrink-0 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-white shadow-md"
                    : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 hover:bg-[#161616]/80 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {platform.category}
              </motion.button>
            );
          })}
        </div>
      </div>

      {/* Preset Cards Selection */}
      <div>
        <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          2. Select Dimension
        </h3>

        <AnimatePresence mode="wait">
          <motion.div
            key={selectedCategory}
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            exit={{ opacity: 0, y: -8 }}
            transition={{ duration: 0.2 }}
            className="grid grid-cols-2 sm:grid-cols-3 gap-2"
          >
            {activePlatform.presets.map((preset) => {
              const isSelected =
                selectedPreset?.name === preset.name &&
                selectedCategory === activePlatform.category;

              return (
                <motion.button
                  key={preset.name}
                  type="button"
                  whileHover={{ scale: 1.02 }}
                  whileTap={{ scale: 0.98 }}
                  onClick={() => onPresetSelect(preset, activePlatform.category)}
                  className={`relative flex flex-col justify-between min-h-[76px] p-3 sm:p-3.5 rounded-xl border text-left transition-all duration-200 ${
                    isSelected
                      ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                      : "border-neutral-800 bg-[#161616]/50 hover:border-neutral-700 hover:bg-[#1a1a1a]"
                  }`}
                >
                  {/* Preset Name */}
                  <span
                    className={`text-[11px] sm:text-xs md:text-sm font-semibold leading-tight line-clamp-2 ${
                      isSelected ? "text-white" : "text-neutral-300"
                    }`}
                  >
                    {preset.name}
                  </span>

                  {/* Resolution Badge — always pinned to bottom-right */}
                  <div className="flex items-end justify-end mt-auto pt-2">
                    <span
                      className={`text-[10px] sm:text-[11px] md:text-xs font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-primary/20 text-primary-light border border-primary/30"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                      }`}
                    >
                      {preset.w}×{preset.h}
                    </span>
                  </div>

                  {/* Active indicator dot */}
                  {isSelected && (
                    <span className="absolute top-2 right-2 w-1.5 h-1.5 rounded-full bg-primary" />
                  )}
                </motion.button>
              );
            })}
          </motion.div>
        </AnimatePresence>
      </div>
    </div>
  );
}
