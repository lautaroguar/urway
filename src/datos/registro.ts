export type OpcionPregunta = {
  clave: string;
  etiqueta: string;
};

export const facultades: OpcionPregunta[] = [{ clave: "uca", etiqueta: "UCA" }];

export const carreras: OpcionPregunta[] = [
  { clave: "informatica", etiqueta: "Ingeniería Informática" },
];

export function etiquetaDe(opciones: OpcionPregunta[], clave: string): string {
  return opciones.find((opcion) => opcion.clave === clave)?.etiqueta ?? clave;
}
