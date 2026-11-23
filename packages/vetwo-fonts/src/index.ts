export const fontFamilies = {
  header: "VeTwo Header",
  second: "VeTwo Second",
  code: "VeTwo Code",
  serif: "VeTwo Serif",
} as const;

export type FontRole = keyof typeof fontFamilies;
