export type Novedad = {
  id: string;
  titulo: string;
  detalle: string;
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
