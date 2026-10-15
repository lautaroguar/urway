import { aMedianoche, diasEntre, sumarDias } from "@/utilidades/fechas";

export const SEMANAS_CUATRIMESTRE = 16;

const MESES_DE_INICIO = [2, 7];

function primerLunes(anio: number, mes: number): Date {
  const primero = new Date(anio, mes, 1);
  const faltan = (8 - primero.getDay()) % 7;
  return new Date(anio, mes, 1 + faltan);
}

export type AvanceCuatrimestre =
  | {
      enCurso: true;
      semana: number;
      semanasTotales: number;
      porcentaje: number;
      semanasRestantes: number;
      fin: Date;
    }
  | {
      enCurso: false;
      porcentaje: 0;
      proximoInicio: Date;
    };

export function avanceCuatrimestre(hoy = new Date()): AvanceCuatrimestre {
  const dia = aMedianoche(hoy);
  const anio = dia.getFullYear();

  const inicios = [anio, anio + 1].flatMap((a) =>
    MESES_DE_INICIO.map((mes) => primerLunes(a, mes))
  );

  const actual = inicios.find((inicio) => {
    const dias = diasEntre(inicio, dia);
    return dias >= 0 && dias < SEMANAS_CUATRIMESTRE * 7;
  });

  if (actual) {
    const semana = Math.floor(diasEntre(actual, dia) / 7) + 1;
    return {
      enCurso: true,
      semana,
      semanasTotales: SEMANAS_CUATRIMESTRE,
      porcentaje: semana / SEMANAS_CUATRIMESTRE,
      semanasRestantes: SEMANAS_CUATRIMESTRE - semana,
      fin: sumarDias(actual, SEMANAS_CUATRIMESTRE * 7 - 3),
    };
  }

  const proximoInicio = inicios.find((inicio) => inicio > dia) ?? inicios[0];
  return { enCurso: false, porcentaje: 0, proximoInicio };
}
