import type { TipoEvento } from "@/datos/agenda";
import { colores } from "@/tema/colores";

type EstiloEvento = {
  acento: string;
  fondo: string;
  borde: string;
  icono: "school" | "alert-circle" | "cloud-upload";
};

export const estilosPorTipo: Record<TipoEvento, EstiloEvento> = {
  clase: {
    acento: colores.primario,
    fondo: colores.primarioProfundo,
    borde: colores.primarioOscuro,
    icono: "school",
  },
  parcial: {
    acento: colores.alerta,
    fondo: "#2A1416",
    borde: "#5A2A2E",
    icono: "alert-circle",
  },
  entrega: {
    acento: "#F5A524",
    fondo: "#2A2113",
    borde: "#5A4522",
    icono: "cloud-upload",
  },
};
