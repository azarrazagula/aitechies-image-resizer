import React from "react";

export interface PlatformMetadata {
  id: string;
  name: string;
  description: string;
  colorClass: string;
  iconBg: string;
}

export const PLATFORMS_METADATA: Record<string, PlatformMetadata> = {
  Instagram: {
    id: "instagram",
    name: "Instagram",
    description: "Post, Story, Reels, and cover templates.",
    colorClass: "from-purple-600 via-pink-600 to-yellow-500",
    iconBg: "bg-gradient-to-tr from-yellow-500 via-red-500 to-purple-600",
  },
  LinkedIn: {
    id: "linkedin",
    name: "LinkedIn",
    description: "Professional posts and profile banner specs.",
    colorClass: "from-blue-700 to-blue-900",
    iconBg: "bg-[#0A66C2]",
  },
  "Twitter / X": {
    id: "twitter",
    name: "Twitter / X",
    description: "Standard posts and landscape headers.",
    colorClass: "from-neutral-800 to-neutral-950",
    iconBg: "bg-black border border-neutral-800",
  },
  Facebook: {
    id: "facebook",
    name: "Facebook",
    description: "Timeline posts, groups, and cover photos.",
    colorClass: "from-blue-600 to-blue-800",
    iconBg: "bg-[#1877F2]",
  },
  YouTube: {
    id: "youtube",
    name: "YouTube",
    description: "HD video thumbnail dimension template.",
    colorClass: "from-red-600 to-red-700",
    iconBg: "bg-[#FF0000]",
  },
  WhatsApp: {
    id: "whatsapp",
    name: "WhatsApp",
    description: "Square display profile picture template.",
    colorClass: "from-emerald-500 to-emerald-600",
    iconBg: "bg-[#25D366]",
  },
  Custom: {
    id: "custom",
    name: "Custom",
    description: "Specify manual width and height dimensions.",
    colorClass: "from-neutral-700 to-neutral-800",
    iconBg: "bg-gradient-to-r from-indigo-500 to-accent",
  },
};
