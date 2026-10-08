/**
 * ============================================================================
 * datos/comunidad.ts — Compañeros y links oficiales
 * ============================================================================
 *
 * QUÉ ES:
 *   Los datos de la pestaña "Conectar": 3 compañeros y 4 links oficiales de las
 *   materias en curso, más la lista de solicitudes de amistad enviadas al abrir
 *   la app.
 *
 * LOS TRES ESTADOS DE AMISTAD QUE SE PUEDEN MOSTRAR:
 *   - Mariana → ya es amiga (`esAmigo: true`)              → botón "Amigos"
 *   - David   → tiene una solicitud enviada (ver más abajo) → botón "Enviada"
 *   - Elena   → sin relación                                → botón "Agregar"
 *
 * QUIÉN LO USA:
 *   Conectar, perfil propio, perfil de otro estudiante y el Context.
 *
 * Compañeros y links oficiales de ejemplo. Son tres personas y cuatro links:
 * alcanzan para mostrar las listas, los filtros y los tres estados de la
 * amistad (amigo, solicitud enviada y sin relación).
 */

// La "forma" de un estudiante.
export type Estudiante = {
  id: string;
  nombre: string;
  cuatrimestre: number;
  /** Códigos de las materias que cursa. */
  materias: string[];
  /** Cantidad de amigos que tiene él, no en común conmigo. */
  amigos: number;
  esAmigo: boolean; // true si ya es mi amigo
};

// Los tres compañeros.
export const estudiantes: Estudiante[] = [
  // Mariana: ya es amiga
  {
    id: "est-1",
    nombre: "Mariana Sosa",
    cuatrimestre: 2,
    materias: ["CS-302", "MAT-201"], // cursa las mismas dos materias que yo
    amigos: 12,
    esAmigo: true,
  },
  // Elena: no es amiga (comparte 2 materias conmigo)
  {
    id: "est-2",
    nombre: "Elena Ruiz",
    cuatrimestre: 2,
    materias: ["CS-302", "MAT-201", "FIS-204"],
    amigos: 8,
    esAmigo: false,
  },
  // David: no es amigo, pero ya le mandé una solicitud (ver el valor de abajo)
  {
    id: "est-3",
    nombre: "David López",
    cuatrimestre: 3,
    materias: ["MAT-201", "FIS-204"],
    amigos: 5,
    esAmigo: false,
  },
];

/** A quiénes ya les mandé una solicitud al abrir la app. */
// La solicitud enviada NO es un campo de `Estudiante` porque puede CAMBIAR
// mientras se usa la app (apretar "Agregar" o retirar la solicitud). Lo que
// cambia vive en el Context (estado/datos.tsx), y este array es solo su
// valor INICIAL.
export const solicitudesEnviadasIniciales = ["est-3"];

// Los tipos de link posibles (determinan el ícono que se muestra).
export type TipoLink = "discord" | "whatsapp" | "campus" | "web" | "repositorio";

// La "forma" de un link oficial.
export type LinkOficial = {
  id: string;
  materiaId: string; // a qué materia pertenece
  titulo: string;
  detalle: string;
  url: string;
  tipo: TipoLink;
};

// Son URLs de ejemplo: abren, pero no llevan a nada real.
export const links: LinkOficial[] = [
  // Dos links de Programación Web (CS-302)
  {
    id: "li-1",
    materiaId: "CS-302",
    tipo: "discord",
    titulo: "Discord de la cátedra",
    detalle: "Consultas y avisos del equipo docente",
    url: "https://discord.gg/urway-cs302",
  },
  {
    id: "li-2",
    materiaId: "CS-302",
    tipo: "campus",
    titulo: "Aula virtual",
    detalle: "Guías de TP, entregas y notas",
    url: "https://campus.uca.edu.ar/course/cs302",
  },
  // Dos links de Álgebra y Geometría (MAT-201)
  {
    id: "li-3",
    materiaId: "MAT-201",
    tipo: "campus",
    titulo: "Aula virtual",
    detalle: "Guías de ejercicios y parciales anteriores",
    url: "https://campus.uca.edu.ar/course/mat201",
  },
  {
    id: "li-4",
    materiaId: "MAT-201",
    tipo: "whatsapp",
    titulo: "Canal de avisos",
    detalle: "Canal oficial de la cátedra, solo docentes publican",
    url: "https://whatsapp.com/channel/urway-mat201",
  },
];
