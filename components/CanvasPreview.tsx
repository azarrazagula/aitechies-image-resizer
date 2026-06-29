"use client";

import React, { useRef, useEffect, useState } from "react";
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
  onCustomDimensionChange?: (w: number, h: number) => void;
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
  onCustomDimensionChange,
  resizedSize,
  format,
  isCalculatingSize = false,
}: CanvasPreviewProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);       // Desktop resized canvas
  const mobileCanvasRef = useRef<HTMLCanvasElement>(null); // Mobile canvas (synced)
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0, y: 0, offsetX: 0, offsetY: 0,
  });

  // ── Core state ───────────────────────────────────────────
  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [originalUrl, setOriginalUrl] = useState<string>("");
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeDrag, setActiveDrag] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);
  const [animatedSize, setAnimatedSize] = useState<number | null>(null);

  // ── UI toggle state ──────────────────────────────────────
  /** Desktop: show original panel side-by-side (default OFF) */
  const [showOriginal, setShowOriginal] = useState<boolean>(false);
  /** Inline W/H editor: collapsed by default */
  const [showDimEdit, setShowDimEdit] = useState<boolean>(false);

  // ── Inline dimension inputs ──────────────────────────────
  const [localW, setLocalW] = useState<string>(targetW.toString());
  const [localH, setLocalH] = useState<string>(targetH.toString());
  const didMountRef = useRef(false);

  // Sync inputs when preset changes externally
  useEffect(() => {
    setLocalW(targetW.toString());
    setLocalH(targetH.toString());
  }, [targetW, targetH]);

  // Debounced dimension change upward
  useEffect(() => {
    if (!didMountRef.current) { didMountRef.current = true; return; }
    const w = parseInt(localW) || 0;
    const h = parseInt(localH) || 0;
    if (w <= 0 || h <= 0) return;
    if (w === targetW && h === targetH) return;
    const timer = setTimeout(() => {
      onCustomDimensionChange?.(w, h);
    }, 350);
    return () => clearTimeout(timer);
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [localW, localH]);

  // ── Animated size counter ────────────────────────────────
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
  // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [resizedSize]);

  // ── Transition flash ─────────────────────────────────────
  useEffect(() => {
    setIsTransitioning(true);
    const t = setTimeout(() => setIsTransitioning(false), 400);
    return () => clearTimeout(t);
  }, [targetW, targetH, mode, file]);

  // ── Image metadata + stable original URL ─────────────────
  useEffect(() => {
    const img = new Image();
    const url = URL.createObjectURL(file);
    setOriginalUrl(url);
    img.onload = () => setImageMeta({ width: img.width, height: img.height });
    img.src = url;
    return () => {
      URL.revokeObjectURL(url);
      setOriginalUrl("");
    };
  }, [file]);

  // ── Draw resized canvas + sync to mobile ─────────────────
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
        if (bgColor !== "transparent") {
          ctx.fillStyle = bgColor;
          ctx.fillRect(0, 0, targetW, targetH);
        } else if (format === "image/jpeg") {
          ctx.fillStyle = "#ffffff";
          ctx.fillRect(0, 0, targetW, targetH);
        } else ctx.clearRect(0, 0, targetW, targetH);
        const scale = Math.min(targetW / img.width, targetH / img.height);
        ctx.drawImage(img, (targetW - img.width * scale) / 2, (targetH - img.height * scale) / 2, img.width * scale, img.height * scale);
      } else if (mode === "fill") {
        const scale = Math.max(targetW / img.width, targetH / img.height);
        ctx.drawImage(img, (targetW - img.width * scale) / 2 + cropOffset.x, (targetH - img.height * scale) / 2 + cropOffset.y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
      URL.revokeObjectURL(url);
      // Mirror to mobile canvas
      const mobile = mobileCanvasRef.current;
      if (mobile) {
        mobile.width = targetW;
        mobile.height = targetH;
        const mCtx = mobile.getContext("2d");
        if (mCtx) mCtx.drawImage(canvas, 0, 0);
      }
    };
    img.src = url;
  }, [file, targetW, targetH, mode, bgColor, cropOffset, format]);

  // ── Crop drag ─────────────────────────────────────────────
  const handleStart = (clientX: number, clientY: number) => {
    if (mode !== "fill" || !imageMeta) return;
    isDragging.current = true;
    setActiveDrag(true);
    dragStart.current = { x: clientX, y: clientY, offsetX: cropOffset.x, offsetY: cropOffset.y };
  };
  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !imageMeta) return;
    const canvas = (mobileCanvasRef.current?.clientWidth ?? 0) > 0
      ? mobileCanvasRef.current!
      : canvasRef.current;
    if (!canvas) return;
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

  // ── Styles ────────────────────────────────────────────────
  const checkerStyle: React.CSSProperties = {
    backgroundColor: "#18181B",
    backgroundImage: "linear-gradient(45deg,#27272A 25%,transparent 25%),linear-gradient(-45deg,#27272A 25%,transparent 25%),linear-gradient(45deg,transparent 75%,#27272A 75%),linear-gradient(-45deg,transparent 75%,#27272A 75%)",
    backgroundSize: "16px 16px",
    backgroundPosition: "0 0,0 8px,8px -8px,-8px 0",
  };
  const resizedWrapperStyle: React.CSSProperties = {
    ...checkerStyle,
    aspectRatio: `${targetW} / ${targetH}`,
    touchAction: mode === "fill" ? "none" : "auto",
  };
  const resizedCanvasStyle: React.CSSProperties = {
    backgroundColor: bgColor === "transparent" ? "transparent" : bgColor,
  };

  // Mobile canvas max-height
  const maxHClass = "max-h-[200px] min-[375px]:max-h-[240px] min-[410px]:max-h-[280px] sm:max-h-[340px] md:max-h-[400px]";

  // ── Framer Motion variants ─────────────────────────────────
  /** Original panel slides in from the left */
  const originalPanelVariants = {
    hidden: { x: "-60%", opacity: 0, width: "0%", marginRight: 0 },
    visible: { x: 0, opacity: 1, width: "50%", marginRight: 0 },
  };
  /** W/H edit inputs expand downward from the pill */
  const dimEditVariants = {
    hidden: { opacity: 0, height: 0, scale: 0.95, y: -6 },
    visible: { opacity: 1, height: "auto", scale: 1, y: 0 },
  };

  // Calculate relative visual widths for side-by-side comparison
  let originalWidthStyle: React.CSSProperties = { width: "100%" };
  let resizedWidthStyle: React.CSSProperties = { width: "100%" };

  if (showOriginal && imageMeta && targetW && targetH) {
    const origDominant = Math.max(imageMeta.width, imageMeta.height);
    const destDominant = Math.max(targetW, targetH);
    const absoluteMax = Math.max(origDominant, destDominant);

    const baseColumnWidth = 350; // Standard max column width in pixels on desktop

    if (absoluteMax >= baseColumnWidth) {
      // One of them is larger than the column, so we use percentage scaling
      if (origDominant >= destDominant) {
        // Original is larger or equal
        originalWidthStyle = { width: "100%" };
        resizedWidthStyle = { width: `${Math.max(35, (destDominant / origDominant) * 100)}%` };
      } else {
        // Resized is larger
        originalWidthStyle = { width: `${Math.max(35, (origDominant / destDominant) * 100)}%` };
        resizedWidthStyle = { width: "100%" };
      }
    } else {
      // Both are smaller than the column, so we show them at their exact pixel sizes!
      originalWidthStyle = { width: `${origDominant}px` };
      resizedWidthStyle = { width: `${destDominant}px` };
    }
  }

  return (
    <div className="flex flex-col items-center gap-3 w-full">

      {/* ══════════════════════════════════════════════════════
          DESKTOP ONLY (lg+): Toggleable Original + Resized
          ══════════════════════════════════════════════════════ */}
      <div className="hidden lg:flex flex-col gap-3 w-full">

        {/* ── Section header with compare toggle ── */}
        <div className="flex items-center justify-between px-1">
          {/* Left: ← Compare toggle button */}
          <motion.button
            onClick={() => setShowOriginal(v => !v)}
            whileHover={{ scale: 1.04 }}
            whileTap={{ scale: 0.96 }}
            className={`flex items-center gap-1.5 px-3 py-1.5 rounded-xl border text-[10px] sm:text-xs font-semibold transition-all duration-300 select-none ${
              showOriginal
                ? "bg-neutral-800 border-neutral-700 text-neutral-200"
                : "bg-neutral-900/80 border-neutral-800 text-neutral-400 hover:border-neutral-700 hover:text-neutral-300"
            }`}
          >
            <motion.span
              animate={{ rotate: showOriginal ? 0 : 180 }}
              transition={{ type: "spring", stiffness: 260, damping: 22 }}
              className="inline-block text-[11px] sm:text-xs"
            >
              ←
            </motion.span>
            <span>{showOriginal ? "Hide Original" : "Compare Original"}</span>
          </motion.button>

          {/* Right: Resized dimensions badge */}
          <span className={`text-[10px] sm:text-xs font-mono px-2.5 py-1 rounded-lg border transition-all duration-300 ${
            isTransitioning
              ? "text-[#8B5CF6] bg-[#8B5CF6]/10 border-[#8B5CF6]/30"
              : "text-[#8B5CF6]/80 bg-neutral-900 border-neutral-800"
          }`}>
            ↔ {targetW}px  ↕ {targetH}px
          </span>
        </div>

        {/* ── Preview panels ── */}
        <div className="flex gap-4 w-full overflow-hidden">

          {/* Original panel — slides in from left */}
          <AnimatePresence>
            {showOriginal && (
              <motion.div
                key="original-panel"
                variants={originalPanelVariants}
                initial="hidden"
                animate="visible"
                exit="hidden"
                transition={{ type: "spring", stiffness: 220, damping: 26, mass: 0.9 }}
                className="flex flex-col gap-2 min-w-0 overflow-hidden"
                style={{ width: "50%" }}
              >
                {/* Original label row */}
                <div className="flex items-center justify-between px-0.5">
                  <span className="text-[10px] sm:text-xs font-bold uppercase tracking-widest text-neutral-500 flex items-center gap-1.5">
                    <span className="w-1.5 h-1.5 rounded-full bg-neutral-700 inline-block" />
                    Original
                  </span>
                  <span className="text-[10px] sm:text-xs font-mono text-neutral-500 bg-neutral-900/80 border border-neutral-800 px-2 py-0.5 rounded-lg">
                    {imageMeta ? `${imageMeta.width}×${imageMeta.height}` : "—"}
                  </span>
                </div>

                {/* Original image — natural aspect ratio */}
                <div
                  className="relative border border-neutral-800/60 rounded-2xl overflow-hidden shadow-lg mx-auto"
                  style={{
                    ...checkerStyle,
                    ...originalWidthStyle
                  }}
                >
                  {originalUrl && (
                    <img
                      src={originalUrl}
                      alt="Original uploaded image"
                      className="w-full h-auto block"
                      draggable={false}
                    />
                  )}
                </div>
              </motion.div>
            )}
          </AnimatePresence>

          {/* Resized panel — always visible, centered and constrained when original is hidden */}
          <motion.div
            layout
            transition={{ type: "spring", stiffness: 200, damping: 26 }}
            className={`flex flex-col gap-2 min-w-0 ${
              showOriginal ? "w-1/2" : "max-w-[450px] w-full mx-auto"
            }`}
          >
            {/* Resized label row */}
            <div className="flex items-center justify-between px-0.5">
              <span className={`text-[10px] sm:text-xs font-bold uppercase tracking-widest flex items-center gap-1.5 transition-colors duration-300 ${
                isTransitioning ? "text-[#8B5CF6]" : "text-[#8B5CF6]/80"
              }`}>
                <span className={`w-1.5 h-1.5 rounded-full inline-block transition-colors duration-300 ${
                  isTransitioning ? "bg-[#8B5CF6] animate-pulse" : "bg-[#8B5CF6]"
                }`} />
                Resized
              </span>
              <span className="text-[10px] sm:text-xs font-mono text-neutral-600 select-none">
                {mode === "fit" ? "Letterbox" : mode === "fill" ? "Center-crop" : "Stretch"}
              </span>
            </div>

            {/* Resized canvas */}
            <motion.div
              layout
              className={`relative border rounded-2xl overflow-hidden shadow-lg transition-colors duration-300 mx-auto ${
                isTransitioning
                  ? "border-[#8B5CF6]/60 ring-2 ring-[#8B5CF6]/20"
                  : "border-[#8B5CF6]/20"
              }`}
              style={{
                ...resizedWrapperStyle,
                ...resizedWidthStyle
              }}
              onMouseEnter={() => setIsHovered(true)}
              onMouseLeave={() => { setIsHovered(false); handleEnd(); }}
            >
              {/* Drag-to-crop tooltip */}
              {mode === "fill" && isHovered && !activeDrag && (
                <div className="absolute top-3 left-1/2 -translate-x-1/2 z-20 px-3 py-1.5 rounded-full bg-black/85 backdrop-blur-md border border-neutral-800 text-[10px] font-semibold text-neutral-300 pointer-events-none select-none flex items-center gap-1.5 whitespace-nowrap">
                  <svg className="w-3 h-3" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
                  </svg>
                  Drag to adjust crop
                </div>
              )}
              <canvas
                ref={canvasRef}
                onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
                onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
                onMouseUp={handleEnd}
                onTouchStart={(e) => { if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
                onTouchMove={(e) => { if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY); }}
                onTouchEnd={handleEnd}
                className={`w-full h-auto block select-none transition-opacity duration-300 ${
                  isTransitioning ? "opacity-75 blur-[1.5px]" : "opacity-100"
                } ${mode === "fill" ? (activeDrag ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
                style={{ aspectRatio: `${targetW}/${targetH}`, ...resizedCanvasStyle }}
              />
            </motion.div>
          </motion.div>
        </div>
      </div>

      {/* ══════════════════════════════════════════════════════
          MOBILE / TABLET (below lg): Single resized canvas
          ══════════════════════════════════════════════════════ */}
      <motion.div
        layout
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className={`lg:hidden relative flex items-center justify-center border bg-[#121212] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mx-auto w-full ${
          isTransitioning
            ? "border-[#8B5CF6]/60 shadow-[#8B5CF6]/20 ring-4 ring-[#8B5CF6]/20 scale-[0.98]"
            : "border-neutral-800/80 shadow-black/40"
        }`}
        style={{ aspectRatio: `${targetW} / ${targetH}`, maxHeight: "300px" }}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => { setIsHovered(false); handleEnd(); }}
      >
        {mode === "fill" && isHovered && !activeDrag && (
          <div className="absolute top-4 z-20 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-neutral-800 text-[10px] font-semibold text-neutral-300 pointer-events-none select-none flex items-center gap-1.5">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
            </svg>
            Drag to adjust crop
          </div>
        )}
        <canvas
          ref={mobileCanvasRef}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onTouchStart={(e) => { if (e.touches[0]) handleStart(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchMove={(e) => { if (e.touches[0]) handleMove(e.touches[0].clientX, e.touches[0].clientY); }}
          onTouchEnd={handleEnd}
          className={`w-full h-full select-none transition-all duration-300 ${
            isTransitioning ? "opacity-75 blur-[2px] scale-[0.98]" : "opacity-100 blur-0 scale-100"
          } ${mode === "fill" ? (activeDrag ? "cursor-grabbing" : "cursor-grab") : "cursor-default"}`}
          style={{ objectFit: "contain", ...resizedCanvasStyle }}
        />
      </motion.div>

      {/* ══════════════════════════════════════════════════════
          Dimension display pill (instantly editable inline when clicked)
          ══════════════════════════════════════════════════════ */}
      <div className="flex flex-col items-center w-full mt-0.5 select-none">
        <motion.div
          layout
          transition={{ type: "spring", stiffness: 300, damping: 25 }}
          className={`flex items-center gap-1.5 lg:gap-3 px-2 lg:px-4 py-1.5 lg:py-2 rounded-2xl border transition-all duration-300 max-w-full ${
            showDimEdit
              ? "bg-[#18181B] border-[#8B5CF6]/50 shadow-[0_0_20px_rgba(139,92,246,0.25)]"
              : "bg-[#161616]/80 border-neutral-800 hover:border-neutral-700 cursor-pointer"
          }`}
          onClick={() => {
            if (!showDimEdit) setShowDimEdit(true);
          }}
        >
          <AnimatePresence mode="wait">
            {!showDimEdit ? (
              <motion.div
                key="read-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 lg:gap-3"
              >
                {/* Width label & value */}
                <span className="flex items-center gap-1 lg:gap-1.5">
                  <span className="text-neutral-500 text-[10px] lg:text-[11px] font-bold">↔</span>
                  <span className="text-[10px] text-neutral-450 font-semibold">
                    W<span className="hidden lg:inline">idth</span>
                  </span>
                  <span className="font-mono font-bold text-xs lg:text-sm text-neutral-250">
                    {localW}
                  </span>
                  <span className="text-neutral-600 text-[9px] lg:text-[10px]">px</span>
                </span>

                <span className="text-neutral-700 font-bold text-xs lg:text-sm">×</span>

                {/* Height label & value */}
                <span className="flex items-center gap-1 lg:gap-1.5">
                  <span className="text-neutral-500 text-[10px] lg:text-[11px] font-bold">↕</span>
                  <span className="text-[10px] text-neutral-450 font-semibold">
                    H<span className="hidden lg:inline">eight</span>
                  </span>
                  <span className="font-mono font-bold text-xs lg:text-sm text-neutral-250">
                    {localH}
                  </span>
                  <span className="text-neutral-600 text-[9px] lg:text-[10px]">px</span>
                </span>

                {/* Edit icon */}
                <span className="text-neutral-500 hover:text-neutral-400 text-xs lg:text-sm ml-0.5">
                  ✎
                </span>
              </motion.div>
            ) : (
              <motion.div
                key="edit-mode"
                initial={{ opacity: 0, scale: 0.95 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.95 }}
                transition={{ duration: 0.15 }}
                className="flex items-center gap-1.5 lg:gap-2"
                onClick={(e) => e.stopPropagation()} // Prevent closing when clicking inputs
              >
                {/* Width input */}
                <label className="flex items-center gap-1 bg-[#111]/60 border border-neutral-800/80 rounded-xl px-1.5 lg:px-2.5 py-1 lg:py-1.5 focus-within:border-[#8B5CF6]/50 transition-colors">
                  <span className="text-neutral-500 text-[10px] lg:text-[11px] font-bold">↔</span>
                  <span className="text-[10px] text-neutral-450 font-semibold select-none">
                    W<span className="hidden lg:inline">idth</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={localW}
                    onChange={(e) => setLocalW(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setShowDimEdit(false);
                    }}
                    className="w-11 lg:w-14 bg-transparent font-mono font-bold text-xs lg:text-sm text-[#8B5CF6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                    autoFocus
                  />
                  <span className="text-neutral-600 text-[9px] lg:text-[10px] select-none">px</span>
                </label>

                <span className="text-neutral-700 font-bold text-xs lg:text-sm">×</span>

                {/* Height input */}
                <label className="flex items-center gap-1 bg-[#111]/60 border border-neutral-800/80 rounded-xl px-1.5 lg:px-2.5 py-1 lg:py-1.5 focus-within:border-[#8B5CF6]/50 transition-colors">
                  <span className="text-neutral-500 text-[10px] lg:text-[11px] font-bold">↕</span>
                  <span className="text-[10px] text-neutral-450 font-semibold select-none">
                    H<span className="hidden lg:inline">eight</span>
                  </span>
                  <input
                    type="number"
                    min="1"
                    max="10000"
                    value={localH}
                    onChange={(e) => setLocalH(e.target.value)}
                    onKeyDown={(e) => {
                      if (e.key === "Enter") setShowDimEdit(false);
                    }}
                    className="w-11 lg:w-14 bg-transparent font-mono font-bold text-xs lg:text-sm text-[#8B5CF6] focus:outline-none [appearance:textfield] [&::-webkit-outer-spin-button]:appearance-none [&::-webkit-inner-spin-button]:appearance-none"
                  />
                  <span className="text-neutral-600 text-[9px] lg:text-[10px] select-none">px</span>
                </label>

                {/* Confirm/Save button */}
                <motion.button
                  onClick={() => setShowDimEdit(false)}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                  className="w-6 h-6 lg:w-7 lg:h-7 rounded-lg lg:rounded-xl bg-neutral-800 border border-neutral-700 hover:border-[#8B5CF6]/40 hover:bg-[#1f1f2e] flex items-center justify-center text-neutral-300 hover:text-[#8B5CF6] transition-colors"
                >
                  ✓
                </motion.button>
              </motion.div>
            )}
          </AnimatePresence>
        </motion.div>
      </div>

      {/* ══════════════════════════════════════════════════════
          File Size Card
          ══════════════════════════════════════════════════════ */}
      <div className="flex items-center justify-between w-full max-w-sm px-5 py-3.5 bg-[#161616]/60 border border-white/5 rounded-2xl shadow-inner select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Original Size</span>
          <span className="font-mono text-xs sm:text-sm text-neutral-300 font-semibold">{formatFileSize(file.size)}</span>
        </div>
        <div className="w-10 h-6 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {isCalculatingSize ? (
              <motion.span
                key="spinner"
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                transition={{ duration: 0.2 }}
                className="w-4 h-4 border-2 border-[#8B5CF6] border-t-transparent rounded-full animate-spin block"
              />
            ) : (
              <motion.span
                key="arrow"
                initial={{ opacity: 0, scale: 0.6 }}
                animate={{ opacity: 1, scale: 1 }}
                exit={{ opacity: 0, scale: 0.6 }}
                transition={{ duration: 0.2 }}
                className="text-neutral-600 font-bold text-base block"
              >
                →
              </motion.span>
            )}
          </AnimatePresence>
        </div>
        <div className="flex flex-col items-end gap-0.5">
          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Resized Size</span>
          <span className="font-mono text-xs sm:text-sm text-[#8B5CF6] font-bold">
            <span className={`transition-all duration-300 inline-block ${isCalculatingSize ? "opacity-50 scale-95 blur-[0.5px]" : "opacity-100 scale-100"}`}>
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
