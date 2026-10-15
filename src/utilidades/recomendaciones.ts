import type { Estudiante } from "@/datos/comunidad";

export type Recomendacion = Estudiante & {
  enComun: string[];
};

export function cruzarMaterias(
  estudiantes: Estudiante[],
  misMaterias: string[]
): Recomendacion[] {
  return estudiantes
    .map((estudiante) => ({
      ...estudiante,
      enComun: estudiante.materias.filter((materia) =>
        misMaterias.includes(materia)
      ),
    }))
    .sort((a, b) => b.enComun.length - a.enComun.length);
}

export function recomendar(
  estudiantes: Estudiante[],
  misMaterias: string[]
): Recomendacion[] {
  return cruzarMaterias(
    estudiantes.filter((estudiante) => !estudiante.esAmigo),
    misMaterias
  );
}
