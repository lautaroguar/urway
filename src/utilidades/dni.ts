import {
  validarDni,
  validarFechaNacimiento,
  validarNombre,
} from "@/utilidades/validaciones";

export type DatosDni = {
  nombre?: string;
  apellido?: string;
  dni?: string;
  fechaNacimiento?: string;
};

const ES_TRAMITE = /^\d{11}$/;
const ES_SEXO = /^[MFX]$/;
const ES_EJEMPLAR = /^[A-Z]$/;

function aTitulo(texto: string): string {
  return texto
    .toLowerCase()
    .replace(/(^|[ '’-])(\S)/g, (_coincidencia, separador: string, letra: string) =>
      separador + letra.toUpperCase()
    );
}

export function leerDatosDni(texto: string, hoy = new Date()): DatosDni {
  const campos = texto.split("@").map((campo) => campo.trim());
  const datos: DatosDni = {};

  const esDni = (campo: string) => validarDni(campo) === null;
  const posicionDni = campos.findIndex(esDni);
  const dniEsUnico = posicionDni !== -1 && campos.filter(esDni).length === 1;
  if (dniEsUnico) datos.dni = campos[posicionDni];

  const posicionEjemplar = campos.findIndex(
    (campo, posicion) =>
      ES_EJEMPLAR.test(campo) &&
      posicion + 1 < campos.length &&
      validarFechaNacimiento(campos[posicion + 1], hoy) === null
  );
  if (posicionEjemplar !== -1) {
    datos.fechaNacimiento = campos[posicionEjemplar + 1];
  }

  let posicionNombre = -1;
  if (dniEsUnico && posicionDni >= 3 && ES_SEXO.test(campos[posicionDni - 1])) {
    posicionNombre = posicionDni - 2;
  } else if (ES_TRAMITE.test(campos[0])) {
    posicionNombre = 2;
  }

  if (posicionNombre >= 1 && posicionNombre < campos.length) {
    const apellido = campos[posicionNombre - 1];
    const nombre = campos[posicionNombre];
    if (validarNombre(apellido, "apellido") === null) {
      datos.apellido = aTitulo(apellido);
    }
    if (validarNombre(nombre, "nombre") === null) {
      datos.nombre = aTitulo(nombre);
    }
  }

  return datos;
}
