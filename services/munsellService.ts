// Approximates RGB to Munsell Notation using CIELAB intermediate
// Note: Exact Munsell conversion requires a large lookup table (Renotation Data).
// This uses a mathematical approximation suitable for general UI purposes.

export const rgbToMunsell = (r: number, g: number, b: number): string => {
  // 1. RGB to XYZ (D65)
  // Normalize RGB to 0-1
  let R = r / 255;
  let G = g / 255;
  let B = b / 255;

  // sRGB inverse gamma correction
  R = (R > 0.04045) ? Math.pow((R + 0.055) / 1.055, 2.4) : R / 12.92;
  G = (G > 0.04045) ? Math.pow((G + 0.055) / 1.055, 2.4) : G / 12.92;
  B = (B > 0.04045) ? Math.pow((B + 0.055) / 1.055, 2.4) : B / 12.92;

  // Scale to reference white (D65)
  R *= 100;
  G *= 100;
  B *= 100;

  // Observer. = 2°, Illuminant = D65
  const X = R * 0.4124 + G * 0.3576 + B * 0.1805;
  const Y = R * 0.2126 + G * 0.7152 + B * 0.0722;
  const Z = R * 0.0193 + G * 0.1192 + B * 0.9505;

  // 2. XYZ to CIELAB
  // Reference White D65
  const ref_X = 95.047;
  const ref_Y = 100.000;
  const ref_Z = 108.883;

  let var_X = X / ref_X;
  let var_Y = Y / ref_Y;
  let var_Z = Z / ref_Z;

  const epsilon = 0.008856;
  const kappa = 903.3;

  var_X = (var_X > epsilon) ? Math.pow(var_X, 1 / 3) : (kappa * var_X + 16) / 116;
  var_Y = (var_Y > epsilon) ? Math.pow(var_Y, 1 / 3) : (kappa * var_Y + 16) / 116;
  var_Z = (var_Z > epsilon) ? Math.pow(var_Z, 1 / 3) : (kappa * var_Z + 16) / 116;

  const L = (116 * var_Y) - 16;
  const a = 500 * (var_X - var_Y);
  const bVal = 200 * (var_Y - var_Z);

  // 3. Lab to Munsell Approximation
  
  // Calculate Value (V)
  // V is roughly L* / 10
  let V = L / 10;
  // Clamp V
  V = Math.max(0, Math.min(10, V));
  const roundedV = Math.round(V * 10) / 10;

  // Calculate Chroma (C)
  // C*ab = sqrt(a*^2 + b*^2)
  // Munsell Chroma is roughly C*ab / 5 to 5.5 depending on hue
  const Cab = Math.sqrt(a * a + bVal * bVal);
  let C = Cab / 5.5; 
  const roundedC = Math.max(0, Math.round(C)); // Chroma is usually an integer or 0.5 steps in charts, we use integer for simplicity

  // Calculate Hue (H)
  // Hue Angle h_ab = atan2(b*, a*)
  let h_rad = Math.atan2(bVal, a);
  let h_deg = h_rad * (180 / Math.PI);
  if (h_deg < 0) h_deg += 360;

  const hueString = getMunsellHue(h_deg);

  // If color is very dark or neutral, return neutral gray notation
  if (roundedC < 0.5) {
    return `N ${roundedV}/`;
  }

  return `${hueString} ${roundedV}/${roundedC}`;
};

// Map Lab Hue angle to Munsell Hue Sector
// Approximate centers of Munsell hues in Lab space (in degrees)
function getMunsellHue(h: number): string {
  // Munsell Hues: 
  // R, YR, Y, GY, G, BG, B, PB, P, RP
  // Each sector is 10 steps (e.g., 2.5R, 5R, 7.5R, 10R)
  // We will map to the 5.0 of each sector for simplicity (5R, 5YR, etc.)
  
  // Angle map (Approximate):
  // 5R: 24
  // 5YR: 52
  // 5Y: 87
  // 5GY: 123
  // 5G: 158
  // 5BG: 195
  // 5B: 235
  // 5PB: 275
  // 5P: 315
  // 5RP: 350
  
  // Define sector boundaries (midpoints between the angles above)
  // R: 350 - 38 (wrap around)
  // YR: 38 - 69
  // Y: 69 - 105
  // GY: 105 - 140
  // G: 140 - 176
  // BG: 176 - 215
  // B: 215 - 255
  // PB: 255 - 295
  // P: 295 - 332
  // RP: 332 - 350+

  if (h >= 332 || h < 38) return "5R";
  if (h >= 38 && h < 69) return "5YR";
  if (h >= 69 && h < 105) return "5Y";
  if (h >= 105 && h < 140) return "5GY";
  if (h >= 140 && h < 176) return "5G";
  if (h >= 176 && h < 215) return "5BG";
  if (h >= 215 && h < 255) return "5B";
  if (h >= 255 && h < 295) return "5PB";
  if (h >= 295 && h < 332) return "5P";
  
  return "5R"; // Fallback
}
