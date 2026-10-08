/**
 * ============================================================================
 * datos/novedades.ts — Avisos institucionales de la pantalla Inicio
 * ============================================================================
 *
 * QUÉ ES:
 *   Los dos avisos que aparecen en el bloque "Novedades" de Inicio (por
 *   ejemplo "Inscripción a finales abierta"). Son dos contenedores fijos.
 *
 * QUIÉN LO USA:
 *   app/(tabs)/inicio.tsx, que recorre el array con `map`.
 *
 * Avisos institucionales de ejemplo, escritos a mano.
 *
 * Las "próximas fechas" de Inicio no viven acá: se derivan de los eventos de la
 * agenda (los de tipo parcial y entrega), así crear o eliminar un evento se ve
 * reflejado en las dos pantallas.
 */

// La "forma" de una novedad.
export type Novedad = {
  id: string;
  titulo: string;
  detalle: string;
  // Qué ícono usar: Inicio traduce "megafono" y "calendario" al nombre real del
  // ícono de Ionicons.
  icono: "megafono" | "calendario";
};

export const novedades: Novedad[] = [
  {
    id: "no-1",
    titulo: "Inscripción a finales abierta",
    detalle:
      "El período de inscripción para el turno de diciembre ya está activo.",
    icono: "megafono",
  },
  {
    id: "no-2",
    titulo: "Feriado nacional el viernes",
    detalle: "La universidad permanecerá cerrada el próximo viernes.",
    icono: "calendario",
  },
];
