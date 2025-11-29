// Approximates RGB to Munsell Notation using CIELAB intermediate
// Note: Exact Munsell conversion requires a large lookup table (Renotation Data).
// This uses a mathematical approximation suitable for general UI purposes.

export const rgbToMunsell = (r: number, g: number, b: number): { notation: string, name: string } => {
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
  const roundedC = Math.max(0, Math.round(C)); 

  // Calculate Hue (H)
  // Hue Angle h_ab = atan2(b*, a*)
  let h_rad = Math.atan2(bVal, a);
  let h_deg = h_rad * (180 / Math.PI);
  if (h_deg < 0) h_deg += 360;

  const hueCode = getMunsellHueCode(h_deg);
  const hueName = getMunsellHueName(hueCode);
  
  // Generate Notation
  let notation = "";
  if (roundedC < 0.5) {
    notation = `N ${roundedV}/`;
  } else {
    notation = `${hueCode} ${roundedV}/${roundedC}`;
  }

  // Generate Analytical Name
  const name = getAnalyticalColorName(roundedV, roundedC, hueName);

  return { notation, name };
};

// Map Lab Hue angle to Munsell Hue Sector Code (5R, 5YR, etc.)
function getMunsellHueCode(h: number): string {
  if (h >= 332 || h < 38) return "5R";
  if (h >= 38 && h < 69) return "5YR";
  if (h >= 69 && h < 105) return "5Y";
  if (h >= 105 && h < 140) return "5GY";
  if (h >= 140 && h < 176) return "5G";
  if (h >= 176 && h < 215) return "5BG";
  if (h >= 215 && h < 255) return "5B";
  if (h >= 255 && h < 295) return "5PB";
  if (h >= 295 && h < 332) return "5P";
  return "5R"; 
}

// Map Code to basic English Hue
function getMunsellHueName(code: string): string {
  const map: Record<string, string> = {
    "5R": "Red",
    "5YR": "Yellow-Red",
    "5Y": "Yellow",
    "5GY": "Green-Yellow",
    "5G": "Green",
    "5BG": "Blue-Green",
    "5B": "Blue",
    "5PB": "Purple-Blue",
    "5P": "Purple",
    "5RP": "Red-Purple" // Note: Our simplified map maps RP into R or P depending on angle, but technically exists
  };
  return map[code] || "Neutral";
}

// Deterministic naming based on Value and Chroma
function getAnalyticalColorName(v: number, c: number, hueName: string): string {
  if (c < 0.5) {
    if (v > 8.5) return "White";
    if (v < 1.5) return "Black";
    return `Neutral Gray (V=${v})`;
  }

  let brightness = "";
  if (v >= 8) brightness = "Pale";
  else if (v >= 6) brightness = "Light";
  else if (v >= 4) brightness = "Medium";
  else if (v >= 2) brightness = "Dark";
  else brightness = "Deep";

  let saturation = "";
  if (c < 2) saturation = "Grayish";
  else if (c < 6) saturation = "Moderate";
  else if (c < 10) saturation = "Strong";
  else saturation = "Vivid";

  // Combine
  // Example: "Vivid Dark Red"
  // Simplify redundant terms
  if (saturation === "Moderate" && brightness === "Medium") return hueName;
  
  return `${saturation} ${brightness} ${hueName}`.trim();
}