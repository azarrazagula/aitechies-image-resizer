import React from "react";

export default function Header(): JSX.Element {
  return (
    <header className="w-full border-b border-neutral-800/60 bg-black/40 backdrop-blur-sm z-50 sticky top-0">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 h-16 flex items-center justify-between gap-2">
        {/* Brand Logo */}
        <div className="flex items-center gap-1.5 sm:gap-2 flex-shrink-0">
          {/* SVG Scissors/Crop Logo */}
          <div className="w-6 h-6 sm:w-8 sm:h-8 rounded-lg bg-primary flex items-center justify-center text-white font-bold text-sm sm:text-lg shadow-md shadow-primary/20">
            <svg
              className="w-4 h-4 sm:w-5 sm:h-5 text-white"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M4 16v1a3 3 0 003 3h10a3 3 0 003-3v-1m-4-4l-4 4m0 0l-4-4m4 4V4"
              />
            </svg>
          </div>
          <span className="text-xs sm:text-xl font-bold tracking-tight text-white">
            AI <span className="text-primary-light">Techies</span>
          </span>
        </div>


        {/* Extra Action Button - Redirects to BG Remover */}
        <div className="flex items-center gap-1.5 sm:gap-4 flex-shrink-0">
          <a
            href="https://aitechiesbgremove.netlify.app/"
            target="_blank"
            rel="noopener noreferrer"
            className="group inline-flex items-center gap-1 px-2 py-1.5 sm:px-4 sm:py-2 rounded-xl bg-accent/5 hover:bg-accent border border-accent/30 hover:border-accent text-accent hover:text-[#0D0D0D] text-[10px] sm:text-xs font-bold transition-all duration-300 shadow-md shadow-accent/5 hover:shadow-accent/25 hover:scale-105 active:scale-95"
          >
            BG Remove
            <svg
              className="w-3 h-3 sm:w-3.5 sm:h-3.5 text-accent group-hover:text-[#0D0D0D] transition-transform duration-300 group-hover:translate-x-0.5 group-hover:-translate-y-0.5"
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
              xmlns="http://www.w3.org/2000/svg"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2.5}
                d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
              />
            </svg>
          </a>
          <span className="inline-flex items-center gap-1 px-2 py-1 sm:px-3 sm:py-1.5 rounded-full bg-neutral-900 border border-neutral-800 text-[9px] sm:text-xs font-semibold text-accent-light">
            <span className="w-1 h-1 sm:w-1.5 sm:h-1.5 rounded-full bg-accent animate-pulse" />
            100% Client-Side
          </span>
        </div>
      </div>
    </header>
  );
}
