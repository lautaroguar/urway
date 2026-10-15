export type Estudiante = {
  id: string;
  nombre: string;
  cuatrimestre: number;
  materias: string[];
  amigos: number;
  esAmigo: boolean;
};

export const estudiantes: Estudiante[] = [
  {
    id: "est-1",
    nombre: "Mariana Sosa",
    cuatrimestre: 2,
    materias: ["CS-302", "MAT-201"],
    amigos: 12,
    esAmigo: true,
  },
  {
    id: "est-2",
    nombre: "Elena Ruiz",
    cuatrimestre: 2,
    materias: ["CS-302", "MAT-201", "FIS-204"],
    amigos: 8,
    esAmigo: false,
  },
  {
    id: "est-3",
    nombre: "David López",
    cuatrimestre: 3,
    materias: ["MAT-201", "FIS-204"],
    amigos: 5,
    esAmigo: false,
  },
];

export const solicitudesEnviadasIniciales = ["est-3"];

export type TipoLink = "discord" | "whatsapp" | "campus" | "web" | "repositorio";

export type LinkOficial = {
  id: string;
  materiaId: string;
  titulo: string;
  detalle: string;
  url: string;
  tipo: TipoLink;
};

export const links: LinkOficial[] = [
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
