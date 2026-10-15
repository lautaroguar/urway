import { claveFecha, sumarDias } from "@/utilidades/fechas";

export type TipoEvento = "clase" | "parcial" | "entrega";

export type Evento = {
  id: string;
  titulo: string;
  materiaId?: string;
  fecha: string;
  desde: string;
  hasta: string;
  lugar: string;
  tipo: TipoEvento;
  notas?: string;
};

export const etiquetasTipo: Record<TipoEvento, string> = {
  clase: "Clase",
  parcial: "Parcial",
  entrega: "Entrega",
};

function enDias(dias: number): string {
  return claveFecha(sumarDias(new Date(), dias));
}

export const eventosIniciales: Evento[] = [
  {
    id: "ev-1",
    titulo: "Álgebra y Geometría",
    materiaId: "MAT-201",
    fecha: enDias(0),
    desde: "08:00",
    hasta: "10:00",
    lugar: "Aula 302",
    tipo: "clase",
  },
  {
    id: "ev-2",
    titulo: "Programación Web",
    materiaId: "CS-302",
    fecha: enDias(0),
    desde: "11:30",
    hasta: "13:30",
    lugar: "Laboratorio 4",
    tipo: "clase",
  },
  {
    id: "ev-3",
    titulo: "Parcial de Álgebra",
    materiaId: "MAT-201",
    fecha: enDias(1),
    desde: "14:00",
    hasta: "16:00",
    lugar: "Aula 302",
    tipo: "parcial",
    notas: "Matrices, determinantes y sistemas de ecuaciones.",
  },
  {
    id: "ev-4",
    titulo: "Entrega de TP de Programación",
    materiaId: "CS-302",
    fecha: enDias(3),
    desde: "23:00",
    hasta: "23:59",
    lugar: "Campus virtual",
    tipo: "entrega",
    notas: "Subir el repositorio con el README completo.",
  },
];
