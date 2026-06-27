"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { PLATFORMS, Preset } from "../utils/presets";

interface PlatformPickerProps {
  onPresetSelect: (preset: Preset, category: string) => void;
  selectedPreset: Preset | null;
  selectedCategory: string;
}

// Brand-accurate custom SVG icons for each social platform
const getPlatformIcon = (category: string) => {
  switch (category) {
    case "Instagram":
      return (
        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" viewBox="0 0 24 24">
          <rect width="20" height="20" x="2" y="2" rx="5" ry="5"/>
          <path d="M16 11.37A4 4 0 1 1 12.63 8 4 4 0 0 1 16 11.37z"/>
          <line x1="17.5" x2="17.51" y1="6.5" y2="6.5"/>
        </svg>
      );
    case "LinkedIn":
      return (
        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M20.447 20.452h-3.554v-5.569c0-1.328-.027-3.037-1.852-3.037-1.853 0-2.136 1.445-2.136 2.939v5.667H9.351V9h3.414v1.561h.046c.477-.9 1.637-1.85 3.37-1.85 3.601 0 4.267 2.37 4.267 5.455v6.286zM5.337 7.433c-1.144 0-2.063-.926-2.063-2.065 0-1.138.92-2.063 2.063-2.063 1.14 0 2.064.925 2.064 2.063 0 1.139-.925 2.065-2.064 2.065zm1.782 13.019H3.555V9h3.564v11.452z"/>
        </svg>
      );
    case "Twitter / X":
      return (
        <svg className="w-4.5 h-4.5 sm:w-5 sm:h-5" fill="currentColor" viewBox="0 0 24 24">
          <path d="M18.244 2.25h3.308l-7.227 8.26 8.502 11.24H16.17l-5.214-6.817L4.99 21.75H1.68l7.73-8.835L1.254 2.25H8.08l4.713 6.231zm-1.161 17.52h1.833L7.084 4.126H5.117z"/>
        </svg>
      );
    case "Facebook":
      return (
        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
        </svg>
      );
    case "YouTube":
      return (
        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M23.498 6.163a3.003 3.003 0 0 0-2.11-2.11C19.517 3.545 12 3.545 12 3.545s-7.517 0-9.388.508a3.003 3.003 0 0 0-2.11 2.11C0 8.033 0 12 0 12s0 3.967.502 5.837a3.003 3.003 0 0 0 2.11 2.11c1.871.508 9.388.508 9.388.508s7.517 0 9.388-.508a3.003 3.003 0 0 0 2.11-2.11C24 15.967 24 12 24 12s0-3.967-.502-5.837zM9.545 15.568V8.432L15.818 12l-6.273 3.568z"/>
        </svg>
      );
    case "WhatsApp":
      return (
        <svg className="w-5.5 h-5.5 sm:w-6 sm:h-6" fill="currentColor" viewBox="0 0 24 24">
          <path d="M17.472 14.382c-.297-.149-1.758-.867-2.03-.967-.273-.099-.471-.148-.67.15-.197.297-.767.966-.94 1.164-.173.199-.347.223-.644.075-.297-.15-1.255-.463-2.39-1.475-.883-.788-1.48-1.761-1.653-2.059-.173-.297-.018-.458.13-.606.134-.133.298-.347.446-.52.149-.174.198-.298.298-.497.099-.198.05-.371-.025-.52-.075-.149-.669-1.612-.916-2.207-.242-.579-.487-.5-.669-.51-.173-.008-.371-.01-.57-.01-.198 0-.52.074-.792.372-.272.297-1.04 1.016-1.04 2.479 0 1.462 1.065 2.875 1.213 3.074.149.198 2.096 3.2 5.077 4.487.709.306 1.262.489 1.694.625.712.227 1.36.195 1.871.118.571-.085 1.758-.719 2.006-1.413.248-.694.248-1.289.173-1.413-.074-.124-.272-.198-.57-.347m-5.421 7.403h-.004a9.87 9.87 0 01-5.031-1.378l-.361-.214-3.741.982.998-3.648-.235-.374a9.86 9.86 0 01-1.51-5.26c.001-5.45 4.436-9.884 9.888-9.884 2.64 0 5.122 1.03 6.988 2.898a9.825 9.825 0 012.893 6.994c-.003 5.45-4.437 9.884-9.885 9.884m8.413-18.297A11.815 11.815 0 0012.05 0C5.495 0 .16 5.335.157 11.892c0 2.096.547 4.142 1.588 5.945L0 24l6.335-1.662c1.746.953 3.71 1.458 5.705 1.459h.005c6.554 0 11.89-5.335 11.893-11.893a11.821 11.821 0 00-3.48-8.413z"/>
        </svg>
      );
    default:
      return null;
  }
};

const BRAND_COLORS: Record<string, { activeBorder: string; activeBg: string; activeText: string }> = {
  Instagram: {
    activeBorder: "border-pink-500/50",
    activeBg: "bg-pink-500/10",
    activeText: "text-pink-400",
  },
  LinkedIn: {
    activeBorder: "border-blue-500/50",
    activeBg: "bg-blue-500/10",
    activeText: "text-blue-400",
  },
  "Twitter / X": {
    activeBorder: "border-white/40",
    activeBg: "bg-white/10",
    activeText: "text-white",
  },
  Facebook: {
    activeBorder: "border-blue-600/50",
    activeBg: "bg-blue-600/10",
    activeText: "text-blue-500",
  },
  YouTube: {
    activeBorder: "border-red-500/50",
    activeBg: "bg-red-500/10",
    activeText: "text-red-500",
  },
  WhatsApp: {
    activeBorder: "border-emerald-500/50",
    activeBg: "bg-emerald-500/10",
    activeText: "text-emerald-400",
  },
};

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
        <div className="grid grid-cols-6 gap-2 sm:flex sm:flex-wrap sm:gap-3">
          {PLATFORMS.map((platform) => {
            const isSelected = selectedCategory === platform.category;
            const colors = BRAND_COLORS[platform.category] || {
              activeBorder: "border-primary/50",
              activeBg: "bg-primary/10",
              activeText: "text-primary-light"
            };

            return (
              <motion.button
                key={platform.category}
                type="button"
                whileHover={{ scale: 1.05, y: -1 }}
                whileTap={{ scale: 0.95 }}
                onClick={() =>
                  onPresetSelect(platform.presets[0], platform.category)
                }
                title={platform.category}
                aria-label={platform.category}
                className={`w-11 h-11 sm:w-12 sm:h-12 flex items-center justify-center rounded-xl border transition-all duration-300 flex-shrink-0 ${
                  isSelected
                    ? `${colors.activeBorder} ${colors.activeBg} ${colors.activeText} shadow-md shadow-black/30`
                    : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 hover:bg-[#161616]/80 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {getPlatformIcon(platform.category)}
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
