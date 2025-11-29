export interface RGB {
  r: number;
  g: number;
  b: number;
}

export interface ColorData {
  rgb: RGB;
  hex: string;
  munsell: string;
}

export interface PaletteColor {
  hex: string;
  name: string;
}

export interface AIAnalysisResult {
  colorName: string;
  description: string;
  emotionalVibe: string;
  palette: PaletteColor[];
}