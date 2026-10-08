/**
 * ============================================================================
 * datos/usuarios.ts — Quién es el usuario: el tipo y la cuenta de demostración
 * ============================================================================
 *
 * QUÉ ES:
 *   La forma de un USUARIO de la app (`Usuario`) y la cuenta de demostración
 *   (`usuarioDemo`), escrita a mano como el resto de `datos/`.
 *
 * DE DÓNDE SALE CADA USUARIO:
 *   - Una cuenta CREADA en el registro (`app/registro.tsx`): se guarda en el
 *     teléfono (AsyncStorage) y vuelve cuando esa persona inicia sesión.
 *   - La cuenta de DEMOSTRACIÓN: es la que entra cuando se inicia sesión con un
 *     correo que no pertenece a ninguna cuenta creada. Sirve para mostrar la app
 *     completa sin registrarse.
 *   Ver `estado/sesion.tsx`.
 *
 * QUÉ NO ESTÁ ACÁ:
 *   La contraseña. Es un dato sensible y no forma parte del usuario que se
 *   muestra: se guarda aparte y cifrada (`utilidades/claves.ts`).
 *
 * TEORÍA:
 *   [JS 3] Objetos y tipos de TypeScript para describir los datos.
 */

/** Un usuario de la app. `facultad` y `carrera` son CLAVES de `datos/registro.ts`. */
export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  /** Clave de la opción elegida en "¿A qué facultad vas?" (por ejemplo "uca"). */
  facultad: string;
  /** Clave de la opción elegida en "¿Qué carrera cursás?" (por ejemplo "informatica"). */
  carrera: string;
  /** Solo las cuentas creadas en el registro los tienen. */
  dni?: string;
  /** `DD/MM/AAAA`. */
  fechaNacimiento?: string;
};

/**
 * La cuenta de demostración. Se llama "Franco" desde el principio de la demo, y
 * por eso el resto de los datos de ejemplo (materias, amigos...) son los suyos.
 */
export const usuarioDemo: Usuario = {
  id: "demo",
  nombre: "Franco",
  apellido: "Díaz",
  email: "franco.diaz@uca.edu.ar",
  facultad: "uca",
  carrera: "informatica",
};
