const ES_EMAIL = /^[^\s@]+@[^\s@]+\.[^\s@]{2,}$/;
const LETRA = "A-Za-zÀ-ÖØ-öø-ÿ";
const ES_NOMBRE = new RegExp(`^[${LETRA}]+(?:[ '’-][${LETRA}]+)*$`);
const ES_DNI = /^[1-9]\d{6,7}$/;
const ES_FECHA = /^(\d{2})\/(\d{2})\/(\d{4})$/;

export function validarEmail(texto: string): string | null {
  const limpio = texto.trim();
  if (limpio.length === 0) return "Ingresá tu correo.";
  if (!ES_EMAIL.test(limpio)) {
    return "El correo no tiene un formato válido, por ejemplo nombre@uca.edu.ar.";
  }
  return null;
}

export function validarContraseniaLogin(texto: string): string | null {
  return texto.length === 0 ? "Ingresá tu contraseña." : null;
}

export function validarContrasenia(texto: string): string | null {
  if (texto.length === 0) return "Elegí una contraseña.";
  if (texto.length < 8) return "Tiene que tener al menos 8 caracteres.";
  if (texto.length > 64) return "Puede tener hasta 64 caracteres.";
  if (!/[A-Za-z]/.test(texto) || !/\d/.test(texto)) {
    return "Tiene que combinar letras y números.";
  }
  return null;
}

export function validarNombre(
  texto: string,
  campo: "nombre" | "apellido"
): string | null {
  const limpio = texto.trim();
  if (limpio.length === 0) return `Completá tu ${campo}.`;
  if (limpio.length < 2 || limpio.length > 40) {
    return `El ${campo} tiene que tener entre 2 y 40 letras.`;
  }
  if (!ES_NOMBRE.test(limpio)) {
    return `El ${campo} solo puede tener letras, espacios, guiones y apóstrofes.`;
  }
  return null;
}

export function validarDni(texto: string): string | null {
  if (texto.length === 0) return "Ingresá tu DNI.";
  if (!ES_DNI.test(texto)) return "El DNI tiene 7 u 8 números, sin puntos.";
  return null;
}

export function validarFechaNacimiento(
  texto: string,
  hoy = new Date()
): string | null {
  if (texto.length === 0) return "Ingresá tu fecha de nacimiento.";
  const partes = ES_FECHA.exec(texto);
  if (!partes) {
    return "Usá el formato DD/MM/AAAA, por ejemplo 25/12/2001.";
  }
  const [, diaTexto, mesTexto, anioTexto] = partes;
  const dia = Number(diaTexto);
  const mes = Number(mesTexto);
  const anio = Number(anioTexto);

  if (anio < 1900) return "Revisá el año de nacimiento.";
  const fecha = new Date(anio, mes - 1, dia);
  const existe =
    fecha.getFullYear() === anio &&
    fecha.getMonth() === mes - 1 &&
    fecha.getDate() === dia;
  if (!existe) return "Esa fecha no existe en el calendario.";
  if (fecha.getTime() > hoy.getTime()) return "La fecha no puede ser futura.";
  return null;
}

export function soloDigitos(texto: string, maximo: number): string {
  return texto.replace(/\D/g, "").slice(0, maximo);
}

export function formatearFecha(texto: string): string {
  const digitos = soloDigitos(texto, 8);
  if (digitos.length <= 2) return digitos;
  if (digitos.length <= 4) return `${digitos.slice(0, 2)}/${digitos.slice(2)}`;
  return `${digitos.slice(0, 2)}/${digitos.slice(2, 4)}/${digitos.slice(4)}`;
}
