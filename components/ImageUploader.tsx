"use client";

import React, { useRef, useState } from "react";
import { motion } from "framer-motion";

interface ImageUploaderProps {
  onFilesSelect: (files: File[]) => void;
  disabled?: boolean;
}

export default function ImageUploader({
  onFilesSelect,
  disabled = false,
}: ImageUploaderProps): JSX.Element {
  const fileInputRef = useRef<HTMLInputElement>(null);
  const [isDragging, setIsDragging] = useState(false);

  const handleDragEnter = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    if (!disabled) {
      setIsDragging(true);
    }
  };

  const handleDragLeave = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);
  };

  const handleDragOver = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
  };

  const processFiles = (fileList: FileList | null) => {
    if (!fileList || fileList.length === 0) return;
    const validFiles: File[] = [];
    for (let i = 0; i < fileList.length; i++) {
      const file = fileList[i];
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
      onFilesSelect(validFiles);
    }
  };

  const handleDrop = (e: React.DragEvent<HTMLDivElement>): void => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragging(false);

    if (disabled) return;
    processFiles(e.dataTransfer.files);
  };

  const handleFileInputChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ): void => {
    if (disabled) return;
    processFiles(e.currentTarget.files);
  };

  const handleClick = (): void => {
    if (!disabled && fileInputRef.current) {
      fileInputRef.current.click();
    }
  };

  return (
    <div className="w-full">
      <motion.div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        initial={false}
        animate={{
          scale: isDragging ? 1.02 : 1,
          borderColor: isDragging ? "#6C47FF" : "#262626",
          backgroundColor: isDragging ? "rgba(108, 71, 255, 0.1)" : "rgba(22, 22, 22, 0.4)",
        }}
        whileHover={!disabled ? { scale: 1.01, borderColor: "rgba(108, 71, 255, 0.5)", backgroundColor: "rgba(22, 22, 22, 0.6)" } : {}}
        transition={{ type: "spring", stiffness: 300, damping: 20 }}
        className={`relative w-full px-4 py-8 sm:px-6 sm:py-12 md:py-16 rounded-3xl border-2 border-dashed cursor-pointer backdrop-blur-md transition-shadow duration-300 ${
          isDragging ? "shadow-[0_0_20px_rgba(108,71,255,0.2)]" : ""
        } ${disabled ? "opacity-60 cursor-not-allowed" : ""}`}
      >
        <input
          ref={fileInputRef}
          type="file"
          accept="image/png, image/jpeg, image/webp"
          onChange={handleFileInputChange}
          className="absolute w-px h-px opacity-0 pointer-events-none"
          disabled={disabled}
          multiple
        />

        <div className="flex flex-col items-center justify-center gap-4 text-center">
          {/* Cloud Upload Icon with motion container and glowing circle */}
          <div className="relative">
            {/* Glowing background circle */}
            <motion.div
              animate={{
                opacity: isDragging ? [0.4, 0.8, 0.4] : [0.1, 0.2, 0.1],
                scale: isDragging ? [1, 1.2, 1] : 1,
              }}
              transition={{
                duration: 2,
                repeat: Infinity,
                ease: "easeInOut",
              }}
              className="absolute inset-0 bg-primary rounded-2xl blur-md"
            />
            <motion.div
              animate={isDragging ? { y: [-4, 4, -4] } : { y: 0 }}
              transition={{
                duration: 1.5,
                repeat: isDragging ? Infinity : 0,
                ease: "easeInOut",
              }}
              className="relative p-4 rounded-2xl bg-[#161616] text-primary border border-primary/20 shadow-inner"
            >
              <svg
                className="w-8 h-8 sm:w-10 sm:h-10"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="1.5"
                  d="M7 16a4 4 0 01-.88-7.903A5 5 0 1115.9 6L16 6a5 5 0 011 9.9M15 13l-3-3m0 0l-3 3m3-3v12"
                />
              </svg>
            </motion.div>
          </div>

          <div className="space-y-1.5 px-2">
            <h2 className="text-base sm:text-lg md:text-xl font-semibold text-white tracking-tight">
              {isDragging ? "Drop your images here!" : "Drag and drop your image(s)"}
            </h2>
            <p className="text-neutral-400 text-xs sm:text-sm max-w-xs mx-auto">
              or click to browse from device (Multiple allowed)
            </p>
          </div>

          <div className="flex items-center justify-center mt-2">
            <motion.button
              type="button"
              whileTap={!disabled ? { scale: 0.95 } : {}}
              className="inline-flex items-center gap-2 px-4 py-2 sm:px-5 sm:py-2.5 bg-primary hover:bg-primary-dark text-white font-semibold text-xs sm:text-sm rounded-xl transition-all shadow-md shadow-primary/10 border border-primary/20"
            >
              <svg
                className="w-4 h-4"
                fill="none"
                stroke="currentColor"
                viewBox="0 0 24 24"
                xmlns="http://www.w3.org/2000/svg"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth="2"
                  d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-8l-4-4m0 0L8 8m4-4v12"
                />
              </svg>
              Select Images
            </motion.button>
          </div>

          <p className="text-[10px] sm:text-xs text-neutral-500 mt-1">
            Supports PNG, JPG, WEBP
          </p>
        </div>
      </motion.div>
    </div>
  );
}
