"use client";

import React, { useRef, useEffect, useState } from "react";

interface CanvasPreviewProps {
  file: File;
  targetW: number;
  targetH: number;
  mode: "fit" | "fill" | "stretch";
  bgColor: string;
  cropOffset: { x: number; y: number };
  onCropOffsetChange: (offset: { x: number; y: number }) => void;
}

export default function CanvasPreview({
  file,
  targetW,
  targetH,
  mode,
  bgColor,
  cropOffset,
  onCropOffsetChange,
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
  }, [file, targetW, targetH, mode, bgColor, cropOffset]);

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
      <div 
        className="w-full relative flex items-center justify-center p-6 border border-neutral-800 bg-[#121212] rounded-3xl overflow-hidden min-h-[300px] max-h-[500px]"
        onMouseEnter={() => setIsHovered(true)}
        onMouseLeave={() => {
          setIsHovered(false);
          handleEnd();
        }}
      >
        {/* Checkerboard Background for Transparency */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
          }}
        />

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
          className={`relative z-10 max-w-full max-h-[400px] object-contain rounded-lg shadow-2xl border border-neutral-800/40 select-none ${getCursorClass()}`}
          style={{
            aspectRatio: `${targetW} / ${targetH}`,
            touchAction: mode === "fill" ? "none" : "auto", // Prevent page scroll during drag on mobile
          }}
        />
      </div>

      {/* Output size display indicator */}
      <div className="text-center space-y-1">
        <span className="text-xs text-neutral-400 font-semibold uppercase tracking-wider block">
          Output Dimensions
        </span>
        <span className="font-mono text-lg font-bold text-[#00C2A8]">
          {targetW} px × {targetH} px
        </span>
      </div>
    </div>
  );
}
