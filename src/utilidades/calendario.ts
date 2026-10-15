import type { Evento } from "@/datos/agenda";
import { aMinutos } from "@/utilidades/fechas";

export const HORA_INICIO = 7;
export const HORA_FIN = 24;
export const ALTO_HORA = 56;
export const ALTO_MINIMO_BLOQUE = 24;

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

export function distanciaDesdeArriba(
  minutos: number,
  horaInicio: number
): number {
  return ((minutos - horaInicio * 60) / 60) * ALTO_HORA;
}

export type EventoPosicionado = {
  evento: Evento;
  columna: number;
  columnas: number;
};

export function distribuirSolapados(eventosDelDia: Evento[]): EventoPosicionado[] {
  const ordenados = [...eventosDelDia].sort(
    (a, b) => aMinutos(a.desde) - aMinutos(b.desde)
  );

  const resultado: EventoPosicionado[] = [];

  let grupo: { evento: Evento; columna: number }[] = [];
  let finDeColumnas: number[] = [];
  let finDelGrupo = 0;

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

    if (grupo.length > 0 && inicio >= finDelGrupo) cerrarGrupo();

    let columna = finDeColumnas.findIndex((termina) => termina <= inicio);
    if (columna === -1) columna = finDeColumnas.length;

    finDeColumnas[columna] = fin;
    finDelGrupo = Math.max(finDelGrupo, fin);
    grupo.push({ evento, columna });
  }
  cerrarGrupo();

  return resultado;
}
