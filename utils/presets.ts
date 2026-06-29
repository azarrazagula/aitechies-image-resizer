import { MOBILE_PLATFORMS } from "./mobilePresets";

export interface Preset {
  name: string;
  w: number;
  h: number;
  description?: string;
}

export interface PlatformPresets {
  category: string;
  presets: Preset[];
}

export const PLATFORMS: PlatformPresets[] = [
  {
    category: "Instagram",
    presets: [
      { name: "Post (Square)", w: 1080, h: 1080, description: "Standard square feed post" },
      { name: "Story / Reel Cover", w: 1080, h: 1920, description: "Vertical full screen story/reel" },
      { name: "Landscape Post", w: 1080, h: 566, description: "Wide landscape format post" },
    ],
  },
  {
    category: "LinkedIn",
    presets: [
      { name: "Post", w: 1200, h: 627, description: "Standard feed shared post" },
      { name: "Profile Banner", w: 1584, h: 396, description: "Personal profile header background" },
    ],
  },
  {
    category: "Twitter / X",
    presets: [
      { name: "Post", w: 1200, h: 675, description: "Standard image post tweet" },
      { name: "Header", w: 1500, h: 500, description: "Profile header banner background" },
    ],
  },
  {
    category: "Facebook",
    presets: [
      { name: "Cover Photo", w: 820, h: 312, description: "Page or profile cover banner" },
      { name: "Post", w: 1200, h: 630, description: "Timeline shared feed image" },
    ],
  },
  {
    category: "YouTube",
    presets: [
      { name: "Thumbnail", w: 1280, h: 720, description: "Video preview thumbnail" },
    ],
  },
  {
    category: "WhatsApp",
    presets: [
      { name: "Display Picture", w: 500, h: 500, description: "Profile display contact photo" },
    ],
  },
  ...MOBILE_PLATFORMS,
];

