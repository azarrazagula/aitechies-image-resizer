"use client";

import React, { useState, useEffect } from "react";
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
  const [customW, setCustomW] = useState<string>("1080");
  const [customH, setCustomH] = useState<string>("1080");

  const activePlatform = PLATFORMS.find((p) => p.category === selectedCategory) || PLATFORMS[0];

  // Synchronize local custom inputs with selectedPreset when they change externally
  useEffect(() => {
    if (selectedCategory === "Custom" && selectedPreset) {
      const presetWStr = selectedPreset.w.toString();
      const presetHStr = selectedPreset.h.toString();
      if (presetWStr !== customW && selectedPreset.w !== (parseInt(customW) || 0)) {
        setCustomW(presetWStr);
      }
      if (presetHStr !== customH && selectedPreset.h !== (parseInt(customH) || 0)) {
        setCustomH(presetHStr);
      }
    } else if (selectedCategory !== "Custom" && selectedPreset) {
      setCustomW(selectedPreset.w.toString());
      setCustomH(selectedPreset.h.toString());
    }
  }, [selectedPreset, selectedCategory]);

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
              <motion.button
                key={platform.category}
                type="button"
                whileHover={{ scale: 1.03, y: -1 }}
                whileTap={{ scale: 0.97 }}
                onClick={() => {
                  if (platform.category === "Custom") {
                    const w = parseInt(customW) || 1080;
                    const h = parseInt(customH) || 1080;
                    onPresetSelect({ name: "User-defined", w, h }, "Custom");
                  } else {
                    onPresetSelect(platform.presets[0], platform.category);
                  }
                }}
                className={`py-2 px-3 sm:px-4 sm:py-2.5 rounded-xl border text-center transition-colors duration-300 text-xs font-semibold ${
                  isCustom ? "col-span-3 sm:col-span-auto sm:flex-shrink-0" : "flex-shrink-0"
                } ${
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
        <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          2. Select Dimension
        </h3>

        <AnimatePresence mode="wait">
          {selectedCategory === "Custom" ? (
            /* Custom W x H inputs with slide/expand transition */
            <motion.div
              key="custom-inputs"
              initial={{ opacity: 0, height: 0, scale: 0.98 }}
              animate={{ opacity: 1, height: "auto", scale: 1 }}
              exit={{ opacity: 0, height: 0, scale: 0.98 }}
              transition={{ duration: 0.25, ease: "easeInOut" }}
              className="glass-card p-5 border-neutral-800/80 max-w-md overflow-hidden"
            >
              <p className="text-xs text-neutral-400 mb-4">
                Enter your desired dimensions in pixels.
              </p>
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <label
                    htmlFor="custom-width"
                    className="text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1"
                  >
                    <span>↔</span> Width (Horizontal px)
                  </label>
                  <input
                    id="custom-width"
                    type="number"
                    min="1"
                    max="10000"
                    value={customW}
                    onChange={(e) => setCustomW(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors font-mono font-bold"
                  />
                </div>
                <div>
                  <label
                    htmlFor="custom-height"
                    className="text-xs font-semibold text-neutral-400 mb-1.5 flex items-center gap-1"
                  >
                    <span>↕</span> Height (Vertical px)
                  </label>
                  <input
                    id="custom-height"
                    type="number"
                    min="1"
                    max="10000"
                    value={customH}
                    onChange={(e) => setCustomH(e.target.value)}
                    className="w-full bg-[#0D0D0D] border border-neutral-800 rounded-xl px-3 py-2 text-sm text-white focus:outline-none focus:border-primary transition-colors font-mono font-bold"
                  />
                </div>
              </div>
            </motion.div>
          ) : (
            /* Preset lists */
            <motion.div
              key="preset-cards"
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
                    className={`relative flex flex-col justify-between h-[72px] p-3 rounded-xl border text-left transition-all duration-200 ${
                      isSelected
                        ? "border-primary bg-primary/10 shadow-lg shadow-primary/10"
                        : "border-neutral-800 bg-[#161616]/50 hover:border-neutral-700 hover:bg-[#1a1a1a]"
                    }`}
                  >
                    {/* Preset Name */}
                    <span className={`text-[11px] font-semibold leading-tight line-clamp-2 ${
                      isSelected ? "text-white" : "text-neutral-300"
                    }`}>
                      {preset.name}
                    </span>

                    {/* Resolution Badge — always pinned to bottom-right */}
                    <div className="flex items-end justify-end mt-auto">
                      <span className={`text-[10px] font-mono font-bold px-1.5 py-0.5 rounded-md ${
                        isSelected
                          ? "bg-primary/20 text-primary-light border border-primary/30"
                          : "bg-neutral-900 text-neutral-400 border border-neutral-800"
                      }`}>
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
          )}
        </AnimatePresence>
      </div>
    </div>
  );
}
