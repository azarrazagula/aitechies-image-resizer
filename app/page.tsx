"use client";

import React, { useState, useEffect } from "react";
import { motion, AnimatePresence } from "framer-motion";
import Header from "../components/Header";
import Footer from "../components/Footer";
import ImageUploader from "../components/ImageUploader";
import PlatformPicker from "../components/PlatformPicker";
import ResizeModeSelector from "../components/ResizeModeSelector";
import CanvasPreview from "../components/CanvasPreview";
import DownloadPanel from "../components/DownloadPanel";
import { Preset } from "../utils/presets";
import { resizeImage } from "../utils/resizeImage";
import { triggerDownload, triggerBatchZipDownload } from "../utils/download";

export default function Home(): JSX.Element {
  const [files, setFiles] = useState<File[]>([]);
  const [selectedCategory, setSelectedCategory] = useState<string>("Instagram");
  const [selectedPreset, setSelectedPreset] = useState<Preset | null>({
    name: "Post (Square)",
    w: 1080,
    h: 1080,
  });
  const [mode, setMode] = useState<"fit" | "fill" | "stretch">("fit");
  const [bgColor, setBgColor] = useState<string>("#ffffff");
  const [activeFileIndex, setActiveFileIndex] = useState<number>(0);
  const [cropOffsets, setCropOffsets] = useState<
    Record<number, { x: number; y: number }>
  >({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const [format, setFormat] = useState<
    "image/png" | "image/jpeg" | "image/webp"
  >("image/png");
  const [quality, setQuality] = useState<number>(90); // 90% default
  const [resizedSize, setResizedSize] = useState<number | null>(null);
  const [isCalculatingSize, setIsCalculatingSize] = useState<boolean>(false);
  const prevFileRef = React.useRef<File | null>(null);
  const prevIndexRef = React.useRef<number>(0);

  // File-specific settings: key is the index in the files array
  const [fileSettings, setFileSettings] = useState<
    Record<
      number,
      {
        category: string;
        preset: Preset;
        mode: "fit" | "fill" | "stretch";
        bgColor: string;
      }
    >
  >({});

  const activeFile = files[activeFileIndex] || null;
  const activeCropOffset = cropOffsets[activeFileIndex] || { x: 0, y: 0 };

  // Calculate resized size in background (instant for presets/options, debounced for custom size typing)
  useEffect(() => {
    if (!activeFile || !selectedPreset) {
      setResizedSize(null);
      setIsCalculatingSize(false);
      return;
    }

    // Reset size immediately if active image file itself has changed
    if (
      prevFileRef.current !== activeFile ||
      prevIndexRef.current !== activeFileIndex
    ) {
      setResizedSize(null);
      prevFileRef.current = activeFile;
      prevIndexRef.current = activeFileIndex;
    }

    const currentFileSettings = fileSettings[activeFileIndex] || {
      category: selectedCategory,
      preset: selectedPreset,
      mode: mode,
      bgColor: bgColor,
    };

    const targetW = currentFileSettings.preset.w;
    const targetH = currentFileSettings.preset.h;
    const targetMode = currentFileSettings.mode;
    const targetBg = currentFileSettings.bgColor;
    const targetFormat = format;
    const targetQuality = quality / 100;

    // Guard: invalid dimensions
    if (
      !targetW ||
      !targetH ||
      isNaN(targetW) ||
      isNaN(targetH) ||
      targetW <= 0 ||
      targetH <= 0
    ) {
      setResizedSize(null);
      setIsCalculatingSize(false);
      return;
    }

    setIsCalculatingSize(true);

    let isCurrent = true;
    // Debounce when user is typing inline custom dimensions (preset name = "User-defined")
    const isCustomDimension = currentFileSettings.preset.name === "User-defined";
    const delay = isCustomDimension ? 250 : 0;

    const calculateSize = async () => {
      try {
        const blob = await resizeImage(
          activeFile,
          targetW,
          targetH,
          targetMode,
          targetBg,
          targetFormat,
          targetQuality,
          activeCropOffset,
        );
        if (isCurrent) {
          setResizedSize(blob.size);
          setIsCalculatingSize(false);
        }
      } catch (err) {
        console.error("Size calculation failed", err);
        if (isCurrent) {
          setIsCalculatingSize(false);
        }
      }
    };

    const timer = setTimeout(calculateSize, delay);

    return () => {
      isCurrent = false;
      clearTimeout(timer);
    };
  }, [
    activeFile,
    activeFileIndex,
    fileSettings,
    selectedCategory,
    selectedPreset,
    mode,
    bgColor,
    activeCropOffset.x,
    activeCropOffset.y,
    format,
    quality,
  ]);

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setActiveFileIndex(0);
    setCropOffsets({});

    // Initialize default settings for all files to current presets
    const initialSettings: Record<
      number,
      {
        category: string;
        preset: Preset;
        mode: "fit" | "fill" | "stretch";
        bgColor: string;
      }
    > = {};
    selectedFiles.forEach((_, idx) => {
      initialSettings[idx] = {
        category: selectedCategory,
        preset: selectedPreset || { name: "Post (Square)", w: 1080, h: 1080 },
        mode: mode,
        bgColor: bgColor,
      };
    });
    setFileSettings(initialSettings);
  };

  const handlePresetSelect = (preset: Preset, category: string) => {
    const prevCategory = selectedCategory;
    setSelectedPreset(preset);
    setSelectedCategory(category);
    setCropOffsets({}); // Reset crop offsets when aspect ratio changes

    // Update settings for the active file
    setFileSettings((prev) => ({
      ...prev,
      [activeFileIndex]: {
        ...prev[activeFileIndex],
        category,
        preset,
      },
    }));

  };

  const handleModeSelect = (newMode: "fit" | "fill" | "stretch") => {
    setMode(newMode);
    setFileSettings((prev) => ({
      ...prev,
      [activeFileIndex]: {
        ...prev[activeFileIndex],
        mode: newMode,
      },
    }));
  };

  const handleBgColorSelect = (newColor: string) => {
    setBgColor(newColor);
    setFileSettings((prev) => ({
      ...prev,
      [activeFileIndex]: {
        ...prev[activeFileIndex],
        bgColor: newColor,
      },
    }));
  };

  const handleThumbnailClick = (idx: number) => {
    setActiveFileIndex(idx);
    const settings = fileSettings[idx];
    if (settings) {
      setSelectedCategory(settings.category);
      setSelectedPreset(settings.preset);
      setMode(settings.mode);
      setBgColor(settings.bgColor);
    }
  };

  const handleCropOffsetChange = (offset: { x: number; y: number }) => {
    setCropOffsets((prev) => ({
      ...prev,
      [activeFileIndex]: offset,
    }));
  };

  const handleReset = () => {
    setFiles([]);
    setActiveFileIndex(0);
    setMode("fit");
    setBgColor("#ffffff");
    setCropOffsets({});
    setFileSettings({});
    setFormat("image/png");
    setQuality(90);
    setResizedSize(null);
  };

  const getCleanFilename = (
    originalName: string,
    ext: string,
    preset: Preset | null,
    category: string,
  ): string => {
    const lastDot = originalName.lastIndexOf(".");
    const baseName =
      lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
    const formattedPlatform = category.replace(/\s+/g, "").toLowerCase();
    const formattedPreset =
      preset?.name.replace(/\s+/g, "").toLowerCase() || "custom";
    const w = preset?.w || 0;
    const h = preset?.h || 0;
    return `${baseName}_${formattedPlatform}_${formattedPreset}_${w}x${h}.${ext}`;
  };

  const handleDownload = async (
    format: "image/png" | "image/jpeg" | "image/webp",
    quality: number,
    downloadType: "zip" | "individual" | "single",
  ) => {
    if (files.length === 0) return;

    // Validate dimensions before resizing
    if (downloadType === "single" && activeFile) {
      const settings = fileSettings[activeFileIndex] || {
        category: selectedCategory,
        preset: selectedPreset || { name: "Post (Square)", w: 1080, h: 1080 },
      };
      const w = settings.preset?.w ?? 0;
      const h = settings.preset?.h ?? 0;
      if (w <= 0 || h <= 0 || isNaN(w) || isNaN(h)) {
        alert(
          "Please enter valid width and height dimensions before downloading.",
        );
        return;
      }
    } else {
      for (let i = 0; i < files.length; i++) {
        const settings = fileSettings[i];
        if (settings) {
          const w = settings.preset?.w ?? 0;
          const h = settings.preset?.h ?? 0;
          if (w <= 0 || h <= 0 || isNaN(w) || isNaN(h)) {
            alert(
              `Please enter valid width and height dimensions for image #${i + 1} (${files[i].name}) before downloading.`,
            );
            return;
          }
        }
      }
    }

    setIsProcessing(true);

    try {
      const ext =
        format.split("/")[1] === "jpeg" ? "jpg" : format.split("/")[1];

      if (downloadType === "single" && activeFile) {
        // Single file download using active settings
        const settings = fileSettings[activeFileIndex] || {
          category: selectedCategory,
          preset: selectedPreset || { name: "Post (Square)", w: 1080, h: 1080 },
          mode: mode,
          bgColor: bgColor,
        };
        const blob = await resizeImage(
          activeFile,
          settings.preset.w,
          settings.preset.h,
          settings.mode,
          settings.bgColor,
          format,
          quality,
          activeCropOffset,
        );

        // Update the resizedSize state for the preview
        setResizedSize(blob.size);

        const filename = getCleanFilename(
          activeFile.name,
          ext,
          settings.preset,
          settings.category,
        );
        triggerDownload(blob, filename);
      } else if (downloadType === "individual") {
        // Multi-file download sequentially using per-file settings
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const offset = cropOffsets[i] || { x: 0, y: 0 };
          const settings = fileSettings[i] || {
            category: selectedCategory,
            preset: selectedPreset || {
              name: "Post (Square)",
              w: 1080,
              h: 1080,
            },
            mode: mode,
            bgColor: bgColor,
          };
          const blob = await resizeImage(
            file,
            settings.preset.w,
            settings.preset.h,
            settings.mode,
            settings.bgColor,
            format,
            quality,
            offset,
          );

          if (i === activeFileIndex) {
            setResizedSize(blob.size);
          }

          const filename = getCleanFilename(
            file.name,
            ext,
            settings.preset,
            settings.category,
          );
          triggerDownload(blob, filename);
        }
      } else if (downloadType === "zip") {
        // Multi-file packaged as ZIP using per-file settings
        const items: { blob: Blob; filename: string }[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const offset = cropOffsets[i] || { x: 0, y: 0 };
          const settings = fileSettings[i] || {
            category: selectedCategory,
            preset: selectedPreset || {
              name: "Post (Square)",
              w: 1080,
              h: 1080,
            },
            mode: mode,
            bgColor: bgColor,
          };
          const blob = await resizeImage(
            file,
            settings.preset.w,
            settings.preset.h,
            settings.mode,
            settings.bgColor,
            format,
            quality,
            offset,
          );

          if (i === activeFileIndex) {
            setResizedSize(blob.size);
          }

          const filename = getCleanFilename(
            file.name,
            ext,
            settings.preset,
            settings.category,
          );
          items.push({ blob, filename });
        }
        const zipFilename = `aitechies_resized_batch.zip`;
        await triggerBatchZipDownload(items, zipFilename);
      }
    } catch (error) {
      console.error("Resize failed:", error);
      alert("Something went wrong during resizing. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  // ── Inline dimension change from CanvasPreview ─────────────
  const handleInlineDimensionChange = (w: number, h: number) => {
    const newPreset = { name: "User-defined", w, h };
    setSelectedPreset(newPreset);
    setFileSettings((prev) => ({
      ...prev,
      [activeFileIndex]: {
        ...prev[activeFileIndex],
        preset: newPreset,
      },
    }));
    setCropOffsets({});
  };

  return (
    <div
      className={`${
        files.length === 0
          ? "min-h-[100dvh] overflow-x-hidden md:h-[100dvh] md:overflow-hidden"
          : "min-h-[100dvh] overflow-x-hidden"
      } flex flex-col relative bg-[#0D0D0D]`}>
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Header navbar */}
      <Header />

      {/* Main Container */}
      <main
        className={`w-full flex-1 flex flex-col relative z-10 ${
          files.length > 0
            ? "max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 lg:py-12"
            : "max-w-6xl mx-auto px-4 sm:px-6 lg:px-8"
        }`}>
        {files.length === 0 ? (
          /* Landing page when no files uploaded */
          /* flex-1 + flex items-center = content is vertically centered
             between Header and Footer, no gap, no scroll */
          <div className="flex-1 flex items-center py-4">
            <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 lg:gap-16 items-center w-full">
              <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start animate-fade-up">
                {/* Badge */}
                <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs md:text-sm font-medium">
                  <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
                  Social Media Image Resizer
                </div>

                {/* Title */}
                <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
                  SOCIAL MEDIA <br />
                  <span className="text-brand-gradient">IMAGE RESIZER</span>
                </h1>

                {/* Subtext */}
                <p className="text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed">
                  Resize your photos instantly for Instagram, LinkedIn, Facebook,
                  YouTube, Twitter, and WhatsApp. 100% client-side, secure, and
                  private.
                </p>
              </div>

              {/* Drag & drop upload zone */}
              <div className="lg:col-span-5 w-full animate-fade-up">
                <ImageUploader onFilesSelect={handleFilesSelect} />
              </div>
            </div>
          </div>
        ) : (
          /* Editor Dashboard */
          <motion.div
            initial={{ opacity: 0, y: 15 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ duration: 0.5, ease: "easeOut" }}
            className="flex flex-col md:grid md:grid-cols-12 gap-0 md:gap-8 lg:gap-12 items-stretch md:items-start w-full py-0 md:py-4">
            {/* Top Preview Column (Right Column on desktop) */}
            <div className="sticky top-16 md:top-24 order-1 md:order-2 md:col-span-6 xl:col-span-7 flex flex-col bg-[#0D0D0D] md:bg-transparent border-b md:border-none border-neutral-900 p-4 md:p-0 flex-shrink-0 z-20 md:z-10 shadow-md md:shadow-none">
              {/* Mobile/Tablet Upload New Button (Above Preview) */}
              <div className="flex items-center justify-between mb-3 md:hidden px-1">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-semibold border border-neutral-800">
                  <span>←</span>
                  <span>Upload New Images</span>
                </button>
                {files.length > 1 && (
                  <span className="text-xs font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl">
                    Batch: {files.length} loaded
                  </span>
                )}
              </div>

              {/* Canvas Live Preview */}
              {activeFile && selectedPreset && (
                <div className="md:glass-card md:p-5 lg:p-6 md:border-neutral-800 space-y-3 md:space-y-4">
                  <h3 className="hidden md:block text-sm font-semibold uppercase tracking-wider text-neutral-400 text-center">
                    Live Preview
                  </h3>
                  <CanvasPreview
                    file={activeFile}
                    targetW={selectedPreset.w}
                    targetH={selectedPreset.h}
                    mode={mode}
                    bgColor={bgColor}
                    cropOffset={activeCropOffset}
                    onCropOffsetChange={handleCropOffsetChange}
                    selectedCategory={selectedCategory}
                    onPresetSelect={handlePresetSelect}
                    onCustomDimensionChange={handleInlineDimensionChange}
                    resizedSize={resizedSize}
                    format={format}
                    isCalculatingSize={isCalculatingSize}
                  />
                </div>
              )}

              {/* Batch image thumbnails navigation */}
              {files.length > 1 && (
                <div className="md:glass-card md:p-4 md:border-neutral-800 p-2 border-t md:border-t-0 border-neutral-900 mt-2">
                  <span className="hidden lg:block text-xs font-semibold text-neutral-400 uppercase tracking-wider mb-2">
                    Select Preview Image
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                    {files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      const thumbUrl = URL.createObjectURL(file);

                      return (
                        <motion.button
                          key={file.name + idx}
                          type="button"
                          onClick={() => handleThumbnailClick(idx)}
                          whileHover={{ scale: 1.05 }}
                          whileTap={{ scale: 0.95 }}
                          className={`w-12 h-12 lg:w-14 lg:h-14 rounded-xl border flex-shrink-0 overflow-hidden relative transition-all duration-300 ${
                            isActive
                              ? "border-primary ring-2 ring-primary/40 scale-105"
                              : "border-neutral-800 hover:border-neutral-600 hover:scale-102"
                          }`}>
                          {isActive && (
                            <motion.div
                              layoutId="activeThumbRing"
                              className="absolute inset-0 border-2 border-primary rounded-xl pointer-events-none z-10"
                              transition={{
                                type: "spring",
                                stiffness: 300,
                                damping: 30,
                              }}
                            />
                          )}
                          <img
                            src={thumbUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onLoad={() => URL.revokeObjectURL(thumbUrl)}
                          />
                        </motion.button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>

            {/* Bottom Controls Column (Left Column on desktop) */}
            <div className="order-2 md:order-1 md:col-span-6 xl:col-span-5 flex-1 p-4 sm:p-6 md:p-0 space-y-6 bg-[#090909] md:bg-transparent">
              {/* Reset/Upload New button (Desktop Only) */}
              <div className="hidden md:flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-semibold border border-neutral-800">
                  <span>←</span>
                  <span>Upload New Images</span>
                </button>
                {files.length > 1 && (
                  <span className="text-xs font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-3 py-1 rounded-xl">
                    Batch Mode: {files.length} images loaded
                  </span>
                )}
              </div>

              {/* Platform Picker */}
              <PlatformPicker
                onPresetSelect={handlePresetSelect}
                selectedPreset={selectedPreset}
                selectedCategory={selectedCategory}
              />

              {/* Resize Mode Selector */}
              <ResizeModeSelector
                mode={mode}
                onModeSelect={handleModeSelect}
                bgColor={bgColor}
                onBgColorChange={handleBgColorSelect}
              />

              {/* Download Panel */}
              <DownloadPanel
                onDownload={handleDownload}
                isBatch={files.length > 1}
                isLoading={isProcessing}
                format={format}
                onFormatChange={setFormat}
                quality={quality}
                onQualityChange={setQuality}
              />

              {/* Mobile Footer (shown inside scroll container) */}
              <div className="block md:hidden pt-8 border-t border-neutral-900">
                <Footer />
              </div>
            </div>
          </motion.div>
        )}
      </main>

      {/* Footer:
          - Landing page: always visible, sits right below content (no gap)
          - Editor view: desktop only (mobile has footer inside scroll container) */}
      {files.length === 0 ? (
        <Footer />
      ) : (
        <div className="hidden md:block">
          <Footer />
        </div>
      )}
    </div>
  );
}
