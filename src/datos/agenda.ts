/**
 * ============================================================================
 * datos/agenda.ts — Tipos de la agenda y los 4 eventos de ejemplo
 * ============================================================================
 *
 * QUÉ ES:
 *   1. La DEFINICIÓN de qué es un evento (sus campos y sus tipos posibles).
 *   2. Los eventos con los que arranca la app.
 *
 * DE DÓNDE SE USA:
 *   - estado/datos.tsx  → toma `eventosIniciales` como valor inicial del estado
 *   - Inicio, Agenda, detalle y formulario de eventos → leen `Evento` y
 *     `etiquetasTipo`
 *
 * TEORÍA:
 *   [JS 11] Módulos: el archivo "exporta" (`export`) lo que otros necesitan y
 *   los demás lo "importan".
 *
 * Eventos de la agenda: los tipos y los eventos de ejemplo con los que arranca
 * la app. Los que se crean o se borran durante la demo viven en
 * `estado/datos.tsx`.
 */
import { claveFecha, sumarDias } from "@/utilidades/fechas";

// Los tres tipos de evento posibles. Es una UNIÓN de textos literales: una
// variable de este tipo solo puede valer exactamente "clase", "parcial" o
// "entrega". Cualquier otro texto da error de TypeScript.
export type TipoEvento = "clase" | "parcial" | "entrega";

// La "forma" de un evento. Un `type` no genera código: solo le dice a
// TypeScript qué propiedades debe tener el objeto.
export type Evento = {
  id: string; // identificador único: "ev-1", "ev-1727640000000"...
  titulo: string;
  /** Código de materia, cuando el evento pertenece a una. */
  // El `?` significa OPCIONAL: puede faltar (no todos los eventos tienen materia).
  materiaId?: string;
  /** Fecha en formato `AAAA-MM-DD`, hora local. */
  fecha: string;
  desde: string; // hora de inicio "HH:MM"
  hasta: string; // hora de fin "HH:MM"
  lugar: string;
  tipo: TipoEvento;
  notas?: string; // opcional
};

// Cómo se escribe cada tipo en pantalla ("clase" → "Clase").
// `Record<TipoEvento, string>` = un objeto con una entrada por cada tipo.
export const etiquetasTipo: Record<TipoEvento, string> = {
  clase: "Clase",
  parcial: "Parcial",
  entrega: "Entrega",
};

/**
 * Fecha `AAAA-MM-DD` de hoy más `dias` días. Los eventos de ejemplo se calculan
 * a partir de hoy para que "Hoy" y "Próximas fechas" nunca queden vacíos el día
 * de la presentación.
 */
// Función privada (sin `export`). Ejemplos: enDias(0) es hoy, enDias(1) es
// mañana, enDias(3) es dentro de tres días. Usa las dos utilidades de fechas:
// `sumarDias` suma los días y `claveFecha` lo pasa a texto "AAAA-MM-DD".
function enDias(dias: number): string {
  return claveFecha(sumarDias(new Date(), dias));
}

// Los eventos iniciales. `: Evento[]` indica "un array de Evento": TypeScript
// verifica que cada objeto tenga todos los campos obligatorios.
export const eventosIniciales: Evento[] = [
  // Evento 1: una clase hoy a la mañana
  {
    id: "ev-1",
    titulo: "Álgebra y Geometría",
    materiaId: "MAT-201",
    fecha: enDias(0), // hoy
    desde: "08:00",
    hasta: "10:00",
    lugar: "Aula 302",
    tipo: "clase",
  },
  // Evento 2: otra clase hoy
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
  // Evento 3: un parcial mañana (aparece en "Próximas fechas" de Inicio)
  {
    id: "ev-3",
    titulo: "Parcial de Álgebra",
    materiaId: "MAT-201",
    fecha: enDias(1), // mañana
    desde: "14:00",
    hasta: "16:00",
    lugar: "Aula 302",
    tipo: "parcial",
    notas: "Matrices, determinantes y sistemas de ecuaciones.",
  },
  // Evento 4: una entrega dentro de 3 días (también en "Próximas fechas")
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
