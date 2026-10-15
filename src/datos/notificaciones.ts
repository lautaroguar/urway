import type { TipoEvento } from "@/datos/agenda";

export type Notificacion = {
  id: string;
  tipo: "calendario" | "amistad";
  tipoEvento?: TipoEvento;
  titulo: string;
  detalle: string;
  cuando: string;
  leida: boolean;
};

export const notificaciones: Notificacion[] = [
  {
    id: "no-1",
    tipo: "calendario",
    tipoEvento: "parcial",
    titulo: "Se acerca un parcial: Parcial de Álgebra",
    detalle: "Mañana · 14:00 a 16:00 · Aula 302",
    cuando: "Hoy · 09:00",
    leida: false,
  },
  {
    id: "no-2",
    tipo: "calendario",
    tipoEvento: "clase",
    titulo: "Clase de hoy: Programación Web",
    detalle: "Hoy · 11:30 a 13:30 · Laboratorio 4",
    cuando: "Hace 2 h",
    leida: false,
  },
  {
    id: "no-3",
    tipo: "amistad",
    titulo: "Ahora sos amigo de Mariana Sosa",
    detalle: "Aceptó tu solicitud de amistad",
    cuando: "Hace 2 días",
    leida: true,
  },
  {
    id: "no-4",
    tipo: "calendario",
    tipoEvento: "entrega",
    titulo: "Se abrió una entrega: TP de Programación",
    detalle: "Campus virtual · Vence en 3 días a las 23:59",
    cuando: "Hace 3 días",
    leida: true,
  },
];
