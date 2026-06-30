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
  const [isPreviewDragging, setIsPreviewDragging] = useState<boolean>(false);

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
    const isCustomDimension =
      currentFileSettings.preset.name === "User-defined";
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

  // ── Drag & Drop replacement handlers for the active preview ──
  const handlePreviewDragEnter = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(true);
  };

  const handlePreviewDragLeave = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(false);
  };

  const handlePreviewDragOver = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
  };

  const handlePreviewDrop = (e: React.DragEvent<HTMLDivElement>) => {
    e.preventDefault();
    e.stopPropagation();
    setIsPreviewDragging(false);

    if (e.dataTransfer.files && e.dataTransfer.files.length > 0) {
      const validFiles: File[] = [];
      for (let i = 0; i < e.dataTransfer.files.length; i++) {
        const file = e.dataTransfer.files[i];
        if (
          file.type === "image/png" ||
          file.type === "image/jpeg" ||
          file.type === "image/webp" ||
          file.type === "image/jpg"
        ) {
          validFiles.push(file);
        }
      }
      if (validFiles.length > 0) {
        handleFilesSelect(validFiles);
      }
    }
  };

  return (
    <div className="min-h-[100dvh] overflow-x-hidden flex flex-col relative bg-[#0D0D0D]">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Header navbar */}
      <Header />

      {/* Main Container */}
      <main className="w-full flex-1 flex flex-col relative z-10 max-w-[1400px] xl:max-w-[1600px] mx-auto px-4 sm:px-6 lg:px-12 py-6 md:py-10 lg:py-20">
        {/* Unified Title/Branding Section - Always at the top */}
        <div className="space-y-3 sm:space-y-4 lg:space-y-6 mb-8 md:mb-12 lg:mb-20 text-center">
          {/* Title */}
          <h1 className="text-3xl sm:text-4xl md:text-5xl lg:text-6xl font-extrabold text-white leading-tight tracking-tight">
            SOCIAL MEDIA{" "}
            <span className="text-brand-gradient">IMAGE RESIZER</span>
          </h1>

          {/* Subtext */}
          <p className="text-neutral-400 text-xs sm:text-sm md:text-base max-w-2xl mx-auto leading-relaxed">
            Resize your photos instantly for Instagram, LinkedIn, YouTube,
            Facebook, Twitter, WhatsApp, Android & iOS. 100% client-side,
            secure, and private.
          </p>
        </div>

        {/* 2-Column Responsive Grid */}
        <div className="flex flex-col lg:grid lg:grid-cols-12 gap-8 lg:gap-12 xl:gap-16 items-start w-full">
          {/* Column 1: Controls (Left Column on desktop, stacks below preview on mobile) */}
          <div className="order-2 lg:order-1 col-span-12 lg:col-span-5 xl:col-span-5 w-full space-y-10">
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
              disabled={files.length === 0}
            />
          </div>

          {/* Column 2: Upload Zone / Canvas Preview (Right Column on desktop, stacks at top on mobile) */}
          <div
            className={`order-1 lg:order-2 col-span-12 lg:col-span-7 xl:col-span-7 w-full ${files.length > 0 ? "sticky top-[64px] lg:top-24 z-20" : ""}`}>
            {files.length === 0 ? (
              /* Drag & drop upload zone */
              <div className="w-full">
                <ImageUploader onFilesSelect={handleFilesSelect} />
              </div>
            ) : (
              /* Live Preview Card */
              <motion.div
                initial={{ opacity: 0, y: 15 }}
                animate={{ opacity: 1, y: 0 }}
                transition={{ duration: 0.4, ease: "easeOut" }}
                onDragEnter={handlePreviewDragEnter}
                onDragOver={handlePreviewDragOver}
                onDragLeave={handlePreviewDragLeave}
                onDrop={handlePreviewDrop}
                className="glass-card p-4 sm:p-5 lg:p-6 border-neutral-800 space-y-8 relative overflow-hidden shadow-2xl">
                {/* Drag-to-Replace Overlay */}
                <AnimatePresence>
                  {isPreviewDragging && (
                    <motion.div
                      initial={{ opacity: 0 }}
                      animate={{ opacity: 1 }}
                      exit={{ opacity: 0 }}
                      className="absolute inset-0 bg-[#0D0D0D]/90 z-30 flex flex-col items-center justify-center border-2 border-dashed border-primary rounded-3xl m-2 sm:m-3 gap-3">
                      <div className="p-4 rounded-full bg-primary/10 border border-primary/20 text-primary">
                        <svg
                          className="w-8 h-8 animate-bounce"
                          fill="none"
                          stroke="currentColor"
                          viewBox="0 0 24 24">
                          <path
                            strokeLinecap="round"
                            strokeLinejoin="round"
                            strokeWidth="2"
                            d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                          />
                        </svg>
                      </div>
                      <p className="text-white font-bold text-base">
                        Drop to replace image(s)
                      </p>
                    </motion.div>
                  )}
                </AnimatePresence>

                {/* Preview Card Header */}
                <div className="flex items-center justify-between pb-3 border-b border-neutral-900">
                  <div className="flex items-center gap-2">
                    <span className="w-2 h-2 rounded-full bg-[#8B5CF6] animate-pulse" />
                    <h3 className="text-xs sm:text-sm font-semibold uppercase tracking-wider text-neutral-450">
                      Live Preview
                    </h3>
                  </div>

                  <div className="flex items-center gap-3">
                    {files.length > 1 && (
                      <span className="text-[10px] sm:text-xs font-medium text-neutral-400 bg-neutral-900 border border-neutral-800 px-2.5 py-1 rounded-xl">
                        Batch: {files.length} images
                      </span>
                    )}
                    <button
                      type="button"
                      onClick={handleReset}
                      className="inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-400 hover:text-white transition-all text-xs font-semibold border border-neutral-800 hover:border-neutral-750">
                      <span>Clear Image(s)</span>
                    </button>
                  </div>
                </div>

                {/* Canvas Live Preview Component */}
                {activeFile && selectedPreset && (
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
                )}

                {/* Batch thumbnails list */}
                {files.length > 1 && (
                  <div className="p-3 border border-neutral-900 bg-neutral-950/40 rounded-2xl mt-6 space-y-2">
                    <span className="block text-[10px] font-bold text-neutral-500 uppercase tracking-widest">
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
              </motion.div>
            )}
          </div>
        </div>
      </main>

      {/* Footer */}
      <Footer />
    </div>
  );
}
