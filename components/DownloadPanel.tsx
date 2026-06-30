"use client";

import React from "react";

interface DownloadPanelProps {
  onDownload: (
    format: "image/png" | "image/jpeg" | "image/webp",
    quality: number,
    downloadType: "zip" | "individual" | "single" | "mobile-zip"
  ) => void;
  isBatch: boolean;
  isLoading: boolean;
  format: "image/png" | "image/jpeg" | "image/webp";
  onFormatChange: (format: "image/png" | "image/jpeg" | "image/webp") => void;
  quality: number;
  onQualityChange: (quality: number) => void;
  disabled?: boolean;
  isAllSizesPlatform?: boolean;
  selectedCategory?: string;
}

export default function DownloadPanel({
  onDownload,
  isBatch,
  isLoading,
  format,
  onFormatChange,
  quality,
  onQualityChange,
  disabled = false,
  isAllSizesPlatform = false,
  selectedCategory = "",
}: DownloadPanelProps): JSX.Element {
  const showQualitySlider = format === "image/jpeg" || format === "image/webp";

  return (
    <div className="glass-card p-6 border-neutral-800 space-y-6">
      <div>
        <h3 className="text-sm md:text-base font-semibold uppercase tracking-wider text-neutral-400 mb-3">
          4. Export Settings
        </h3>

        {/* Format selectors */}
        <div className="grid grid-cols-3 gap-3 mb-4">
          {(
            [
              { label: "PNG", value: "image/png" },
              { label: "JPG", value: "image/jpeg" },
              { label: "WebP", value: "image/webp" },
            ] as const
          ).map((fmt) => {
            const isSelected = format === fmt.value;

            return (
              <button
                key={fmt.value}
                type="button"
                onClick={() => onFormatChange(fmt.value)}
                className={`py-2.5 rounded-xl border font-semibold text-sm sm:text-base transition-all duration-300 ${
                  isSelected
                    ? "border-primary bg-primary/10 text-white shadow-sm"
                    : "border-neutral-800 bg-[#161616]/40 hover:border-neutral-700 text-neutral-400 hover:text-neutral-200"
                }`}
              >
                {fmt.label}
              </button>
            );
          })}
        </div>

        {/* Format Description Info */}
        <div className="mt-2.5 mb-4 p-3 bg-[#0D0D0D] border border-neutral-800/80 rounded-xl animate-fade-in">
          <div className="flex gap-2 items-start">
            <span className="text-[9px] sm:text-[10px] font-bold uppercase px-1.5 py-0.5 rounded bg-neutral-800 text-neutral-300 border border-neutral-700/60 font-mono select-none">
              {format === "image/png" ? "PNG" : format === "image/jpeg" ? "JPG" : "WebP"}
            </span>
            <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-relaxed pt-0.5">
              {format === "image/png" && "Best for graphics & logos. Lossless format that preserves original details and supports transparent backgrounds."}
              {format === "image/jpeg" && "Best for photos and social media. Highly compatible and compressed to keep files lightweight."}
              {format === "image/webp" && "Modern web format. Up to 30% smaller file size than JPG while maintaining gorgeous visual details."}
            </p>
          </div>
        </div>

        {/* Quality slider (10% to 100%) */}
        {showQualitySlider && (
          <div className="space-y-3 p-3 bg-[#0D0D0D] border border-neutral-900 rounded-xl animate-fade-in">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-neutral-400 font-semibold">Image Quality</span>
              <span className="font-mono font-bold text-accent">{quality}%</span>
            </div>
            
            <div className="relative pt-1 px-1">
              <input
                type="range"
                min="10"
                max="100"
                step="10"
                value={quality}
                onChange={(e) => onQualityChange(parseInt(e.target.value))}
                className="w-full accent-primary bg-neutral-800 rounded-lg cursor-pointer h-1.5"
              />
              
              {/* Glowing Snap Points */}
              <div className="flex justify-between w-full px-0.5 mt-2">
                {[10, 20, 30, 40, 50, 60, 70, 80, 90, 100].map((pt) => {
                  const isPassed = quality >= pt;
                  const isCurrent = quality === pt;
                  return (
                    <div key={pt} className="flex flex-col items-center gap-1 select-none">
                      <div
                        className={`w-1.5 h-1.5 rounded-full transition-all duration-300 ${
                          isCurrent
                            ? "bg-primary ring-2 ring-primary/40 shadow-[0_0_8px_rgba(139,92,246,0.8)] scale-125"
                            : isPassed
                            ? "bg-primary-light/80"
                            : "bg-neutral-800"
                        }`}
                      />
                      <span
                        className={`text-[9px] font-mono font-semibold transition-colors duration-300 ${
                          isCurrent ? "text-accent font-bold" : "text-neutral-600"
                        }`}
                      >
                        {pt}
                      </span>
                    </div>
                  );
                })}
              </div>
            </div>
            
            <span className="text-[10px] sm:text-[11px] text-neutral-500 block leading-tight">
              Lower quality reduces file size; snaps to standard quality presets.
            </span>
          </div>
        )}
      </div>

      {/* Download trigger buttons */}
      <div className="space-y-3 pt-2">
        {isAllSizesPlatform ? (
          /* Mobile / Web Platform: Download ALL sizes as ZIP */
          <div className="space-y-3">
            {/* Info callout */}
            <div className="flex items-start gap-2.5 p-3 bg-[#0D0D0D] border border-[#8B5CF6]/30 rounded-xl">
              <div className="mt-0.5 shrink-0 w-5 h-5 rounded-full bg-[#8B5CF6]/20 border border-[#8B5CF6]/40 flex items-center justify-center">
                <svg className="w-3 h-3 text-[#8B5CF6]" fill="currentColor" viewBox="0 0 20 20">
                  <path fillRule="evenodd" d="M18 10a8 8 0 11-16 0 8 8 0 0116 0zm-7-4a1 1 0 11-2 0 1 1 0 012 0zM9 9a1 1 0 000 2v3a1 1 0 001 1h1a1 1 0 100-2v-3a1 1 0 00-1-1H9z" clipRule="evenodd" />
                </svg>
              </div>
              <p className="text-[10px] sm:text-[11px] text-neutral-400 leading-relaxed">
                All <span className="text-[#a78bfa] font-semibold">{selectedCategory}</span> sizes will be exported into one ZIP file automatically.
              </p>
            </div>

            {/* Download All Sizes button */}
            <button
              type="button"
              disabled={isLoading || disabled}
              onClick={() => onDownload(format, quality / 100, "mobile-zip")}
              className="w-full flex items-center justify-center gap-2.5 px-4 bg-primary hover:bg-primary-dark disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-primary/20 border border-primary/20 text-sm sm:text-base md:text-[17px] py-3.5"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download All Sizes (ZIP)
            </button>
          </div>
        ) : isBatch ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading || disabled}
              onClick={() => onDownload(format, quality / 100, "zip")}
              className="w-full flex items-center justify-center gap-2 px-4 bg-primary hover:bg-primary-dark disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-primary/10 border border-primary/20 text-sm sm:text-base md:text-[17px] py-3.5"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M19 14l-7 7m0 0l-7-7m7 7V3" />
                </svg>
              )}
              Download ZIP
            </button>
            <button
              type="button"
              disabled={isLoading || disabled}
              onClick={() => onDownload(format, quality / 100, "single")}
              className="w-full flex items-center justify-center gap-2 px-4 bg-neutral-900 hover:bg-neutral-800 disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed border border-neutral-800 text-neutral-200 font-bold rounded-xl transition-all text-sm sm:text-base md:text-[17px] py-3.5"
            >
              {isLoading ? (
                <span className="w-4 h-4 border-2 border-neutral-400 border-t-transparent rounded-full animate-spin" />
              ) : (
                <svg className="w-4 h-4 sm:w-5 sm:h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
                </svg>
              )}
              Download Selected
            </button>
          </div>
        ) : (
          <button
            type="button"
            disabled={isLoading || disabled}
            onClick={() => onDownload(format, quality / 100, "single")}
            className="w-full flex items-center justify-center gap-2 px-4 bg-primary hover:bg-primary-dark disabled:bg-neutral-800 disabled:text-neutral-600 disabled:cursor-not-allowed text-white font-bold rounded-xl transition-all shadow-md shadow-primary/10 border border-primary/20 text-sm sm:text-base md:text-[17px] py-3.5"
          >
            {isLoading ? (
              <span className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin" />
            ) : (
              <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4" />
              </svg>
            )}
            Download Resized Image
          </button>
        )}
      </div>
    </div>
  );
}
