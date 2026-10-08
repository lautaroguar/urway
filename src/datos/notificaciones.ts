/**
 * ============================================================================
 * datos/notificaciones.ts — Historial de notificaciones (solo visual)
 * ============================================================================
 *
 * QUÉ ES:
 *   4 avisos escritos a mano que muestra la pantalla "Notificaciones". No se
 *   generan solos ni se pueden marcar como leídos: no hay servidor que los
 *   produzca, así que son solo un ejemplo de cómo se vería el historial.
 *
 * QUIÉN LO USA:
 *   app/notificaciones.tsx
 *
 * Historial de notificaciones de ejemplo. Es solo para mostrar: no se
 * generan solas ni se pueden marcar como leídas.
 */
// `import type`: solo se importa el tipo de evento (clase | parcial | entrega).
import type { TipoEvento } from "@/datos/agenda";

// La "forma" de una notificación.
export type Notificacion = {
  id: string;
  // Dos clases de aviso: de calendario (parciales, entregas...) o de amistad.
  tipo: "calendario" | "amistad";
  /** Solo en las de calendario: decide el color y el ícono. */
  tipoEvento?: TipoEvento; // opcional: las de amistad no lo tienen
  titulo: string;
  detalle: string;
  /** Cuándo llegó, ya escrito como se muestra. */
  cuando: string; // texto fijo ("Hoy · 09:00"); al ser visual no se calcula
  leida: boolean; // false = aparece en "Nuevas"; true = en "Anteriores"
};

export const notificaciones: Notificacion[] = [
  // Nueva: aviso de un parcial que se acerca (mañana)
  {
    id: "no-1",
    tipo: "calendario",
    tipoEvento: "parcial",
    titulo: "Se acerca un parcial: Parcial de Álgebra",
    detalle: "Mañana · 14:00 a 16:00 · Aula 302",
    cuando: "Hoy · 09:00",
    leida: false,
  },
  // Nueva: recordatorio de una clase de hoy
  {
    id: "no-2",
    tipo: "calendario",
    tipoEvento: "clase",
    titulo: "Clase de hoy: Programación Web",
    detalle: "Hoy · 11:30 a 13:30 · Laboratorio 4",
    cuando: "Hace 2 h",
    leida: false,
  },
  // Anterior: una amistad aceptada (usa el ícono de personas)
  {
    id: "no-3",
    tipo: "amistad",
    titulo: "Ahora sos amigo de Mariana Sosa",
    detalle: "Aceptó tu solicitud de amistad",
    cuando: "Hace 2 días",
    leida: true,
  },
  // Anterior: se abrió una entrega
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
