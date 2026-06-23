import React from "react";

export default function Footer(): JSX.Element {
  return (
    <footer className="w-full py-8 mt-auto border-t border-neutral-800/60 bg-black/40 backdrop-blur-sm text-neutral-400 relative z-10">
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8">
        <div className="grid grid-cols-1 md:grid-cols-3 gap-8 items-center text-center md:text-left">
          {/* Column 1: Brand Info */}
          <div className="space-y-2">
            <div className="flex items-center justify-center md:justify-start gap-2">
              <span className="text-lg font-bold tracking-tight text-primary-light">
                AI Techies
              </span>
              <span className="text-[10px] font-medium px-2 py-0.5 rounded-full bg-primary/10 text-primary-light border border-primary/20">
                Resizer v1.0.0
              </span>
            </div>
            <p className="text-xs max-w-xs leading-relaxed">
              Resize your images for Instagram, LinkedIn, YouTube, Facebook, and more with pixel-perfect precision. 100% client-side, free and private.
            </p>
          </div>

          {/* Column 2: Navigation Links */}
          <div className="flex flex-wrap justify-center gap-x-6 gap-y-2 text-xs font-semibold">
            <a
              href="#features"
              onClick={(e) => e.preventDefault()}
              className="transition-colors duration-300 hover:text-white"
            >
              Features
            </a>
            <a
              href="#examples"
              onClick={(e) => e.preventDefault()}
              className="transition-colors duration-300 hover:text-white"
            >
              Examples
            </a>
            <a
              href="#privacy"
              onClick={(e) => e.preventDefault()}
              className="transition-colors duration-300 hover:text-white"
            >
              Privacy Policy
            </a>
            <a
              href="#terms"
              onClick={(e) => e.preventDefault()}
              className="transition-colors duration-300 hover:text-white"
            >
              Terms of Use
            </a>
          </div>

          {/* Column 3: Credits & Copyright */}
          <div className="space-y-1.5 md:text-right text-xs">
            <a
              href="https://github.com/azarrazagula"
              target="_blank"
              rel="noopener noreferrer"
              className="font-semibold text-[11px] uppercase tracking-wider text-neutral-300 hover:text-white transition-colors duration-300 block"
            >
              Built by AiTechies · Ansar Ibrahim
            </a>
            <p className="text-[11px] opacity-80">
              &copy; {new Date().getFullYear()} AI Techies. All rights reserved.
            </p>
          </div>
        </div>
      </div>
    </footer>
  );
}
