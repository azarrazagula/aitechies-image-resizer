"use client";

import React from "react";

interface DownloadPanelProps {
  onDownload: (
    format: "image/png" | "image/jpeg" | "image/webp",
    quality: number,
    downloadType: "zip" | "individual" | "single"
  ) => void;
  isBatch: boolean;
  isLoading: boolean;
  format: "image/png" | "image/jpeg" | "image/webp";
  onFormatChange: (format: "image/png" | "image/jpeg" | "image/webp") => void;
  quality: number;
  onQualityChange: (quality: number) => void;
}

export default function DownloadPanel({
  onDownload,
  isBatch,
  isLoading,
  format,
  onFormatChange,
  quality,
  onQualityChange,
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

        {/* Quality slider (60% to 100%) */}
        {showQualitySlider && (
          <div className="space-y-2 p-3 bg-[#0D0D0D] border border-neutral-800/80 rounded-xl animate-fade-in">
            <div className="flex justify-between text-xs sm:text-sm">
              <span className="text-neutral-400 font-semibold">Image Quality</span>
              <span className="font-mono font-bold text-accent">{quality}%</span>
            </div>
            <input
              type="range"
              min="60"
              max="100"
              value={quality}
              onChange={(e) => onQualityChange(parseInt(e.target.value))}
              className="w-full accent-primary bg-neutral-800 rounded-lg cursor-pointer h-1.5"
            />
            <span className="text-[10px] sm:text-[11px] text-neutral-500 block leading-tight">
              Lower quality reduces file size; higher quality retains details.
            </span>
          </div>
        )}
      </div>

      {/* Download trigger buttons */}
      <div className="space-y-3 pt-2">
        {isBatch ? (
          <div className="grid grid-cols-1 sm:grid-cols-2 gap-3">
            <button
              type="button"
              disabled={isLoading}
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
              disabled={isLoading}
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
            disabled={isLoading}
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
