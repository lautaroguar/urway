export type EstadoMateria =
  | "bloqueada"
  | "cursando"
  | "pendienteFinal"
  | "aprobada";

export type CategoriaRecurso = "oficiales" | "comunidad" | "misApuntes";

export type Recurso = {
  id: string;
  nombre: string;
  formato: string;
  peso: string;
  categoria: CategoriaRecurso;
};

export type Materia = {
  id: string;
  nombre: string;
  cuatrimestre: number;
  creditos: number;
  estado: EstadoMateria;
  notaFinal?: number;
  profesor: string;
  dificultad: number;
  resenias: number;
  recursos: Recurso[];
};

export const materiasIniciales: Materia[] = [
  {
    id: "MAT-101",
    nombre: "Cálculo Elemental",
    cuatrimestre: 1,
    creditos: 8,
    estado: "aprobada",
    notaFinal: 9,
    profesor: "Dra. Emmy Noether",
    dificultad: 3.5,
    resenias: 210,
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

export const carrera = {
  nombre: "Ingeniería en Informática",
  universidad: "UCA · Buenos Aires",
};

export const estudiante = {
  cuatrimestreActual: 2,
};

export const etiquetasEstado: Record<EstadoMateria, string> = {
  bloqueada: "Bloqueada",
  cursando: "En curso",
  pendienteFinal: "Pendiente de final",
  aprobada: "Aprobada",
};

export const etiquetasCategoria: Record<CategoriaRecurso, string> = {
  oficiales: "Oficiales",
  comunidad: "Comunidad",
  misApuntes: "Mis apuntes",
};

export function buscarMateria(id: string): Materia | undefined {
  return materiasIniciales.find((materia) => materia.id === id);
}
