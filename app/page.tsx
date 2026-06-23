"use client";

import React, { useState } from "react";
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
  const [cropOffsets, setCropOffsets] = useState<Record<number, { x: number; y: number }>>({});
  const [isProcessing, setIsProcessing] = useState<boolean>(false);

  const activeFile = files[activeFileIndex] || null;
  const activeCropOffset = cropOffsets[activeFileIndex] || { x: 0, y: 0 };

  const handleFilesSelect = (selectedFiles: File[]) => {
    setFiles(selectedFiles);
    setActiveFileIndex(0);
    setCropOffsets({});
  };

  const handlePresetSelect = (preset: Preset, category: string) => {
    setSelectedPreset(preset);
    setSelectedCategory(category);
    setCropOffsets({}); // Reset crop offsets when aspect ratio changes
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
  };

  const getCleanFilename = (originalName: string, ext: string): string => {
    const lastDot = originalName.lastIndexOf(".");
    const baseName = lastDot !== -1 ? originalName.substring(0, lastDot) : originalName;
    const formattedPlatform = selectedCategory.replace(/\s+/g, "").toLowerCase();
    const formattedPreset = selectedPreset?.name.replace(/\s+/g, "").toLowerCase() || "custom";
    const w = selectedPreset?.w || 0;
    const h = selectedPreset?.h || 0;
    return `${baseName}_${formattedPlatform}_${formattedPreset}_${w}x${h}.${ext}`;
  };

  const handleDownload = async (
    format: "image/png" | "image/jpeg" | "image/webp",
    quality: number,
    downloadType: "zip" | "individual" | "single"
  ) => {
    if (files.length === 0 || !selectedPreset) return;
    setIsProcessing(true);

    try {
      const ext = format.split("/")[1] === "jpeg" ? "jpg" : format.split("/")[1];
      const targetW = selectedPreset.w;
      const targetH = selectedPreset.h;

      if (downloadType === "single" && activeFile) {
        // Single file download
        const blob = await resizeImage(
          activeFile,
          targetW,
          targetH,
          mode,
          bgColor,
          format,
          quality,
          activeCropOffset
        );
        const filename = getCleanFilename(activeFile.name, ext);
        triggerDownload(blob, filename);
      } else if (downloadType === "individual") {
        // Multi-file download sequentially
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const offset = cropOffsets[i] || { x: 0, y: 0 };
          const blob = await resizeImage(
            file,
            targetW,
            targetH,
            mode,
            bgColor,
            format,
            quality,
            offset
          );
          const filename = getCleanFilename(file.name, ext);
          triggerDownload(blob, filename);
        }
      } else if (downloadType === "zip") {
        // Multi-file packaged as ZIP
        const items: { blob: Blob; filename: string }[] = [];
        for (let i = 0; i < files.length; i++) {
          const file = files[i];
          const offset = cropOffsets[i] || { x: 0, y: 0 };
          const blob = await resizeImage(
            file,
            targetW,
            targetH,
            mode,
            bgColor,
            format,
            quality,
            offset
          );
          const filename = getCleanFilename(file.name, ext);
          items.push({ blob, filename });
        }
        const zipFilename = `aitechies_resized_${selectedCategory.toLowerCase()}_${targetW}x${targetH}.zip`;
        await triggerBatchZipDownload(items, zipFilename);
      }
    } catch (error) {
      console.error("Resize failed:", error);
      alert("Something went wrong during resizing. Please try again.");
    } finally {
      setIsProcessing(false);
    }
  };

  return (
    <div className="min-h-[100dvh] flex flex-col relative bg-[#0D0D0D]">
      {/* Background glow effects */}
      <div className="absolute top-[-10%] left-[-10%] w-[50%] h-[50%] rounded-full bg-primary/10 blur-[120px] pointer-events-none z-0" />
      <div className="absolute bottom-[-10%] right-[-10%] w-[50%] h-[50%] rounded-full bg-accent/10 blur-[120px] pointer-events-none z-0" />

      {/* Top Header navbar */}
      <Header />

      {/* Main Container */}
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8 md:py-12 w-full flex-1 flex flex-col relative z-10">
        {files.length === 0 ? (
          /* Landing page when no files uploaded */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-12 lg:gap-16 items-center w-full py-8 md:py-16">
            <div className="lg:col-span-7 space-y-6 text-left flex flex-col items-start animate-fade-up">
              {/* Badge */}
              <div className="inline-flex items-center gap-2 px-3.5 py-1.5 rounded-full bg-primary/10 border border-primary/20 text-primary-light text-xs md:text-sm font-medium">
                <span className="w-1.5 h-1.5 rounded-full bg-primary-light animate-pulse" />
                Social Media Image Resizer
              </div>

              {/* Title */}
              <h1 className="text-4xl sm:text-5xl md:text-6xl lg:text-7xl font-extrabold text-white leading-tight tracking-tight">
                SOCIAL MEDIA <br />
                <span className="text-brand-gradient">
                  IMAGE RESIZER
                </span>
              </h1>

              {/* Subtext */}
              <p className="text-neutral-400 text-base md:text-lg max-w-xl leading-relaxed">
                Resize your photos instantly for Instagram, LinkedIn, Facebook, YouTube, Twitter, and WhatsApp. 100% client-side, secure, and private.
              </p>
            </div>

            {/* Drag & drop upload zone */}
            <div className="lg:col-span-5 w-full animate-fade-up">
              <ImageUploader onFilesSelect={handleFilesSelect} />
            </div>
          </div>
        ) : (
          /* Editor Dashboard */
          <div className="grid grid-cols-1 lg:grid-cols-12 gap-8 items-start w-full py-4">
            {/* Left Column: Settings and Controls */}
            <div className="lg:col-span-7 space-y-6">
              {/* Reset/Upload New button */}
              <div className="flex items-center justify-between">
                <button
                  type="button"
                  onClick={handleReset}
                  className="inline-flex items-center gap-2 px-4 py-2 rounded-xl bg-neutral-900 hover:bg-neutral-800 text-neutral-300 hover:text-white transition-all text-xs font-semibold border border-neutral-800"
                >
                  ← Upload New Images
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
                onModeSelect={setMode}
                bgColor={bgColor}
                onBgColorChange={setBgColor}
              />

              {/* Download Panel */}
              <DownloadPanel
                onDownload={handleDownload}
                isBatch={files.length > 1}
                isLoading={isProcessing}
              />
            </div>

            {/* Right Column: Live Preview & Batch Navigation */}
            <div className="lg:col-span-5 space-y-6">
              {/* Canvas Live Preview */}
              {activeFile && selectedPreset && (
                <div className="glass-card p-6 border-neutral-800 space-y-4">
                  <h3 className="text-sm font-semibold uppercase tracking-wider text-neutral-400 text-center">
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
                  />
                </div>
              )}

              {/* Batch image thumbnails navigation */}
              {files.length > 1 && (
                <div className="glass-card p-4 border-neutral-800 space-y-3">
                  <span className="block text-xs font-semibold text-neutral-400 uppercase tracking-wider">
                    Select Preview Image
                  </span>
                  <div className="flex gap-2.5 overflow-x-auto pb-1.5 scrollbar-thin">
                    {files.map((file, idx) => {
                      const isActive = idx === activeFileIndex;
                      const thumbUrl = URL.createObjectURL(file);

                      return (
                        <button
                          key={file.name + idx}
                          type="button"
                          onClick={() => {
                            setActiveFileIndex(idx);
                          }}
                          className={`w-14 h-14 rounded-xl border flex-shrink-0 overflow-hidden relative transition-all duration-300 ${
                            isActive
                              ? "border-primary ring-2 ring-primary/40 scale-105"
                              : "border-neutral-800 hover:border-neutral-600 hover:scale-102"
                          }`}
                        >
                          <img
                            src={thumbUrl}
                            alt={file.name}
                            className="w-full h-full object-cover"
                            onLoad={() => URL.revokeObjectURL(thumbUrl)}
                          />
                        </button>
                      );
                    })}
                  </div>
                </div>
              )}
            </div>
          </div>
        )}
      </main>

      {/* Footer copyright and attribution */}
      <Footer />
    </div>
  );
}
