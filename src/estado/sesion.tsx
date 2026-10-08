/**
 * ============================================================================
 * estado/sesion.tsx — El Context de la SESIÓN: quién está adentro y las cuentas
 * ============================================================================
 *
 * QUÉ ES:
 *   El "almacén" de lo que tiene que sobrevivir a cerrar la app:
 *     1. las CUENTAS creadas en el registro (perfil de cada una);
 *     2. la SESIÓN: quién inició sesión (para no volver a pedirle el ingreso).
 *   Ambas cosas se guardan en el teléfono con AsyncStorage. La contraseña de cada
 *   cuenta NO va ahí: va cifrada aparte (ver `utilidades/claves.ts`).
 *
 * CÓMO SE AUTENTICA (es una demo, no hay servidor):
 *   - Si el correo pertenece a una cuenta creada, la contraseña tiene que
 *     coincidir con la guardada. Si no coincide, no entra.
 *   - Si el correo NO pertenece a ninguna cuenta creada, entra con la cuenta de
 *     DEMOSTRACIÓN (`datos/usuarios.ts`), con los datos de ejemplo de siempre.
 *   Así se puede mostrar la app completa sin registrarse, y también que el
 *   registro y la autenticación funcionan.
 *
 * POR QUÉ ES UN CONTEXT APARTE DE `estado/datos.tsx`:
 *   La teoría dice "no hagas un Context gigante: separá los estados que cambian a
 *   ritmos distintos". La sesión casi no cambia (entrar, salir); los eventos y
 *   los apuntes sí.
 *
 * EL PATRÓN DE ASYNCSTORAGE (de la teoría, en cuatro pasos):
 *   1. Al montar el Provider se LEE lo guardado (`getItem` + `JSON.parse`).
 *   2. Recién cuando terminó de leer, `listo` pasa a `true`.
 *   3. Cada vez que cambia el estado se GUARDA (`setItem` + `JSON.stringify`),
 *      pero solo si `listo` es `true`: si no, el primer render, con los valores
 *      vacíos, pisaría lo que había guardado.
 *   4. Mientras `listo` es `false` no se dibuja nada (`return null`), para evitar
 *      el parpadeo de la pantalla "sin sesión".
 *
 * DÓNDE SE MONTA:
 *   En `app/_layout.tsx`, envolviendo todo. Como no dibuja hasta leer el disco, la
 *   bienvenida ya sabe si hay sesión (`app/index.tsx`).
 *
 * TEORÍA:
 *   [ALM]   AsyncStorage: `setItem`, `getItem` y `removeItem`; guarda texto (JSON);
 *           el patrón con `isHydrated`/`listo`. (ALM = "Almacenamiento Local".)
 *   [CTX]   Context: `createContext<T | undefined>(undefined)`, Provider con el
 *           `value` memoizado con `useMemo` y un hook propio con `throw`.
 *           (CTX = "React Native - Context".)
 *   [JS 26] `useEffect` para sincronizar con un sistema externo (el disco).
 *   [JS 20] `useState` con actualización funcional.
 *   [JS 9]  Inmutabilidad: las cuentas se agregan con un array NUEVO.
 *   [JS 7]  Spread y "rest" (`...perfil`) para separar la contraseña del perfil.
 *   [JS 14] `async/await` en el registro y el inicio de sesión.
 */
// AsyncStorage: el almacenamiento local de la teoría (pares clave → texto).
import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext, // crea el "canal" del Context
  useContext, // lee el canal desde una pantalla
  useEffect, // sincroniza con un sistema externo (el disco)
  useMemo, // memoriza el `value` para no avisar de más
  useState, // guarda cuentas, sesión y el aviso `listo`
  type ReactNode, // el tipo de `children` (lo que se dibuja adentro)
} from "react";

// `usuarioDemo`: la cuenta de demostración. `Usuario`: la forma de una cuenta (solo tipo).
import { usuarioDemo, type Usuario } from "@/datos/usuarios";
// La contraseña se guarda cifrada aparte (SecureStore), no en AsyncStorage.
import { guardarClave, leerClave } from "@/utilidades/claves";

// Las claves bajo las que se guarda todo en AsyncStorage (pares clave → texto).
const CLAVE_CUENTAS = "urway-cuentas";
const CLAVE_SESION = "urway-sesion";

// Quién está adentro: la cuenta de demostración o una cuenta creada (por su id).
// Es una "unión": el campo `tipo` dice cuál de las dos formas es.
// Se lee: "o es { tipo: 'demo' }, o es { tipo: 'cuenta', id: '...' }". Al mirar
// `sesion.tipo`, TypeScript sabe en cada rama si existe o no el campo `id`.
type Sesion = { tipo: "demo" } | { tipo: "cuenta"; id: string };

/** Los datos que pide el registro para crear una cuenta (incluye la contraseña). */
export type DatosRegistro = {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  email: string;
  contrasenia: string;
  facultad: string;
  carrera: string;
};

/** Cómo terminó el intento de iniciar sesión. */
export type ResultadoIngreso = "ok" | "contraseniaIncorrecta";

// PASO 1 — El contrato: qué viaja por el canal [CTX]. Incluye lo que se LEE y
// también las funciones para cambiarlo.
type ValorSesion = {
  /** Quien tiene la sesión iniciada, o `null` si no hay sesión. */
  usuario: Usuario | null;
  /** `true` si la sesión es la de la cuenta de demostración. */
  esDemo: boolean;
  /** ¿Ya hay una cuenta creada con este correo? */
  existeCorreo: (email: string) => boolean;
  /** Crea la cuenta: guarda el perfil y la contraseña. No inicia sesión. */
  // `Promise<void>`: una función `async` que no devuelve ningún valor al terminar.
  registrar: (datos: DatosRegistro) => Promise<void>;
  /** Inicia sesión (ver arriba cómo se decide con qué cuenta). */
  iniciarSesion: (email: string, contrasenia: string) => Promise<ResultadoIngreso>;
  /** Cierra la sesión: la próxima vez que se abra la app pide el ingreso. */
  cerrarSesion: () => void;
};

// PASO 2 — El canal. Se tipa como "puede no existir" (`| undefined`) para que
// usarlo fuera del Provider sea un error claro [CTX].
const ContextoSesion = createContext<ValorSesion | undefined>(undefined);

// Los correos se comparan sin mayúsculas ni espacios: "Ana@UCA.edu.ar " es el
// mismo que "ana@uca.edu.ar".
const normalizar = (email: string) => email.trim().toLowerCase();

/**
 * Guarda y ofrece la sesión y las cuentas. Va en la raíz de la app para que
 * cualquier pantalla pueda leerlas con `useSesion()`.
 */
export function ProveedorSesion({ children }: { children: ReactNode }) {
  // PASO 3 — El estado real vive acá, en `useState` comunes [CTX].
  const [cuentas, setCuentas] = useState<Usuario[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  // ¿Ya se terminó de leer lo guardado? (`isHydrated` en la teoría.)
  const [listo, setListo] = useState(false);

  // [ALM 1] AL MONTAR: se lee lo guardado. Las dos lecturas se piden juntas con
  // `Promise.all` y vuelven en el mismo orden. `getItem` devuelve el texto
  // guardado o `null` si no había nada.
  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CLAVE_CUENTAS),
      AsyncStorage.getItem(CLAVE_SESION),
    ])
      .then(([cuentasGuardadas, sesionGuardada]) => {
        // `JSON.parse` convierte el texto de vuelta en objetos.
        if (cuentasGuardadas) setCuentas(JSON.parse(cuentasGuardadas));
        if (sesionGuardada) setSesion(JSON.parse(sesionGuardada));
      })
      // Si falla la lectura (o el texto guardado está roto) se arranca de cero.
      // `() => {}` es una función que no hace nada: se descarta el error a propósito.
      .catch(() => {})
      // [ALM 2] Pase lo que pase, ya se puede confiar en el estado.
      .finally(() => setListo(true));
  }, []);

  // [ALM 3] CADA CAMBIO se guarda, pero solo si `listo`. `JSON.stringify` pasa el
  // objeto a texto, que es lo único que acepta `setItem`. El `[cuentas, listo]`
  // del final dice cuándo se vuelve a ejecutar: cuando cambia alguno de los dos.
  useEffect(() => {
    if (!listo) return;
    AsyncStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas)).catch(() => {});
  }, [cuentas, listo]);

  useEffect(() => {
    if (!listo) return;
    if (sesion) {
      AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion)).catch(() => {});
    } else {
      // Sin sesión se BORRA la clave (así la próxima apertura pide el ingreso).
      AsyncStorage.removeItem(CLAVE_SESION).catch(() => {});
    }
  }, [sesion, listo]);

  // VALORES DERIVADOS [JS 25]: el usuario se calcula a partir de la sesión y de
  // las cuentas; no se guarda aparte. Si la sesión apunta a una cuenta que ya no
  // existe, el resultado es `null` (como no tener sesión).
  const usuario =
    sesion === null
      ? null
      : sesion.tipo === "demo"
        ? usuarioDemo
        : (cuentas.find((cuenta) => cuenta.id === sesion.id) ?? null);
  // `sesion?.tipo`: el `?.` da `undefined` (en vez de fallar) si `sesion` es `null`;
  // entonces la comparación da `false`.
  const esDemo = sesion?.tipo === "demo";

  // PASO 4 — Las acciones.
  // `some` devuelve `true` si AL MENOS UNA cuenta cumple la condición.
  const existeCorreo = (email: string) =>
    cuentas.some((cuenta) => cuenta.email === normalizar(email));

  const registrar = async (datos: DatosRegistro) => {
    // "Rest": separa la contraseña (`contrasenia`) del resto, que es el perfil
    // [JS 7]. La contraseña no tiene que quedar dentro del objeto que se guarda
    // en AsyncStorage.
    const { contrasenia, ...perfil } = datos;
    const nueva: Usuario = {
      id: `usr-${Date.now()}`, // milisegundos desde 1970: casi nunca se repite
      ...perfil,
      email: normalizar(perfil.email),
    };
    // Primero la contraseña, cifrada; si eso falla, la cuenta no se crea.
    await guardarClave(nueva.id, contrasenia);
    // Después el perfil, en un array NUEVO [JS 9]; el `useEffect` de arriba lo
    // guarda en AsyncStorage.
    setCuentas((actuales) => [...actuales, nueva]);
  };

  const iniciarSesion = async (
    email: string,
    contrasenia: string
  ): Promise<ResultadoIngreso> => {
    // `find` devuelve la primera cuenta con ese correo, o `undefined` si no hay.
    const cuenta = cuentas.find((c) => c.email === normalizar(email));

    // Un correo que no es de ninguna cuenta creada entra como DEMOSTRACIÓN.
    if (!cuenta) {
      setSesion({ tipo: "demo" });
      return "ok";
    }

    // Una cuenta creada: la contraseña tiene que coincidir con la guardada.
    // `await` espera a que se lea la contraseña cifrada del teléfono.
    const guardada = await leerClave(cuenta.id);
    if (guardada !== contrasenia) return "contraseniaIncorrecta";
    setSesion({ tipo: "cuenta", id: cuenta.id });
    return "ok";
  };

  // Cerrar la sesión es dejarla en `null`: el `useEffect` de arriba borra la clave guardada.
  const cerrarSesion = () => setSesion(null);

  // El `value` va MEMOIZADO [CTX]: sin `useMemo`, cada render del Provider crearía
  // un objeto nuevo y avisaría a TODOS los que lo leen. Se recalcula solo cuando
  // cambian las cuentas o la sesión (de ahí salen `usuario` y `esDemo`).
  const valor = useMemo<ValorSesion>(
    () => ({
      usuario,
      esDemo,
      existeCorreo,
      registrar,
      iniciarSesion,
      cerrarSesion,
    }),
    [cuentas, sesion]
  );

  // [ALM 4] Hasta terminar de leer el disco no se dibuja nada: así no aparece un
  // instante la pantalla de "sin sesión" cuando en realidad sí hay una guardada.
  if (!listo) return null;

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}

// PASO 5 — El hook propio [CTX]: centraliza el chequeo de "¿hay Provider arriba?".
// Se usa así, dentro de una pantalla:
//     const { usuario, cerrarSesion } = useSesion();
export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);

  // Si es `undefined`, se llamó fuera de <ProveedorSesion>. Error claro y
  // temprano, en vez de un `undefined` que rompe más adelante.
  if (!valor) {
    throw new Error("useSesion tiene que usarse dentro de <ProveedorSesion>");
  }

  return valor;
}
