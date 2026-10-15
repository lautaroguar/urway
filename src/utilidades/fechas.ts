const NOMBRES_MES = [
  "enero",
  "febrero",
  "marzo",
  "abril",
  "mayo",
  "junio",
  "julio",
  "agosto",
  "septiembre",
  "octubre",
  "noviembre",
  "diciembre",
];

const NOMBRES_DIA = [
  "domingo",
  "lunes",
  "martes",
  "miércoles",
  "jueves",
  "viernes",
  "sábado",
];

function conCeros(numero: number): string {
  return numero.toString().padStart(2, "0");
}

export function claveFecha(fecha: Date): string {
  return `${fecha.getFullYear()}-${conCeros(fecha.getMonth() + 1)}-${conCeros(
    fecha.getDate()
  )}`;
}

export function desdeClave(clave: string): Date {
  const [anio, mes, dia] = clave.split("-").map(Number);
  return new Date(anio, mes - 1, dia);
}

export function aMedianoche(fecha: Date): Date {
  return new Date(fecha.getFullYear(), fecha.getMonth(), fecha.getDate());
}

export function diasEntre(desde: Date, hasta: Date): number {
  return Math.round(
    (aMedianoche(hasta).getTime() - aMedianoche(desde).getTime()) / 86400000
  );
}

export function sumarDias(fecha: Date, dias: number): Date {
  const copia = new Date(fecha);
  copia.setDate(copia.getDate() + dias);
  return copia;
}

export function etiquetaDiaLargo(fecha: Date): string {
  return `${NOMBRES_DIA[fecha.getDay()]} ${fecha.getDate()} de ${
    NOMBRES_MES[fecha.getMonth()]
  }`;
}

export function etiquetaRelativa(fecha: Date, referencia = new Date()): string {
  const dias = Math.round(
    (aMedianoche(fecha).getTime() - aMedianoche(referencia).getTime()) /
      86400000
  );

  if (dias === 0) return "Hoy";
  if (dias === 1) return "Mañana";
  if (dias === -1) return "Ayer";

  const texto = etiquetaDiaLargo(fecha);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function inicioDeSemana(fecha: Date): Date {
  const desdeElLunes = (fecha.getDay() + 6) % 7;
  return sumarDias(aMedianoche(fecha), -desdeElLunes);
}

export function etiquetaDiaCorto(fecha: Date): string {
  const texto = NOMBRES_DIA[fecha.getDay()].slice(0, 3);
  return texto.charAt(0).toUpperCase() + texto.slice(1);
}

export function etiquetaSemana(inicio: Date): string {
  const fin = sumarDias(inicio, 6);
  const mesFin = NOMBRES_MES[fin.getMonth()].slice(0, 3);

  if (inicio.getMonth() === fin.getMonth()) {
    return `${inicio.getDate()} – ${fin.getDate()} ${mesFin}`;
  }
  const mesInicio = NOMBRES_MES[inicio.getMonth()].slice(0, 3);
  return `${inicio.getDate()} ${mesInicio} – ${fin.getDate()} ${mesFin}`;
}

export function etiquetaHora(hora: number): string {
  return `${conCeros(hora)}:00`;
}

export function aMinutos(hora: string): number {
  const [horas, minutos] = hora.split(":").map(Number);
  if (Number.isNaN(horas) || Number.isNaN(minutos)) return 0;
  return horas * 60 + minutos;
}

export function duracion(desde: string, hasta: string): string {
  const total = Math.max(aMinutos(hasta) - aMinutos(desde), 0);
  const horas = Math.floor(total / 60);
  const minutos = total % 60;

  if (horas === 0) return `${minutos} min`;
  if (minutos === 0) return `${horas} h`;
  return `${horas} h ${minutos} min`;
}
