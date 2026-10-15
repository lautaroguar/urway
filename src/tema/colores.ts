export const colores = {
  fondo: "#000000",
  superficie: "#0E1216",
  superficieAlta: "#14191D",
  superficieSuave: "#1B2126",

  primario: "#2563EB",
  primarioOscuro: "#1E3A8A",
  primarioProfundo: "#172554",
  pizarra: "#1E293B",
  azulClaro: "#A4C9FF",
  azulTenue: "#B4C5FF",
  azulPalido: "#D6E5FF",

  texto: "#EEEFFF",
  textoSuave: "#DFE3E7",
  textoSecundario: "#C3C6D7",
  textoTenue: "#8D90A0",
  textoDebil: "#6B7280",
  blanco: "#FFFFFF",

  borde: "#434655",
  bordeSuave: "#313539",

  alerta: "#FFB4AB",

  velo: "rgba(20, 25, 30, 0.72)",
  bordeVidrio: "rgba(255, 255, 255, 0.12)",

  resaltadoHoy: "rgba(37, 99, 235, 0.10)",
} as const;

export const espaciado = {
  xs: 4,
  sm: 8,
  md: 12,
  lg: 16,
  xl: 24,
  xxl: 32,
} as const;

export const radios = {
  sm: 8,
  md: 12,
  lg: 16,
  xl: 22,
  pastilla: 999,
} as const;

export const barraTabs = {
  alto: 62,
  margenLateral: 16,
  margenInferior: 0,
  margenMinimo: 12,
} as const;

const AREA_SEGURA_INFERIOR = 34;

export const espacioBajoTabs =
  AREA_SEGURA_INFERIOR +
  barraTabs.margenInferior +
  barraTabs.alto +
  espaciado.lg;

export const sombraTarjeta = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 2 },
  shadowOpacity: 0.3,
  shadowRadius: 8,
  elevation: 4,
} as const;

export const sombraFlotante = {
  shadowColor: "#000000",
  shadowOffset: { width: 0, height: 6 },
  shadowOpacity: 0.45,
  shadowRadius: 16,
  elevation: 12,
} as const;
