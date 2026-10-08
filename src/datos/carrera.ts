/**
 * ============================================================================
 * datos/carrera.ts — Plan de estudios: materias, carrera y estudiante
 * ============================================================================
 *
 * QUÉ ES:
 *   Los datos del plan de estudios escritos a mano: 10 materias repartidas en dos
 *   años (cuatro cuatrimestres), con el ESTADO en el que arranca cada una, más
 *   los datos de la carrera y del estudiante.
 *
 * LOS CUATRO ESTADOS DE UNA MATERIA:
 *     bloqueada ──(no se puede cambiar: todavía no se puede cursar)
 *     cursando  → pendienteFinal → aprobada
 *   "Pendiente de final" es cuando la cursada ya está aprobada y falta rendir el
 *   final. Aprobar la materia exige cargar la NOTA del final, y de esas notas
 *   sale el promedio. Una vez aprobada, la materia ya no cambia de estado (solo se
 *   puede corregir la nota). Las reglas del cambio de estado están en
 *   `utilidades/materias.ts`.
 *
 * ESTO SON LOS DATOS INICIALES:
 *   El estado de cada materia CAMBIA mientras se usa la app (se pasa a pendiente
 *   de final, se aprueba con una nota...). Por eso la lista actual vive en el
 *   Context (`estado/datos.tsx`), que arranca copiando `materiasIniciales`. Las
 *   pantallas leen las materias de ahí y NO de acá, salvo para datos que nunca
 *   cambian (el nombre de una materia): para eso está `buscarMateria`.
 *
 * LO QUE YA NO ESTÁ:
 *   El progreso por semana de cada materia ("semana 10 de 16" y su porcentaje).
 *   El avance del cuatrimestre ahora se calcula por fechas (`utilidades/cuatrimestre.ts`).
 *
 * QUIÉN LO USA:
 *   El Context de datos, y para nombres: Conectar, perfil de estudiante y evento.
 *
 * TEORÍA:
 *   [JS 3]  Arrays de objetos como "base de datos" de la demo.
 *   [JS 9]  Los datos iniciales no se modifican nunca: el Context trabaja con
 *           copias nuevas.
 */

// ---------------------------------------------------------------------------
// TIPOS (la "forma" de los datos; no generan código, solo los verifica TypeScript)
// ---------------------------------------------------------------------------

// Los cuatro estados posibles de una materia (ver arriba).
export type EstadoMateria =
  | "bloqueada"
  | "cursando"
  | "pendienteFinal"
  | "aprobada";

// Las tres solapas de "Apuntes y recursos" en el detalle de una materia.
export type CategoriaRecurso = "oficiales" | "comunidad" | "misApuntes";

// Un recurso descargable de una materia (un PDF, un documento...).
export type Recurso = {
  id: string; // único: el código de la materia + un número ("MAT-101-1")
  nombre: string;
  formato: string; // "PDF", "DOCX"...
  peso: string; // "1.1 MB"
  categoria: CategoriaRecurso; // en qué solapa aparece (solo puede ser una de las tres)
};

// Una materia con todos sus datos.
export type Materia = {
  id: string; // código de la materia, por ejemplo "MAT-201"
  nombre: string;
  /**
   * Número de cuatrimestre DE LA CARRERA, de 1 a 10: el 1º y el 2º son del primer
   * año, el 3º y el 4º del segundo, etc. (`anioDe` en `utilidades/materias.ts`).
   */
  cuatrimestre: number;
  creditos: number;
  // En qué estado ESTÁ la materia. Los datos de abajo eligen uno para cada materia;
  // después el Context lo va cambiando.
  estado: EstadoMateria;
  /** Nota del final, de 4 a 10. Solo las materias aprobadas la tienen. */
  // El `?` hace el campo OPCIONAL: puede faltar (las materias que no están
  // aprobadas no tienen nota).
  notaFinal?: number;
  profesor: string;
  /** 0 a 5, promedio de las reseñas de otros estudiantes. */
  dificultad: number;
  resenias: number;
  recursos: Recurso[]; // lista de recursos (puede estar vacía)
};

// ---------------------------------------------------------------------------
// LAS MATERIAS (como arrancan)
// ---------------------------------------------------------------------------

export const materiasIniciales: Materia[] = [
  // ------------------------------ PRIMER AÑO ------------------------------
  // 1º cuatrimestre — aprobada, con nota 9
  {
    id: "MAT-101", // el código: con él se buscan y se abren las materias
    nombre: "Cálculo Elemental",
    cuatrimestre: 1, // número DE LA CARRERA: 1 y 2 son de 1º año, 3 y 4 de 2º
    creditos: 8,
    estado: "aprobada", // arranca aprobada...
    notaFinal: 9, // ...y por eso tiene nota (alimenta el promedio de Inicio)
    profesor: "Dra. Emmy Noether",
    dificultad: 3.5, // de 0 a 5
    resenias: 210, // cuántas reseñas hay (dato de ejemplo)
    recursos: [
      {
        id: "MAT-101-1",
        nombre: "Programa de la Materia",
        formato: "PDF",
        peso: "980 KB",
        categoria: "oficiales",
      },
    ],
  },
  // 1º cuatrimestre — aprobada, con nota 8 (`recursos: []` es un array vacío)
  {
    id: "INF-101",
    nombre: "Informática General",
    cuatrimestre: 1,
    creditos: 6,
    estado: "aprobada",
    notaFinal: 8,
    profesor: "Ing. Grace Hopper",
    dificultad: 2.5,
    resenias: 178,
    recursos: [],
  },
  // 1º cuatrimestre — pendiente de final: sirve para probar cómo se aprueba con nota
  {
    id: "INF-102",
    nombre: "Introducción a la Programación",
    cuatrimestre: 1,
    creditos: 8,
    estado: "pendienteFinal",
    profesor: "Ing. Ada Lovelace",
    dificultad: 3,
    resenias: 156,
    recursos: [
      {
        id: "INF-102-1",
        nombre: "Programa de la Materia",
        formato: "PDF",
        peso: "1.0 MB",
        categoria: "oficiales",
      },
      {
        id: "INF-102-2",
        nombre: "Guía de ejercicios",
        formato: "PDF",
        peso: "2.1 MB",
        categoria: "oficiales",
      },
      {
        id: "INF-102-3",
        nombre: "Resumen para el final",
        formato: "PDF",
        peso: "1.6 MB",
        categoria: "comunidad",
      },
    ],
  },
  // 2º cuatrimestre — en curso: sirve para probar cómo pasa a pendiente de final
  {
    id: "MAT-201",
    nombre: "Álgebra y Geometría",
    cuatrimestre: 2,
    creditos: 8,
    estado: "cursando",
    profesor: "Dra. Emmy Noether",
    dificultad: 4.5,
    resenias: 187,
    recursos: [
      {
        id: "MAT-201-1",
        nombre: "Programa de la Materia",
        formato: "PDF",
        peso: "1.1 MB",
        categoria: "oficiales",
      },
      {
        id: "MAT-201-2",
        nombre: "Resumen de parciales",
        formato: "PDF",
        peso: "2.4 MB",
        categoria: "comunidad",
      },
    ],
  },
  // 2º cuatrimestre — en curso, con recursos oficiales y de la comunidad
  {
    id: "CS-302",
    nombre: "Programación Web",
    cuatrimestre: 2,
    creditos: 8,
    estado: "cursando",
    profesor: "Dr. Alan Turing",
    dificultad: 4,
    resenias: 124,
    recursos: [
      {
        id: "CS-302-1",
        nombre: "Programa de la Materia",
        formato: "PDF",
        peso: "1.2 MB",
        categoria: "oficiales",
      },
      {
        id: "CS-302-2",
        nombre: "Guía de Trabajos Prácticos",
        formato: "DOCX",
        peso: "540 KB",
        categoria: "oficiales",
      },
      {
        id: "CS-302-3",
        nombre: "Apuntes de la comisión 4",
        formato: "PDF",
        peso: "3.8 MB",
        categoria: "comunidad",
      },
    ],
  },
  // 2º cuatrimestre — bloqueada: todavía no se puede cursar
  {
    id: "FIS-204",
    nombre: "Física I",
    cuatrimestre: 2,
    creditos: 8,
    estado: "bloqueada",
    profesor: "Dr. Richard Feynman",
    dificultad: 4.5,
    resenias: 203,
    recursos: [],
  },

  // ----------------------------- SEGUNDO AÑO -----------------------------
  // Todo el segundo año está bloqueado: el estudiante recién va por el primero.
  // 3º cuatrimestre (el primero del 2º año). Sin recursos cargados: `recursos: []`.
  {
    id: "MAT-301",
    nombre: "Análisis Matemático",
    cuatrimestre: 3,
    creditos: 8,
    estado: "bloqueada",
    profesor: "Dr. Carl Gauss",
    dificultad: 4.5,
    resenias: 142,
    recursos: [],
  },
  // 3º cuatrimestre.
  {
    id: "INF-301",
    nombre: "Estructuras de Datos",
    cuatrimestre: 3,
    creditos: 8,
    estado: "bloqueada",
    profesor: "Dr. Edsger Dijkstra",
    dificultad: 4,
    resenias: 119,
    recursos: [],
  },
  // 4º cuatrimestre (el segundo del 2º año).
  {
    id: "INF-302",
    nombre: "Bases de Datos",
    cuatrimestre: 4,
    creditos: 6,
    estado: "bloqueada",
    profesor: "Dr. Edgar Codd",
    dificultad: 3.5,
    resenias: 98,
    recursos: [],
  },
  // 4º cuatrimestre: la última de la lista.
  {
    id: "FIS-304",
    nombre: "Física II",
    cuatrimestre: 4,
    creditos: 8,
    estado: "bloqueada",
    profesor: "Dra. Marie Curie",
    dificultad: 4.5,
    resenias: 131,
    recursos: [],
  },
];

// ---------------------------------------------------------------------------
// LA CARRERA Y EL ESTUDIANTE
// ---------------------------------------------------------------------------

// Los datos de la carrera. Los TOTALES (materias aprobadas, créditos...) no están
// escritos: se calculan con `resumenCarrera` (`utilidades/materias.ts`) a partir
// de las materias ACTUALES, porque cambian al aprobar una.
// (Es un objeto suelto, sin tipo declarado: TypeScript deduce la forma solo.)
export const carrera = {
  nombre: "Ingeniería en Informática",
  universidad: "UCA · Buenos Aires",
};

// Dónde está el estudiante en la carrera. Es un dato de demostración que vale
// para cualquier usuario (el registro no lo pregunta). Su PROMEDIO ya no es un
// dato fijo: se calcula con las notas de los finales (`promedioDe`). QUIÉN es el
// estudiante (nombre, correo...) sale de la sesión: `estado/sesion.tsx`.
export const estudiante = {
  // El cuatrimestre que se cursa ahora: aparece en el saludo de Inicio.
  cuatrimestreActual: 2,
};

// Cómo se escribe cada estado en pantalla ("pendienteFinal" → "Pendiente de final").
// `Record<EstadoMateria, string>` obliga a escribir UNA etiqueta por cada estado:
// si se agrega un estado y falta acá, TypeScript avisa.
export const etiquetasEstado: Record<EstadoMateria, string> = {
  bloqueada: "Bloqueada",
  cursando: "En curso",
  pendienteFinal: "Pendiente de final",
  aprobada: "Aprobada",
};

// Nombre de cada solapa de recursos.
export const etiquetasCategoria: Record<CategoriaRecurso, string> = {
  oficiales: "Oficiales",
  comunidad: "Comunidad",
  misApuntes: "Mis apuntes",
};

/**
 * Busca una materia por su código en los datos INICIALES. Sirve para lo que no
 * cambia (el nombre); el estado actual de una materia está en el Context.
 * Devuelve `undefined` si no existe.
 */
// `find` devuelve el primer elemento que cumple la condición, o `undefined` si
// ninguno. El tipo de retorno `Materia | undefined` obliga a quien la llame a
// contemplar el caso "no existe" (por ejemplo, mostrar "No encontramos la materia").
export function buscarMateria(id: string): Materia | undefined {
  return materiasIniciales.find((materia) => materia.id === id);
}
