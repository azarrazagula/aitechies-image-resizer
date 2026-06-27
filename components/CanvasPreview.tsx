"use client";

import React, { useRef, useEffect, useState, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { Preset } from "../utils/presets";

interface CanvasPreviewProps {
  file: File;
  targetW: number;
  targetH: number;
  mode: "fit" | "fill" | "stretch";
  bgColor: string;
  cropOffset: { x: number; y: number };
  onCropOffsetChange: (offset: { x: number; y: number }) => void;
  selectedCategory: string;
  onPresetSelect: (preset: Preset, category: string) => void;
  resizedSize: number | null;
  format: "image/png" | "image/jpeg" | "image/webp";
  isCalculatingSize?: boolean;
}

export default function CanvasPreview({
  file,
  targetW,
  targetH,
  mode,
  bgColor,
  cropOffset,
  onCropOffsetChange,
  selectedCategory,
  onPresetSelect,
  resizedSize,
  format,
  isCalculatingSize = false,
}: CanvasPreviewProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const originalCanvasRef = useRef<HTMLCanvasElement>(null);
  const wrapperRef = useRef<HTMLDivElement>(null);
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0, y: 0, offsetX: 0, offsetY: 0,
  });
  const isSliderDragging = useRef<boolean>(false);

  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeDrag, setActiveDrag] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [comparisonMode, setComparisonMode] = useState<boolean>(false);
  const [sliderPos, setSliderPos] = useState<number>(50);
  const [animatedSize, setAnimatedSize] = useState<number | null>(null);

  // Animated size counter
  useEffect(() => {
    if (resizedSize === null) { setAnimatedSize(null); return; }
    if (animatedSize === null) { setAnimatedSize(resizedSize); return; }
    const start = animatedSize;
    const end = resizedSize;
    const duration = 750;
    const startTime = performance.now();
    let raf: number;
    const animate = (now: number) => {
      const p = Math.min((now - startTime) / duration, 1);
      const ease = 1 - Math.pow(1 - p, 3);
      setAnimatedSize(Math.round(start + (end - start) * ease));
      if (p < 1) raf = requestAnimationFrame(animate);
    };
    raf = requestAnimationFrame(animate);
    return () => cancelAnimationFrame(raf);
  }, [resizedSize]);

  // Transition flash
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(t);
  }, [targetW, targetH, mode, file]);

  // Image metadata
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => setImageMeta({ width: img.width, height: img.height });
    img.src = url;
    return () => URL.revokeObjectURL(url);
  }, [file]);

  // Draw resized canvas
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !targetW || !targetH || isNaN(targetW) || isNaN(targetH) || targetW <= 0 || targetH <= 0) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      if (mode === "fit") {
        if (bgColor !== "transparent") { ctx.fillStyle = bgColor; ctx.fillRect(0, 0, targetW, targetH); }
        else if (format === "image/jpeg") { ctx.fillStyle = "#ffffff"; ctx.fillRect(0, 0, targetW, targetH); }
        else ctx.clearRect(0, 0, targetW, targetH);
        const scale = Math.min(targetW / img.width, targetH / img.height);
        ctx.drawImage(img, (targetW - img.width * scale) / 2, (targetH - img.height * scale) / 2, img.width * scale, img.height * scale);
      } else if (mode === "fill") {
        const scale = Math.max(targetW / img.width, targetH / img.height);
        ctx.drawImage(img, (targetW - img.width * scale) / 2 + cropOffset.x, (targetH - img.height * scale) / 2 + cropOffset.y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file, targetW, targetH, mode, bgColor, cropOffset, format]);

  // Draw original (before) canvas for comparison
  useEffect(() => {
    if (!comparisonMode) return;
    const canvas = originalCanvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx || !targetW || !targetH) return;
    const img = new Image();
    const url = URL.createObjectURL(file);
    img.onload = () => {
      canvas.width = targetW;
      canvas.height = targetH;
      ctx.clearRect(0, 0, targetW, targetH);
      // Fit original image (letterboxed) to show it clearly
      const scale = Math.min(targetW / img.width, targetH / img.height);
      ctx.drawImage(img, (targetW - img.width * scale) / 2, (targetH - img.height * scale) / 2, img.width * scale, img.height * scale);
      URL.revokeObjectURL(url);
    };
    img.src = url;
  }, [file, targetW, targetH, comparisonMode]);

  // Crop drag
  const handleStart = (clientX: number, clientY: number) => {
    if (mode !== "fill" || !imageMeta || comparisonMode) return;
    isDragging.current = true;
    setActiveDrag(true);
    dragStart.current = { x: clientX, y: clientY, offsetX: cropOffset.x, offsetY: cropOffset.y };
  };
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !canvasRef.current || !imageMeta) return;
    const canvas = canvasRef.current;
    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;
    const ratioX = targetW / canvas.clientWidth;
    const ratioY = targetH / canvas.clientHeight;
    const scale = Math.max(targetW / imageMeta.width, targetH / imageMeta.height);
    const maxDevX = (imageMeta.width * scale - targetW) / 2;
    const maxDevY = (imageMeta.height * scale - targetH) / 2;
    onCropOffsetChange({
      x: Math.max(-maxDevX, Math.min(maxDevX, dragStart.current.offsetX + dx * ratioX)),
      y: Math.max(-maxDevY, Math.min(maxDevY, dragStart.current.offsetY + dy * ratioY)),
    });
  };
  const handleEnd = () => { isDragging.current = false; setActiveDrag(false); };

  // Comparison slider drag
  const updateSlider = useCallback((clientX: number) => {
    const wrapper = wrapperRef.current;
    if (!wrapper) return;
    const rect = wrapper.getBoundingClientRect();
    setSliderPos(Math.max(2, Math.min(98, ((clientX - rect.left) / rect.width) * 100)));
  }, []);

  useEffect(() => {
    const onMove = (e: MouseEvent) => { if (isSliderDragging.current) updateSlider(e.clientX); };
    const onTouchMove = (e: TouchEvent) => { if (isSliderDragging.current && e.touches[0]) updateSlider(e.touches[0].clientX); };
    const onUp = () => { isSliderDragging.current = false; };
    window.addEventListener("mousemove", onMove);
    window.addEventListener("mouseup", onUp);
    window.addEventListener("touchmove", onTouchMove, { passive: true });
    window.addEventListener("touchend", onUp);
    return () => {
      window.removeEventListener("mousemove", onMove);
      window.removeEventListener("mouseup", onUp);
      window.removeEventListener("touchmove", onTouchMove);
      window.removeEventListener("touchend", onUp);
    };
  }, [updateSlider]);

  // Wrapper background is always checkerboard
  const wrapperStyle: React.CSSProperties = {
    aspectRatio: `${targetW} / ${targetH}`,
    touchAction: mode === "fill" && !comparisonMode ? "none" : "auto",
    backgroundColor: "#18181B",
    backgroundImage: "linear-gradient(45deg,#27272A 25%,transparent 25%),linear-gradient(-45deg,#27272A 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#27272A 75%),linear-gradient(-45deg,transparent 75%,#27272A 75%)",
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
  };

  // Only the resized canvas gets the background color selected by the user
  const resizedCanvasStyle: React.CSSProperties = {
    backgroundColor: bgColor === "transparent" ? "transparent" : bgColor,
  };

  const maxHClass = "max-h-[220px] min-[375px]:max-h-[260px] min-[410px]:max-h-[300px] sm:max-h-[380px] md:max-h-[480px] lg:max-h-[560px] xl:max-h-[640px]";

  return (
    <div className="flex flex-col items-center gap-3 w-full">

      {/* Before/After Toggle */}
      <div className="flex items-center justify-end w-full">
        <button
          type="button"
          onClick={() => { setComparisonMode((v) => !v); setSliderPos(50); }}
          className={`inline-flex items-center gap-1.5 px-3 py-1.5 rounded-xl text-[11px] font-semibold border transition-all duration-200 ${
            comparisonMode
              ? "border-primary bg-primary/15 text-primary-light shadow-sm shadow-primary/20"
              : "border-neutral-800 bg-neutral-900/80 text-neutral-400 hover:text-white hover:border-neutral-700"
          }`}
        >
          <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M9 19V6l12-3v13M9 19c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zm12-3c0 1.105-1.343 2-3 2s-3-.895-3-2 1.343-2 3-2 3 .895 3 2zM9 10l12-3" />
          </svg>
          {comparisonMode ? "Exit Compare" : "Before / After"}
        </button>
      </div>

      {/* Preview Wrapper */}
      <motion.div
        layout
        ref={wrapperRef}
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className={`relative inline-flex items-center justify-center border bg-[#121212] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-full ${maxHClass} ${
          isTransitioning
            ? "border-primary/60 shadow-primary/20 ring-4 ring-primary/20 scale-[0.98]"
            : "border-neutral-800/80 shadow-black/40"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); handleEnd(); }}
      >
        {/* Fill-mode hint */}
        {mode === "fill" && isHovered && !activeDrag && !comparisonMode && (
          <div className="absolute top-4 z-20 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-neutral-800 text-[10px] font-semibold text-neutral-300 pointer-events-none select-none flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
            </svg>
            Drag image to adjust crop
          </div>
        )}

        {comparisonMode ? (
          /* ──── COMPARISON MODE ──── */
          <div
            className={`relative select-none w-auto ${maxHClass}`}
            style={{ ...wrapperStyle, cursor: "col-resize" }}
            onMouseDown={(e) => { isSliderDragging.current = true; updateSlider(e.clientX); }}
            onTouchStart={(e) => { if (e.touches[0]) { isSliderDragging.current = true; updateSlider(e.touches[0].clientX); } }}
          >
            {/* AFTER canvas — full width base layer (with selected background color) */}
            <canvas
              ref={canvasRef}
              className={`block w-full h-full ${maxHClass}`}
              style={{ aspectRatio: `${targetW} / ${targetH}`, ...resizedCanvasStyle }}
            />

            {/* BEFORE canvas — clipped to left side (remains transparent/shows wrapper checkerboard background) */}
            <div className="absolute inset-0 overflow-hidden" style={{ width: `${sliderPos}%` }}>
              <canvas
                ref={originalCanvasRef}
                className="absolute top-0 left-0 h-full bg-transparent"
                style={{
                  aspectRatio: `${targetW} / ${targetH}`,
                  width: `${(100 / sliderPos) * 100}%`,
                  maxWidth: "none",
                }}
              />
            </div>

            {/* Divider line */}
            <div
              className="absolute top-0 bottom-0 z-20 pointer-events-none"
              style={{ left: `${sliderPos}%`, transform: "translateX(-50%)" }}
            >
              <div className="w-[2px] h-full bg-white shadow-[0_0_12px_rgba(255,255,255,0.9)]" />
              {/* Handle */}
              <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-9 h-9 rounded-full bg-white shadow-xl flex items-center justify-center pointer-events-auto">
                <svg className="w-4 h-4 text-neutral-700" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2.5" d="M8 9l-3 3 3 3M16 9l3 3-3 3" />
                </svg>
              </div>
            </div>

            {/* Labels */}
            <span className="absolute top-3 left-3 text-[10px] font-bold uppercase tracking-wider bg-black/75 text-white px-2 py-0.5 rounded-md pointer-events-none z-10 select-none border border-neutral-800">
              Original ({imageMeta ? `${imageMeta.width}×${imageMeta.height}` : "Before"})
            </span>
            <span className="absolute top-3 right-3 text-[10px] font-bold uppercase tracking-wider bg-primary/95 text-white px-2 py-0.5 rounded-md pointer-events-none z-10 select-none border border-primary/30">
              Resized ({targetW}×{targetH})
            </span>
          </div>
        ) : (
          /* ──── NORMAL MODE ──── */
          <canvas
            ref={canvasRef}
            onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
            onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
            onMouseUp={handleEnd}
            onTouchStart={(e) => { if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchMove={(e) => { if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY); }}
            onTouchEnd={handleEnd}
            className={`max-w-full ${maxHClass} w-auto h-auto select-none transition-all duration-300 ease-in-out ${
              isTransitioning ? "opacity-75 blur-[2px] scale-[0.98]" : "opacity-100 blur-0 scale-100"
            } ${mode === "fill" ? (activeDrag ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
            style={{ ...wrapperStyle, ...resizedCanvasStyle }}
          />
        )}
      </motion.div>

      {/* Output dimensions */}
      <div className="flex flex-col items-center gap-2.5 text-center mt-2 w-full">
        <span className="text-[10px] sm:text-xs text-neutral-400 font-semibold uppercase tracking-wider">
          Output Dimensions:
        </span>
        <div className="flex items-center justify-center gap-2.5 font-mono text-sm sm:text-base font-bold">
          <span className={`flex items-center gap-1 bg-[#161616]/85 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
            isTransitioning ? "scale-105 text-primary-light border-primary/30" : "text-accent border-neutral-850"
          }`}>
            <span className="text-neutral-500 font-sans text-[10px] font-semibold mr-0.5">↔ Width:</span>
            <span>{targetW} px</span>
          </span>
          <span className="text-neutral-600">×</span>
          <span className={`flex items-center gap-1 bg-[#161616]/85 px-3 py-1.5 rounded-xl border transition-all duration-300 ${
            isTransitioning ? "scale-105 text-primary-light border-primary/30" : "text-accent border-neutral-850"
          }`}>
            <span className="text-neutral-500 font-sans text-[10px] font-semibold mr-0.5">↕ Height:</span>
            <span>{targetH} px</span>
          </span>
        </div>
        {selectedCategory !== "Custom" ? (
          <button
            type="button"
            onClick={() => onPresetSelect({ name: "User-defined", w: targetW, h: targetH }, "Custom")}
            className="text-[10px] text-neutral-500 hover:text-primary-light transition-colors underline font-semibold mt-0.5"
          >
            Click here to customize size
          </button>
        ) : (
          <span className="text-[10px] text-neutral-500 font-semibold mt-0.5">
            Custom Size Mode (Edit in settings on left)
          </span>
        )}
      </div>

      {/* File size card */}
      <div className="flex items-center justify-between w-full max-w-sm px-5 py-3.5 bg-[#161616]/60 border border-white/5 rounded-2xl mt-2.5 shadow-inner select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Original Size</span>
          <span className="font-mono text-xs sm:text-sm text-neutral-300 font-semibold">{formatFileSize(file.size)}</span>
        </div>
        <div className="w-10 h-6 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {isCalculatingSize ? (
              <motion.span key="spinner" initial={{ opacity: 0, scale: 0.6, rotate: -90 }} animate={{ opacity: 1, scale: 1, rotate: 0 }} exit={{ opacity: 0, scale: 0.6, rotate: 90 }} transition={{ duration: 0.2 }}
                className="w-4 h-4 border-2 border-[#00C2A8] border-t-transparent rounded-full animate-spin block" />
            ) : (
              <motion.span key="arrow" initial={{ opacity: 0, scale: 0.6 }} animate={{ opacity: 1, scale: 1 }} exit={{ opacity: 0, scale: 0.6 }} transition={{ duration: 0.2 }}
                className="text-neutral-600 font-bold text-base block">→</motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[9px] text-neutral-450 font-semibold uppercase tracking-wider">Resized Size</span>
          <span className="font-mono text-xs sm:text-sm text-[#00C2A8] font-bold">
            <span className={`transition-all duration-300 ease-in-out inline-block ${isCalculatingSize ? "opacity-50 scale-95 blur-[0.5px]" : "opacity-100 scale-100 blur-0"}`}>
              {animatedSize !== null ? formatFileSize(animatedSize) : "—"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
