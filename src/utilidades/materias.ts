import type { EstadoMateria, Materia } from "@/datos/carrera";

const NOMBRES_ANIO = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto"];

export function anioDe(cuatrimestre: number): number {
  return Math.ceil(cuatrimestre / 2);
}

export function cuatrimestreDelAnio(cuatrimestre: number): 1 | 2 {
  return cuatrimestre % 2 === 1 ? 1 : 2;
}

export function nombreDelAnio(anio: number): string {
  return `${NOMBRES_ANIO[anio - 1] ?? `${anio}º`} año`;
}

export function etiquetaPeriodo(materia: Materia): string {
  return `${nombreDelAnio(anioDe(materia.cuatrimestre))} · ${cuatrimestreDelAnio(
    materia.cuatrimestre
  )}º cuatrimestre`;
}

export const NOTA_MINIMA = 4;
export const NOTA_MAXIMA = 10;

export function validarNotaFinal(texto: string): string | null {
  if (texto.trim().length === 0) return "Cargá la nota del final.";
  const nota = Number(texto);
  if (!Number.isInteger(nota) || nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
    return `La nota del final va de ${NOTA_MINIMA} a ${NOTA_MAXIMA}.`;
  }
  return null;
}

export function validarCambioDeEstado(
  actual: EstadoMateria,
  nuevo: EstadoMateria,
  nota?: number
): string | null {
  if (actual === "bloqueada") {
    return "Esta materia está bloqueada: todavía no la podés cursar.";
  }
  if (nuevo === "bloqueada") {
    return "Una materia no puede volver a quedar bloqueada.";
  }
  if (nuevo === actual) return null;

  if (actual === "cursando" && nuevo === "aprobada") {
    return "Una materia en curso no se puede aprobar directo: primero tiene que quedar pendiente de final.";
  }
  if (actual === "aprobada") {
    return "Una materia aprobada ya no cambia de estado: aprobar el final no se deshace. Si la nota tiene un error, corregila con «Corregir nota».";
  }

  if (nuevo === "aprobada") {
    if (nota === undefined) {
      return "Para aprobarla hay que cargar la nota del final.";
    }
    return validarNotaFinal(String(nota));
  }

  return null;
}

export function validarCorreccionDeNota(
  estado: EstadoMateria,
  nota: number
): string | null {
  if (estado !== "aprobada") {
    return "Solo se puede corregir la nota de una materia aprobada.";
  }
  return validarNotaFinal(String(nota));
}

export function promedioDe(materias: Materia[]): number | null {
  const notas = materias
    .filter((materia) => materia.estado === "aprobada")
    .map((materia) => materia.notaFinal)
    .filter((nota): nota is number => nota !== undefined);

  if (notas.length === 0) return null;
  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

const sumarCreditos = (lista: Materia[]) =>
  lista.reduce((total, materia) => total + materia.creditos, 0);

export function resumenCarrera(materias: Materia[]) {
  const aprobadas = materias.filter((materia) => materia.estado === "aprobada");
  const pendientes = materias.filter(
    (materia) => materia.estado === "pendienteFinal"
  );

  return {
    materiasTotales: materias.length,
    materiasAprobadas: aprobadas.length,
    creditosObtenidos: sumarCreditos(aprobadas),
    creditosTotales: sumarCreditos(materias),
    finalesAprobados: aprobadas.length,
    finalesPendientes: pendientes.length,
  };
}

export function codigosEnCurso(materias: Materia[]): string[] {
  return materias
    .filter((materia) => materia.estado === "cursando")
    .map((materia) => materia.id);
}
