export interface Preset {
  name: string;
  w: number;
  h: number;
}

export interface PlatformPresets {
  category: string;
  presets: Preset[];
}

export const PLATFORMS: PlatformPresets[] = [
  {
    category: "Instagram",
    presets: [
      { name: "Post (Square)", w: 1080, h: 1080 },
      { name: "Story / Reel Cover", w: 1080, h: 1920 },
      { name: "Landscape Post", w: 1080, h: 566 },
    ],
  },
  {
    category: "LinkedIn",
    presets: [
      { name: "Post", w: 1200, h: 627 },
      { name: "Profile Banner", w: 1584, h: 396 },
    ],
  },
  {
    category: "Twitter / X",
    presets: [
      { name: "Post", w: 1200, h: 675 },
      { name: "Header", w: 1500, h: 500 },
    ],
  },
  {
    category: "Facebook",
    presets: [
      { name: "Cover Photo", w: 820, h: 312 },
      { name: "Post", w: 1200, h: 630 },
    ],
  },
  {
    category: "YouTube",
    presets: [
      { name: "Thumbnail", w: 1280, h: 720 },
    ],
  },
  {
    category: "WhatsApp",
    presets: [
      { name: "Display Picture", w: 500, h: 500 },
    ],
  },
  {
    category: "Custom",
    presets: [
      { name: "User-defined", w: 0, h: 0 },
    ],
  },
];
