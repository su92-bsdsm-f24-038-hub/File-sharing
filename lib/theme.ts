export type ThemeVariant = "default" | "warm" | "amber" | "coral" | "pink";

export interface ThemeConfig {
  primary: string;
  glow: string;
}

const variants: Record<ThemeVariant, ThemeConfig> = {
  default: {
    primary: "#FF7A1A",
    glow: "rgba(255, 122, 26, 0.4)",
  },
  warm: {
    primary: "#FF5E00",
    glow: "rgba(255, 94, 0, 0.4)",
  },
  amber: {
    primary: "#FF9A00",
    glow: "rgba(255, 154, 0, 0.4)",
  },
  coral: {
    primary: "#FF6B6B",
    glow: "rgba(255, 107, 107, 0.4)",
  },
  pink: {
    primary: "#FF4D8C",
    glow: "rgba(255, 77, 140, 0.4)",
  }
};

/**
 * Deterministically pick a theme variant based on a string (e.g. roomId).
 */
export function getThemeForRoom(roomId: string): ThemeVariant {
  if (!roomId) return "default";
  
  let hash = 0;
  for (let i = 0; i < roomId.length; i++) {
    hash = roomId.charCodeAt(i) + ((hash << 5) - hash);
  }
  
  const variantKeys = Object.keys(variants) as ThemeVariant[];
  const index = Math.abs(hash) % variantKeys.length;
  
  return variantKeys[index];
}

/**
 * Get the config for a specific variant.
 */
export function getThemeVariantConfig(variant: ThemeVariant): ThemeConfig {
  return variants[variant] || variants.default;
}
