// ============================================
// COLOR UTILITIES
// ============================================

/**
 * RGB Color Interface
 */
export interface RGB {
  r: number; // 0-255
  g: number; // 0-255
  b: number; // 0-255
}

/**
 * HSV Color Interface
 */
export interface HSV {
  h: number; // 0-360
  s: number; // 0-100
  v: number; // 0-100
}

/**
 * Convert hex color to RGB
 */
export function hexToRgb(hex: string): RGB {
  const result = /^#?([a-f\d]{2})([a-f\d]{2})([a-f\d]{2})$/i.exec(hex);
  return result
    ? {
        r: parseInt(result[1], 16),
        g: parseInt(result[2], 16),
        b: parseInt(result[3], 16),
      }
    : { r: 0, g: 0, b: 0 };
}

/**
 * Convert RGB to hex color
 */
export function rgbToHex(rgb: RGB): string {
  const toHex = (n: number) => {
    const hex = Math.round(n).toString(16);
    return hex.length === 1 ? '0' + hex : hex;
  };
  return `#${toHex(rgb.r)}${toHex(rgb.g)}${toHex(rgb.b)}`;
}

/**
 * Convert RGB to HSV
 */
export function rgbToHsv(rgb: RGB): HSV {
  const r = rgb.r / 255;
  const g = rgb.g / 255;
  const b = rgb.b / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const diff = max - min;

  let h = 0;
  let s = 0;
  const v = max;

  if (diff !== 0) {
    s = diff / max;

    if (max === r) {
      h = ((g - b) / diff + (g < b ? 6 : 0)) / 6;
    } else if (max === g) {
      h = ((b - r) / diff + 2) / 6;
    } else {
      h = ((r - g) / diff + 4) / 6;
    }
  }

  return {
    h: Math.round(h * 360),
    s: Math.round(s * 100),
    v: Math.round(v * 100),
  };
}

/**
 * Convert HSV to RGB
 */
export function hsvToRgb(hsv: HSV): RGB {
  const h = hsv.h / 360;
  const s = hsv.s / 100;
  const v = hsv.v / 100;

  const i = Math.floor(h * 6);
  const f = h * 6 - i;
  const p = v * (1 - s);
  const q = v * (1 - f * s);
  const t = v * (1 - (1 - f) * s);

  let r = 0;
  let g = 0;
  let b = 0;

  switch (i % 6) {
    case 0:
      r = v;
      g = t;
      b = p;
      break;
    case 1:
      r = q;
      g = v;
      b = p;
      break;
    case 2:
      r = p;
      g = v;
      b = t;
      break;
    case 3:
      r = p;
      g = q;
      b = v;
      break;
    case 4:
      r = t;
      g = p;
      b = v;
      break;
    case 5:
      r = v;
      g = p;
      b = q;
      break;
  }

  return {
    r: Math.round(r * 255),
    g: Math.round(g * 255),
    b: Math.round(b * 255),
  };
}

/**
 * Convert hex to HSV
 */
export function hexToHsv(hex: string): HSV {
  return rgbToHsv(hexToRgb(hex));
}

/**
 * Convert HSV to hex
 */
export function hsvToHex(hsv: HSV): string {
  return rgbToHex(hsvToRgb(hsv));
}

/**
 * Calculate relative luminance for WCAG contrast
 */
export function getLuminance(rgb: RGB): number {
  const rsRGB = rgb.r / 255;
  const gsRGB = rgb.g / 255;
  const bsRGB = rgb.b / 255;

  const r = rsRGB <= 0.03928 ? rsRGB / 12.92 : Math.pow((rsRGB + 0.055) / 1.055, 2.4);
  const g = gsRGB <= 0.03928 ? gsRGB / 12.92 : Math.pow((gsRGB + 0.055) / 1.055, 2.4);
  const b = bsRGB <= 0.03928 ? bsRGB / 12.92 : Math.pow((bsRGB + 0.055) / 1.055, 2.4);

  return 0.2126 * r + 0.7152 * g + 0.0722 * b;
}

/**
 * Calculate contrast ratio between two colors
 */
export function getContrastRatio(color1: string, color2: string): number {
  const lum1 = getLuminance(hexToRgb(color1));
  const lum2 = getLuminance(hexToRgb(color2));

  const lighter = Math.max(lum1, lum2);
  const darker = Math.min(lum1, lum2);

  return (lighter + 0.05) / (darker + 0.05);
}

/**
 * Check if contrast meets WCAG AA standard (4.5:1 for normal text)
 */
export function meetsWCAG_AA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 4.5;
}

/**
 * Check if contrast meets WCAG AAA standard (7:1 for normal text)
 */
export function meetsWCAG_AAA(foreground: string, background: string): boolean {
  return getContrastRatio(foreground, background) >= 7;
}

/**
 * Lighten a color by percentage
 */
export function lighten(hex: string, percent: number): string {
  const hsv = hexToHsv(hex);
  hsv.v = Math.min(100, hsv.v + percent);
  return hsvToHex(hsv);
}

/**
 * Darken a color by percentage
 */
export function darken(hex: string, percent: number): string {
  const hsv = hexToHsv(hex);
  hsv.v = Math.max(0, hsv.v - percent);
  return hsvToHex(hsv);
}

/**
 * Saturate a color by percentage
 */
export function saturate(hex: string, percent: number): string {
  const hsv = hexToHsv(hex);
  hsv.s = Math.min(100, hsv.s + percent);
  return hsvToHex(hsv);
}

/**
 * Desaturate a color by percentage
 */
export function desaturate(hex: string, percent: number): string {
  const hsv = hexToHsv(hex);
  hsv.s = Math.max(0, hsv.s - percent);
  return hsvToHex(hsv);
}

/**
 * Generate complementary color (opposite on color wheel)
 */
export function getComplementary(hex: string): string {
  const hsv = hexToHsv(hex);
  hsv.h = (hsv.h + 180) % 360;
  return hsvToHex(hsv);
}

/**
 * Generate analogous colors (adjacent on color wheel)
 */
export function getAnalogous(hex: string): string[] {
  const hsv = hexToHsv(hex);
  return [
    hsvToHex({ ...hsv, h: (hsv.h - 30 + 360) % 360 }),
    hex,
    hsvToHex({ ...hsv, h: (hsv.h + 30) % 360 }),
  ];
}

/**
 * Generate triadic colors (120° apart on color wheel)
 */
export function getTriadic(hex: string): string[] {
  const hsv = hexToHsv(hex);
  return [
    hex,
    hsvToHex({ ...hsv, h: (hsv.h + 120) % 360 }),
    hsvToHex({ ...hsv, h: (hsv.h + 240) % 360 }),
  ];
}

/**
 * Generate tetradic colors (square on color wheel)
 */
export function getTetradic(hex: string): string[] {
  const hsv = hexToHsv(hex);
  return [
    hex,
    hsvToHex({ ...hsv, h: (hsv.h + 90) % 360 }),
    hsvToHex({ ...hsv, h: (hsv.h + 180) % 360 }),
    hsvToHex({ ...hsv, h: (hsv.h + 270) % 360 }),
  ];
}

/**
 * Generate monochromatic palette (same hue, different values)
 */
export function getMonochromatic(hex: string, count: number = 5): string[] {
  const hsv = hexToHsv(hex);
  const palette: string[] = [];

  for (let i = 0; i < count; i++) {
    const v = 100 - (i * 80) / (count - 1);
    palette.push(hsvToHex({ ...hsv, v }));
  }

  return palette;
}

/**
 * Get best text color (black or white) for background
 */
export function getBestTextColor(backgroundColor: string): string {
  const whiteContrast = getContrastRatio('#FFFFFF', backgroundColor);
  const blackContrast = getContrastRatio('#000000', backgroundColor);

  return whiteContrast > blackContrast ? '#FFFFFF' : '#000000';
}

/**
 * Generate accessible color that meets WCAG AA with background
 */
export function makeAccessible(foreground: string, background: string): string {
  let currentColor = foreground;
  let hsv = hexToHsv(currentColor);

  // Try darkening first
  while (!meetsWCAG_AA(currentColor, background) && hsv.v > 0) {
    hsv.v = Math.max(0, hsv.v - 5);
    currentColor = hsvToHex(hsv);
  }

  // If darkening didn't work, try lightening
  if (!meetsWCAG_AA(currentColor, background)) {
    hsv = hexToHsv(foreground);
    while (!meetsWCAG_AA(currentColor, background) && hsv.v < 100) {
      hsv.v = Math.min(100, hsv.v + 5);
      currentColor = hsvToHex(hsv);
    }
  }

  return currentColor;
}
