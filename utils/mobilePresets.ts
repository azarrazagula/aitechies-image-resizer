import { PlatformPresets } from "./presets";

export const MOBILE_PLATFORMS: PlatformPresets[] = [
  {
    category: "Android",
    presets: [
      { name: "Play Store Icon", w: 512, h: 512 },
      { name: "Launcher Icon (xxxhdpi)", w: 192, h: 192 },
      { name: "Launcher Icon (xxhdpi)", w: 144, h: 144 },
      { name: "Launcher Icon (xhdpi)", w: 96, h: 96 },
      { name: "Feature Graphic", w: 1024, h: 500 },
    ],
  },
  {
    category: "iOS",
    presets: [
      { name: "App Store Icon", w: 1024, h: 1024 },
      { name: "iPhone Icon (@3x)", w: 180, h: 180 },
      { name: "iPhone Icon (@2x)", w: 120, h: 120 },
      { name: "iPad Icon (@2x)", w: 167, h: 167 },
      { name: "Spotlight / Settings", w: 87, h: 87 },
    ],
  },
];
