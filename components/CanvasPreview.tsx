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
  const isDragging = useRef<boolean>(false);
  const dragStart = useRef<{ x: number; y: number; offsetX: number; offsetY: number }>({
    x: 0,
    y: 0,
    offsetX: 0,
    offsetY: 0,
  });

  const [imageMeta, setImageMeta] = useState<{ width: number; height: number } | null>(null);
  const [isHovered, setIsHovered] = useState<boolean>(false);
  const [activeDrag, setActiveDrag] = useState<boolean>(false);
  const [isTransitioning, setIsTransitioning] = useState<boolean>(false);

  // Smoothly animate the resized size changes (number counter)
  const [animatedSize, setAnimatedSize] = useState<number | null>(null);
  useEffect(() => {
    if (resizedSize === null) {
      setAnimatedSize(null);
      return;
    }
    if (animatedSize === null) {
      setAnimatedSize(resizedSize);
      return;
    }

    const start = animatedSize;
    const end = resizedSize;
    const duration = 750; // Increased to 750ms for a smoother, premium feel
    const startTime = performance.now();

    let animationFrameId: number;

    const animate = (currentTime: number) => {
      const elapsed = currentTime - startTime;
      const progress = Math.min(elapsed / duration, 1);
      
      // Ease out cubic: starts fast, decelerates to a gentle stop
      const easeProgress = 1 - Math.pow(1 - progress, 3);
      const currentVal = Math.round(start + (end - start) * easeProgress);
      
      setAnimatedSize(currentVal);

      if (progress < 1) {
        animationFrameId = requestAnimationFrame(animate);
      }
    };

    animationFrameId = requestAnimationFrame(animate);

    return () => {
      cancelAnimationFrame(animationFrameId);
    };
  }, [resizedSize]);

  // Trigger smooth transition animation when target dimensions or file changes
  useEffect(() => {
    setIsTransitioning(true);
    const timer = setTimeout(() => {
      setIsTransitioning(false);
    }, 400); // matches the duration of the CSS transition
    return () => clearTimeout(timer);
  }, [targetW, targetH, mode, file]);

  // Load image and set metadata
  useEffect(() => {
    const img = new Image();
    let objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      setImageMeta({ width: img.width, height: img.height });
    };

    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file]);

  // Handle canvas drawing
  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    // Guard: Do not attempt to draw if dimensions are invalid
    if (!targetW || !targetH || isNaN(targetW) || isNaN(targetH) || targetW <= 0 || targetH <= 0) {
      return;
    }

    const img = new Image();
    let objectUrl = URL.createObjectURL(file);

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
        } else {
          ctx.clearRect(0, 0, targetW, targetH);
        }
        const scale = Math.min(targetW / img.width, targetH / img.height);
        const x = (targetW - img.width * scale) / 2;
        const y = (targetH - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else if (mode === "fill") {
        const scale = Math.max(targetW / img.width, targetH / img.height);
        // Draw centered but with crop offset
        const x = (targetW - img.width * scale) / 2 + cropOffset.x;
        const y = (targetH - img.height * scale) / 2 + cropOffset.y;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
    };

    img.src = objectUrl;

    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, targetW, targetH, mode, bgColor, cropOffset, format]);

  // Drag handlers
  const handleStart = (clientX: number, clientY: number) => {
    if (mode !== "fill" || !imageMeta) return;
    isDragging.current = true;
    setActiveDrag(true);
    dragStart.current = {
      x: clientX,
      y: clientY,
      offsetX: cropOffset.x,
      offsetY: cropOffset.y,
    };
  };

  const handleMove = (clientX: number, clientY: number) => {
    if (!isDragging.current || !canvasRef.current || !imageMeta) return;

    const canvas = canvasRef.current;
    // Calculate client-to-canvas pixel ratio
    const ratioX = targetW / canvas.clientWidth;
    const ratioY = targetH / canvas.clientHeight;

    const dx = clientX - dragStart.current.x;
    const dy = clientY - dragStart.current.y;

    const scale = Math.max(targetW / imageMeta.width, targetH / imageMeta.height);
    const scaledW = imageMeta.width * scale;
    const scaledH = imageMeta.height * scale;

    const maxDevX = (scaledW - targetW) / 2;
    const maxDevY = (scaledH - targetH) / 2;

    // Calculate new offsets and clamp within boundaries
    const newX = Math.max(-maxDevX, Math.min(maxDevX, dragStart.current.offsetX + dx * ratioX));
    const newY = Math.max(-maxDevY, Math.min(maxDevY, dragStart.current.offsetY + dy * ratioY));

    onCropOffsetChange({ x: newX, y: newY });
  };

  const handleEnd = () => {
    isDragging.current = false;
    setActiveDrag(false);
  };

  // Determine cursor based on state
  const getCursorClass = () => {
    if (mode !== "fill") return "cursor-default";
    return activeDrag ? "cursor-grabbing" : "cursor-grab";
  };

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Outer Preview Wrapper */}
      <motion.div 
        layout
        transition={{ type: "spring", stiffness: 180, damping: 24 }}
        className={`relative inline-flex items-center justify-center border bg-[#121212] rounded-2xl sm:rounded-3xl overflow-hidden shadow-2xl mx-auto max-w-full max-h-[220px] min-[375px]:max-h-[260px] min-[410px]:max-h-[300px] sm:max-h-[380px] md:max-h-[480px] lg:max-h-[560px] xl:max-h-[640px] ${
          isTransitioning 
            ? "border-primary/60 shadow-primary/20 ring-4 ring-primary/20 scale-[0.98]" 
            : "border-neutral-800/80 shadow-black/40"
        }`}
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleEnd();
        }}
      >
        {/* Drag Hint Overlay */}
        {mode === "fill" && isHovered && !activeDrag && (
          <div className="absolute top-4 z-20 px-3 py-1.5 rounded-full bg-black/80 backdrop-blur-md border border-neutral-800 text-[10px] font-semibold text-neutral-300 pointer-events-none select-none flex items-center gap-1.5 animate-fade-in">
            <svg className="w-3.5 h-3.5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
               <path strokeLinecap="round" strokeLinejoin="round" strokeWidth="2" d="M7 11.5V14m0-2.5v-6a1.5 1.5 0 113 0m-3 6a1.5 1.5 0 00-3 0v2a7.5 7.5 0 0015 0v-5a1.5 1.5 0 013 0m-6-3V11m0-5.5v-1a1.5 1.5 0 013 0v1" />
            </svg>
            Drag image to adjust crop
          </div>
        )}

        {/* Live Canvas Element */}
        <canvas
          ref={canvasRef}
          onMouseDown={(e) => handleStart(e.clientX, e.clientY)}
          onMouseMove={(e) => handleMove(e.clientX, e.clientY)}
          onMouseUp={handleEnd}
          onTouchStart={(e) => {
            if (e.touches[0]) {
              handleStart(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchMove={(e) => {
            if (e.touches[0]) {
              handleMove(e.touches[0].clientX, e.touches[0].clientY);
            }
          }}
          onTouchEnd={handleEnd}
          className={`max-w-full max-h-[220px] min-[375px]:max-h-[260px] min-[410px]:max-h-[300px] sm:max-h-[380px] md:max-h-[480px] lg:max-h-[560px] xl:max-h-[640px] w-auto h-auto select-none transition-all duration-300 ease-in-out ${
            isTransitioning ? "opacity-75 blur-[2px] scale-[0.98]" : "opacity-100 blur-0 scale-100"
          } ${getCursorClass()}`}
          style={{
            aspectRatio: `${targetW} / ${targetH}`,
            touchAction: mode === "fill" ? "none" : "auto", // Prevent page scroll during drag on mobile
            backgroundColor: bgColor === "transparent" ? "#18181B" : bgColor,
            backgroundImage: bgColor === "transparent" 
              ? "linear-gradient(45deg, #27272A 25%, transparent 25%), linear-gradient(-45deg, #27272A 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #27272A 75%), linear-gradient(-45deg, transparent 75%, #27272A 75%)" 
              : undefined,
            backgroundSize: bgColor === "transparent" ? "16px 16px" : undefined,
            backgroundPosition: bgColor === "transparent" ? "0 0, 0 8px, 8px -8px, -8px 0" : undefined,
            transitionProperty: "aspect-ratio, transform, opacity, filter",
          }}
        />
      </motion.div>
      {/* Output size display indicator */}
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
            className="text-[10px] text-neutral-500 hover:text-primary-light transition-colors underline font-semibold mt-0.5 flex items-center gap-1"
          >
            Click here to customize size
          </button>
        ) : (
          <span className="text-[10px] text-neutral-500 font-semibold mt-0.5">
            Custom Size Mode (Edit in settings on left)
          </span>
        )}
      </div>

      {/* File Size Comparison Card */}
      <div className="flex items-center justify-between w-full max-w-sm px-5 py-3.5 bg-[#161616]/60 border border-white/5 rounded-2xl mt-2.5 shadow-inner select-none">
        <div className="flex flex-col items-start gap-0.5">
          <span className="text-[9px] text-neutral-400 font-semibold uppercase tracking-wider">Original Size</span>
          <span className="font-mono text-xs sm:text-sm text-neutral-300 font-semibold">{formatFileSize(file.size)}</span>
        </div>
        
        {/* Animated Arrow/Spinner Indicator - Prevents layout shifts */}
        <div className="w-10 h-6 flex items-center justify-center relative">
          <AnimatePresence mode="wait">
            {isCalculatingSize ? (
              <motion.span
                key="spinner"
                initial={{ opacity: 0, scale: 0.6, rotate: -90 }}
                animate={{ opacity: 1, scale: 1, rotate: 0 }}
                exit={{ opacity: 0, scale: 0.6, rotate: 90 }}
                transition={{ duration: 0.2, ease: "easeInOut" }}
                className="w-4 h-4 border-2 border-[#00C2A8] border-t-transparent rounded-full animate-spin block"
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
          <span className="text-[9px] text-neutral-450 font-semibold uppercase tracking-wider">Resized Size</span>
          <span className="font-mono text-xs sm:text-sm text-[#00C2A8] font-bold">
            <span 
              className={`transition-all duration-300 ease-in-out inline-block ${
                isCalculatingSize ? "opacity-50 scale-95 blur-[0.5px]" : "opacity-100 scale-100 blur-0"
              }`}
            >
              {animatedSize !== null ? formatFileSize(animatedSize) : "—"}
            </span>
          </span>
        </div>
      </div>
    </div>
  );
}

// Helper to format bytes into readable KB/MB
function formatFileSize(bytes: number): string {
  if (bytes === 0) return "0 B";
  const k = 1024;
  const sizes = ["B", "KB", "MB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(1)) + " " + sizes[i];
}
