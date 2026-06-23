"use client";

import React, { useRef, useEffect } from "react";

interface CanvasPreviewProps {
  file: File;
  targetW: number;
  targetH: number;
  mode: "fit" | "fill" | "stretch";
  bgColor: string;
}

export default function CanvasPreview({
  file,
  targetW,
  targetH,
  mode,
  bgColor,
}: CanvasPreviewProps): JSX.Element {
  const canvasRef = useRef<HTMLCanvasElement>(null);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const img = new Image();
    let objectUrl = URL.createObjectURL(file);

    img.onload = () => {
      // Set actual canvas drawing size
      canvas.width = targetW;
      canvas.height = targetH;

      // Clear canvas
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
        const x = (targetW - img.width * scale) / 2;
        const y = (targetH - img.height * scale) / 2;
        ctx.drawImage(img, x, y, img.width * scale, img.height * scale);
      } else {
        ctx.drawImage(img, 0, 0, targetW, targetH);
      }
    };

    img.src = objectUrl;

    // Clean up
    return () => {
      URL.revokeObjectURL(objectUrl);
    };
  }, [file, targetW, targetH, mode, bgColor]);

  return (
    <div className="flex flex-col items-center gap-3 w-full">
      {/* Outer Preview Wrapper */}
      <div className="w-full relative flex items-center justify-center p-6 border border-neutral-800 bg-[#121212] rounded-3xl overflow-hidden min-h-[300px] max-h-[500px]">
        {/* Checkerboard Background for Transparency */}
        <div
          className="absolute inset-0 opacity-5 pointer-events-none"
          style={{
            backgroundImage: "linear-gradient(45deg, #fff 25%, transparent 25%), linear-gradient(-45deg, #fff 25%, transparent 25%), linear-gradient(45deg, transparent 75%, #fff 75%), linear-gradient(-45deg, transparent 75%, #fff 75%)",
            backgroundSize: "20px 20px",
            backgroundPosition: "0 0, 0 10px, 10px -10px, -10px 0",
          }}
        />

        {/* Live Canvas Element */}
        <canvas
          ref={canvasRef}
          className="relative z-10 max-w-full max-h-[400px] object-contain rounded-lg shadow-2xl border border-neutral-800/40"
          style={{
            aspectRatio: `${targetW} / ${targetH}`,
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
