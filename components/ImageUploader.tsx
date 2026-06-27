"use client";

import React, { useRef, useState } from "react";

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
      <div
        onDragEnter={handleDragEnter}
        onDragLeave={handleDragLeave}
        onDragOver={handleDragOver}
        onDrop={handleDrop}
        onClick={handleClick}
        className={`relative w-full px-6 py-12 md:py-16 rounded-3xl border-2 border-dashed transition-all duration-300 cursor-pointer backdrop-blur-md ${
          isDragging
            ? "border-primary bg-primary/10"
            : "border-neutral-800 bg-[#161616]/40 hover:border-primary/50 hover:bg-[#161616]/60"
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
          {/* Cloud Upload Icon */}
          <div className="p-4 rounded-2xl bg-primary/5 text-primary border border-primary/10 shadow-inner transition-transform duration-300">
            <svg
              className="w-10 h-10"
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
          </div>

          <div className="space-y-1.5">
            <h2 className="text-lg sm:text-xl md:text-2xl font-semibold text-white">
              Drag and drop your image(s)
            </h2>
            <p className="text-neutral-400 text-sm sm:text-base">
              or click to browse from device (Multiple allowed)
            </p>
          </div>

          <div className="flex items-center justify-center mt-2">
            <button 
              type="button"
              className="inline-flex items-center gap-2 px-5 py-2.5 bg-primary hover:bg-primary-dark active:scale-95 text-white font-semibold text-sm sm:text-base rounded-xl transition-all shadow-md shadow-primary/10 border border-primary/20"
            >
              <svg
                className="w-4 h-4 sm:w-5 sm:h-5"
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
            </button>
          </div>

          <p className="text-xs sm:text-sm text-neutral-550 mt-1">
            Supports PNG, JPG, WEBP
          </p>
        </div>
      </div>
    </div>
  );
}
