import type { EstadoMateria } from "@/datos/carrera";
import { colores } from "@/tema/colores";

type EstiloEstado = {
  fondo: string;
  borde: string;
  acento: string;
  icono: "lock-closed" | "sync" | "hourglass-outline" | "checkmark";
  colorEtiqueta: string;
  fondoEtiqueta: string;
};

export const estilosPorEstado: Record<EstadoMateria, EstiloEstado> = {
  bloqueada: {
    fondo: colores.superficie,
    borde: colores.bordeSuave,
    acento: colores.textoDebil,
    icono: "lock-closed",
    colorEtiqueta: colores.textoDebil,
    fondoEtiqueta: colores.primarioProfundo,
  },
  cursando: {
    fondo: colores.primario,
    borde: colores.azulClaro,
    acento: colores.azulClaro,
    icono: "sync",
    colorEtiqueta: colores.blanco,
    fondoEtiqueta: colores.primario,
  },
  pendienteFinal: {
    fondo: colores.superficieAlta,
    borde: colores.azulClaro,
    acento: colores.azulClaro,
    icono: "hourglass-outline",
    colorEtiqueta: colores.azulClaro,
    fondoEtiqueta: colores.superficieSuave,
  },
  aprobada: {
    fondo: colores.primarioProfundo,
    borde: colores.primarioOscuro,
    acento: colores.azulClaro,
    icono: "checkmark",
    colorEtiqueta: colores.blanco,
    fondoEtiqueta: colores.primarioProfundo,
  },
};
