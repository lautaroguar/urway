/**
 * ============================================================================
 * utilidades/materias.ts — La lógica de las materias (funciones puras)
 * ============================================================================
 *
 * QUÉ ES:
 *   Todo lo que se DECIDE o se CALCULA con las materias, sin dibujar nada:
 *     1. En qué año y cuatrimestre cae una materia.
 *     2. Si se puede cambiar de un estado a otro (y por qué no).
 *     3. El promedio del estudiante, a partir de las notas de los finales.
 *     4. Los totales de la carrera (aprobadas, créditos, finales).
 *     5. Qué materias se están cursando.
 *
 * LAS REGLAS DEL CAMBIO DE ESTADO:
 *     cursando  →  pendienteFinal  →  aprobada
 *   Qué se puede y qué no:
 *     cursando       → pendienteFinal   SÍ.
 *     cursando       → aprobada         NO: primero tiene que quedar pendiente de final.
 *     pendienteFinal → aprobada         SÍ, cargando la NOTA del final (entero de 4 a
 *                                       10). La pantalla avisa, en rojo y dentro del
 *                                       mismo formulario, que no se puede deshacer.
 *     pendienteFinal → cursando         SÍ (por ejemplo, si se quedó sin fechas de final
 *                                       y hay que recursar).
 *     aprobada       → cualquier otro   NO: aprobar el final no se deshace, y volver a
 *                                       "en curso" sería empezar la materia de cero. Si
 *                                       la nota tiene un error de tipeo se corrige con
 *                                       `validarCorreccionDeNota`.
 *   - Una materia bloqueada no cambia de estado.
 *   - Resumen: una vez APROBADA, la materia ya no cambia de estado; lo único que se
 *     puede tocar es la nota.
 *
 * POR QUÉ SON FUNCIONES PURAS Y NO VIVEN EN UNA PANTALLA:
 *   Las usan varias pantallas (Inicio, Plan, Perfil, el detalle de la materia) y
 *   el Context que guarda los cambios. Al ser puras, dan siempre el mismo
 *   resultado para los mismos datos y se pueden probar sueltas.
 *
 * TEORÍA:
 *   [JS 9]  Función pura: mismo input → mismo output; no modifican lo que reciben.
 *   [JS 8]  `filter`, `map` y `reduce` ("reduce: n entradas → 1 resultado").
 *   [JS 25] Estado derivado: el promedio, los totales y las materias en curso se
 *           CALCULAN a partir de la lista; nunca se guardan aparte.
 */
// Solo los TIPOS (los estados posibles y la forma de una materia): no traen código.
import type { EstadoMateria, Materia } from "@/datos/carrera";

// ---------------------------------------------------------------------------
// AÑO Y CUATRIMESTRE
// ---------------------------------------------------------------------------

// Cómo se llama cada año. Con el índice como posición: NOMBRES_ANIO[0] es "Primer".
const NOMBRES_ANIO = ["Primer", "Segundo", "Tercer", "Cuarto", "Quinto"];

/** El año de la carrera al que pertenece un cuatrimestre: 1º y 2º → 1; 3º y 4º → 2. */
// `Math.ceil` redondea hacia arriba: 1 / 2 = 0,5 → 1; 3 / 2 = 1,5 → 2.
export function anioDe(cuatrimestre: number): number {
  return Math.ceil(cuatrimestre / 2);
}

/** Si es el 1º o el 2º cuatrimestre DE SU AÑO: el cuatrimestre 3 es el 1º del segundo año. */
// `%` es el resto de la división: los impares (1, 3, 5...) son el primero del año.
export function cuatrimestreDelAnio(cuatrimestre: number): 1 | 2 {
  return cuatrimestre % 2 === 1 ? 1 : 2;
}

/** "Primer año", "Segundo año"... (y "6º año" si hubiera más de cinco). */
export function nombreDelAnio(anio: number): string {
  // `??` usa el segundo valor si el primero es `undefined` (no hay nombre).
  return `${NOMBRES_ANIO[anio - 1] ?? `${anio}º`} año`;
}

/** "Primer año · 2º cuatrimestre": dónde cae una materia en el plan. */
export function etiquetaPeriodo(materia: Materia): string {
  return `${nombreDelAnio(anioDe(materia.cuatrimestre))} · ${cuatrimestreDelAnio(
    materia.cuatrimestre
  )}º cuatrimestre`;
}

// ---------------------------------------------------------------------------
// CAMBIO DE ESTADO
// ---------------------------------------------------------------------------

/** Las notas de un final van de 4 (aprobado) a 10. */
// (`export const`: otras pantallas las importan, por ejemplo para escribir "4 a 10".)
export const NOTA_MINIMA = 4;
export const NOTA_MAXIMA = 10;

/** Valida la nota que se escribió: un entero de 4 a 10. Devuelve el error o `null`. */
export function validarNotaFinal(texto: string): string | null {
  // `trim()` saca los espacios de los extremos; si no queda nada, no escribió nada.
  if (texto.trim().length === 0) return "Cargá la nota del final.";
  // `Number("abc")` da `NaN`; `Number.isInteger` descarta `NaN` y los decimales.
  const nota = Number(texto);
  // Es inválida si NO es entera, o es menor que 4, o es mayor que 10.
  if (!Number.isInteger(nota) || nota < NOTA_MINIMA || nota > NOTA_MAXIMA) {
    return `La nota del final va de ${NOTA_MINIMA} a ${NOTA_MAXIMA}.`;
  }
  return null;
}

/**
 * ¿Se puede pasar una materia de `actual` a `nuevo`? Devuelve el MOTIVO por el que
 * no se puede (un texto para mostrar) o `null` si se puede. Para aprobarla hay
 * que pasar también la `nota` del final.
 */
export function validarCambioDeEstado(
  actual: EstadoMateria,
  nuevo: EstadoMateria,
  nota?: number
): string | null {
  // El tipo de retorno `string | null` es el protocolo de todas las validaciones:
  // un texto es el MOTIVO por el que no se puede; `null`, que sí se puede.
  // Las reglas se miran en orden y la primera que aplica corta con `return`.
  //
  // Regla 1: una materia bloqueada no cambia de estado.
  if (actual === "bloqueada") {
    return "Esta materia está bloqueada: todavía no la podés cursar.";
  }
  // Regla 2: tampoco se puede volver a bloquear una materia.
  if (nuevo === "bloqueada") {
    return "Una materia no puede volver a quedar bloqueada.";
  }
  // Quedarse en el mismo estado no es un cambio.
  if (nuevo === actual) return null;

  // Los cambios que NO se permiten, cada uno con su mensaje.
  // Regla 3: de "en curso" no se salta directo a "aprobada" (`&&` = "y": las dos
  // condiciones a la vez).
  if (actual === "cursando" && nuevo === "aprobada") {
    return "Una materia en curso no se puede aprobar directo: primero tiene que quedar pendiente de final.";
  }
  // Una materia APROBADA no cambia de estado (ni a pendiente de final ni a en curso:
  // eso sería empezarla de cero). Acá `nuevo` ya es distinto de `actual`.
  if (actual === "aprobada") {
    return "Una materia aprobada ya no cambia de estado: aprobar el final no se deshace. Si la nota tiene un error, corregila con «Corregir nota».";
  }

  // Regla 5: aprobar (solo se llega acá desde "pendiente de final") exige la nota.
  if (nuevo === "aprobada") {
    // `nota?: number` es opcional: si no se pasó, vale `undefined`.
    if (nota === undefined) {
      return "Para aprobarla hay que cargar la nota del final.";
    }
    // `String(8)` pasa el número a texto, que es lo que valida `validarNotaFinal`.
    return validarNotaFinal(String(nota));
  }

  // Todo lo demás es válido: en curso → pendiente de final y pendiente de final →
  // en curso.
  return null;
}

/**
 * ¿Se puede corregir la nota de una materia? Solo si está APROBADA (es para
 * arreglar un error de tipeo) y la nota nueva es válida. Devuelve el motivo o `null`.
 */
export function validarCorreccionDeNota(
  estado: EstadoMateria,
  nota: number
): string | null {
  // Si la materia no está aprobada, no hay nota que corregir.
  if (estado !== "aprobada") {
    return "Solo se puede corregir la nota de una materia aprobada.";
  }
  return validarNotaFinal(String(nota));
}

// ---------------------------------------------------------------------------
// PROMEDIO Y TOTALES
// ---------------------------------------------------------------------------

/**
 * El promedio de las notas de los finales de las materias APROBADAS, o `null` si
 * todavía no hay ninguna.
 */
export function promedioDe(materias: Materia[]): number | null {
  // 1) `filter`: solo las aprobadas.  2) `map`: de cada una, su nota (que puede
  // faltar: `number | undefined`).  3) `filter` con un "type guard" (`nota is
  // number`): le avisa a TypeScript que ya no quedan `undefined`.
  const notas = materias
    .filter((materia) => materia.estado === "aprobada")
    .map((materia) => materia.notaFinal)
    .filter((nota): nota is number => nota !== undefined);

  if (notas.length === 0) return null;
  // `reduce` suma todas las notas (empieza en 0) y se divide por la cantidad.
  return notas.reduce((total, nota) => total + nota, 0) / notas.length;
}

// Suma los créditos de una lista de materias [JS 8] "reduce: n entradas → 1 resultado".
const sumarCreditos = (lista: Materia[]) =>
  lista.reduce((total, materia) => total + materia.creditos, 0);

/** Los totales de la carrera, calculados a partir de las materias actuales. */
export function resumenCarrera(materias: Materia[]) {
  // Dos sublistas con `filter` (cada una es un array NUEVO; `materias` no se toca).
  const aprobadas = materias.filter((materia) => materia.estado === "aprobada");
  const pendientes = materias.filter(
    (materia) => materia.estado === "pendienteFinal"
  );

  // Devuelve un OBJETO con todas las cifras de una vez. Cada pantalla toma las que
  // necesita: `resumen.materiasAprobadas`, `resumen.creditosObtenidos`...
  return {
    materiasTotales: materias.length,
    materiasAprobadas: aprobadas.length,
    creditosObtenidos: sumarCreditos(aprobadas),
    creditosTotales: sumarCreditos(materias),
    // Cada materia aprobada tiene su final aprobado.
    finalesAprobados: aprobadas.length,
    finalesPendientes: pendientes.length,
  };
}

/** Los códigos de las materias que se están cursando, por ejemplo ["MAT-201", "CS-302"]. */
// Sirve para saber qué materias comparto con otros compañeros. Una materia
// pendiente de final YA NO cuenta: la cursada terminó.
export function codigosEnCurso(materias: Materia[]): string[] {
  return materias
    .filter((materia) => materia.estado === "cursando")
    .map((materia) => materia.id);
}
