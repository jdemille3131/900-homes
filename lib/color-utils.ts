/**
 * Derive a full color palette from a single hex accent color.
 * Used to generate CSS variables for neighbourhood theming.
 */

function hexToHsl(hex: string): [number, number, number] {
  const r = parseInt(hex.slice(1, 3), 16) / 255;
  const g = parseInt(hex.slice(3, 5), 16) / 255;
  const b = parseInt(hex.slice(5, 7), 16) / 255;

  const max = Math.max(r, g, b);
  const min = Math.min(r, g, b);
  const l = (max + min) / 2;

  if (max === min) return [0, 0, l * 100];

  const d = max - min;
  const s = l > 0.5 ? d / (2 - max - min) : d / (max + min);

  let h = 0;
  if (max === r) h = ((g - b) / d + (g < b ? 6 : 0)) / 6;
  else if (max === g) h = ((b - r) / d + 2) / 6;
  else h = ((r - g) / d + 4) / 6;

  return [h * 360, s * 100, l * 100];
}

function hslToHex(h: number, s: number, l: number): string {
  s /= 100;
  l /= 100;
  const a = s * Math.min(l, 1 - l);
  const f = (n: number) => {
    const k = (n + h / 30) % 12;
    const color = l - a * Math.max(Math.min(k - 3, 9 - k, 1), -1);
    return Math.round(255 * color)
      .toString(16)
      .padStart(2, "0");
  };
  return `#${f(0)}${f(8)}${f(4)}`;
}

export interface ColourPalette {
  accent: string;
  accentHover: string;
  accentLight: string;
  accentBg: string;
  accentText: string;
}

export function deriveColourPalette(accentHex: string): ColourPalette {
  const [h, s, l] = hexToHsl(accentHex);

  return {
    accent: accentHex,
    accentHover: hslToHex(h, s, Math.max(l - 10, 10)),
    accentLight: hslToHex(h, Math.min(s, 40), 97),
    accentBg: hslToHex(h, Math.min(s + 10, 100), 92),
    accentText: hslToHex(h, s, Math.max(l - 15, 10)),
  };
}

export function colourPaletteToCssVars(palette: ColourPalette): Record<string, string> {
  return {
    "--nh-accent": palette.accent,
    "--nh-accent-hover": palette.accentHover,
    "--nh-accent-light": palette.accentLight,
    "--nh-accent-bg": palette.accentBg,
    "--nh-accent-text": palette.accentText,
  };
}
