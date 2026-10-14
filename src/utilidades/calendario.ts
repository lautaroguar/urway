/**
 * ============================================================================
 * utilidades/calendario.ts — La matemática de la vista semanal
 * ============================================================================
 *
 * QUÉ ES:
 *   Funciones PURAS y constantes con las que `SemanaCalendario` decide DÓNDE va
 *   cada evento: a qué distancia del borde de arriba, qué alto tiene y, si dos
 *   eventos se pisan, quién ocupa qué parte del ancho de la columna.
 *
 * LA IDEA CLAVE — UNA HORA = UN ALTO FIJO:
 *   Cada hora del día mide `ALTO_HORA` dp. Entonces la posición de un evento es
 *   una regla de tres: 08:30 está a 1,5 horas de las 07:00 → 1,5 × 56 = 84 dp.
 *   Esos números se calculan en cada render (no se guardan en estado) y se usan
 *   como `top` y `height` de un `View` con `position: "absolute"`.
 *
 * TEORÍA:
 *   [EST]   `position: "absolute"` + `top` / `height`: el hijo se coloca respecto
 *           del padre, no de la pantalla.
 *   [JS 9]  Funciones puras: no modifican lo que reciben (se ordena una COPIA).
 *   [JS 8]  `map`, `filter`, `sort`, `findIndex`.
 *   [JS 25] Todo es estado derivado: nada de esto se guarda.
 */
import type { Evento } from "@/datos/agenda";
import { aMinutos } from "@/utilidades/fechas";

/** Primera hora que se ve, salvo que algún evento sea más temprano. */
export const HORA_INICIO = 7;
/** Última hora que se ve (24 = medianoche), salvo que algún evento termine después. */
export const HORA_FIN = 24;
/** Cuántos dp mide una hora en pantalla. */
export const ALTO_HORA = 56;
/** Alto mínimo de un bloque, para que un evento corto se pueda tocar. */
export const ALTO_MINIMO_BLOQUE = 24;

/**
 * El rango de horas que dibuja la grilla: de 07 a 24 por defecto. Si algún evento
 * (de cualquier semana) cae afuera, el rango se amplía para que entre. Se mira
 * TODA la lista y no solo la semana visible para que la grilla no "salte" al
 * cambiar de semana.
 */
// `Math.min(a, ...lista)` y `Math.max(a, ...lista)`: el SPREAD [JS 7] reparte la
// lista como argumentos sueltos. Con la lista vacía devuelven `a`.
export function rangoHorario(eventos: Evento[]): {
  horaInicio: number;
  horaFin: number;
} {
  const horaInicio = Math.min(
    HORA_INICIO,
    ...eventos.map((evento) => Math.floor(aMinutos(evento.desde) / 60))
  );
  const horaFin = Math.max(
    HORA_FIN,
    ...eventos.map((evento) => Math.ceil(aMinutos(evento.hasta) / 60))
  );
  return { horaInicio, horaFin };
}

/**
 * A cuántos dp del borde de arriba de la grilla queda un minuto del día
 * (510 = 08:30). `horaInicio` es la hora que está arriba de todo.
 */
export function distanciaDesdeArriba(
  minutos: number,
  horaInicio: number
): number {
  return ((minutos - horaInicio * 60) / 60) * ALTO_HORA;
}

/** Un evento con el lugar que ocupa dentro de la columna de su día. */
export type EventoPosicionado = {
  evento: Evento;
  /** Cuál de las columnas del grupo ocupa (0 = la de más a la izquierda). */
  columna: number;
  /** En cuántas columnas se reparte su grupo (1 = no se pisa con nadie). */
  columnas: number;
};

/**
 * Reparte los eventos de UN día para que los que se pisan queden uno al lado del
 * otro en vez de uno encima del otro.
 *
 * CÓMO FUNCIONA:
 *   1. Se ordenan por hora de inicio.
 *   2. Un "grupo" son los eventos que se van pisando en cadena (A pisa a B, B pisa
 *      a C: los tres son un grupo aunque A y C no se toquen).
 *   3. Dentro del grupo, cada evento toma la PRIMERA columna que ya esté libre a
 *      su hora de inicio; si no hay ninguna, abre una nueva.
 *   4. Al cerrar el grupo se sabe cuántas columnas hubo, y todos los del grupo se
 *      reparten el ancho en partes iguales (2 columnas → 50 % cada uno).
 */
export function distribuirSolapados(eventosDelDia: Evento[]): EventoPosicionado[] {
  // `[...x]` copia el array: `sort` modifica el que recibe y no se debe tocar la
  // lista original [JS 9].
  const ordenados = [...eventosDelDia].sort(
    (a, b) => aMinutos(a.desde) - aMinutos(b.desde)
  );

  const resultado: EventoPosicionado[] = [];

  // Lo que se va armando del grupo actual.
  let grupo: { evento: Evento; columna: number }[] = [];
  // En cada posición, el minuto en que termina el último evento de esa columna.
  let finDeColumnas: number[] = [];
  // El minuto en que termina el evento que más tarde acaba del grupo.
  let finDelGrupo = 0;

  // Cierra el grupo: ahora se sabe cuántas columnas tuvo, y se vuelca al resultado.
  const cerrarGrupo = () => {
    const columnas = finDeColumnas.length;
    grupo.forEach(({ evento, columna }) => {
      resultado.push({ evento, columna, columnas });
    });
    grupo = [];
    finDeColumnas = [];
    finDelGrupo = 0;
  };

  for (const evento of ordenados) {
    const inicio = aMinutos(evento.desde);
    const fin = aMinutos(evento.hasta);

    // Si empieza cuando el grupo ya terminó, no se pisan: grupo nuevo.
    if (grupo.length > 0 && inicio >= finDelGrupo) cerrarGrupo();

    // Primera columna libre a esta hora, o una nueva si todas están ocupadas.
    // `findIndex` devuelve -1 cuando no encuentra ninguna.
    let columna = finDeColumnas.findIndex((termina) => termina <= inicio);
    if (columna === -1) columna = finDeColumnas.length;

    finDeColumnas[columna] = fin;
    finDelGrupo = Math.max(finDelGrupo, fin);
    grupo.push({ evento, columna });
  }
  cerrarGrupo(); // el último grupo no lo cierra nadie más

  return resultado;
}
