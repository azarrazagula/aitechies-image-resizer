import { PlatformPresets } from "./presets";

export const MOBILE_PLATFORMS: PlatformPresets[] = [
  {
    category: "Android",
    presets: [
      { name: "Play Store Icon", w: 512, h: 512, description: "Main logo for Google Play Store Listing" },
      { name: "Launcher Icon (xxxhdpi)", w: 192, h: 192, description: "Home screen icon for High-end mobiles" },
      { name: "Launcher Icon (xxhdpi)", w: 144, h: 144, description: "Home screen icon for Standard mobiles" },
      { name: "Launcher Icon (xhdpi)", w: 96, h: 96, description: "Home screen icon for Budget mobiles" },
      { name: "Feature Graphic", w: 1024, h: 500, description: "Promo header banner on Play Store page" },
    ],
  },
  {
    category: "iOS",
    presets: [
      { name: "App Store Icon", w: 1024, h: 1024, description: "Main logo for App Store submission" },
      { name: "iPhone Icon (@3x)", w: 180, h: 180, description: "Home screen icon for New model iPhones" },
      { name: "iPhone Icon (@2x)", w: 120, h: 120, description: "Home screen icon for Classic model iPhones" },
      { name: "iPad Icon (@2x)", w: 167, h: 167, description: "Home screen icon for iPad tablets" },
      { name: "Spotlight / Settings", w: 87, h: 87, description: "Settings menu and Spotlight search icon" },
    ],
  },
];
