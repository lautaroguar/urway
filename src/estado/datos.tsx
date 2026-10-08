/**
 * ============================================================================
 * estado/datos.tsx — El Context: lo único que cambia mientras se usa la app
 * ============================================================================
 *
 * QUÉ ES:
 *   El "almacén" de cuatro datos que necesitan varias pantallas a la vez:
 *     1. los EVENTOS de la agenda (se pueden crear y eliminar),
 *     2. las SOLICITUDES DE AMISTAD enviadas (se pueden mandar y retirar),
 *     3. los APUNTES, o sea las fotos que se sacan o se eligen de la galería,
 *     4. las MATERIAS, con su estado y la nota del final (se cambia de estado
 *        con reglas, se puede corregir una nota mal cargada y de las notas sale
 *        el promedio).
 *   Todo vive en la memoria de la app: al cerrarla, vuelve al estado inicial.
 *   (Lo que SÍ sobrevive a cerrar la app, la sesión y las cuentas, está en
 *   `estado/sesion.tsx`.)
 *
 * CÓMO FUNCIONA (los 5 pasos, en el orden en que aparecen abajo):
 *   1. `type ValorContexto`  → declara QUÉ contiene el contexto.
 *   2. `createContext`       → crea el contexto (todavía vacío).
 *   3. `ProveedorDatos`      → componente que guarda el estado con `useState` y
 *                              lo ofrece a todo lo que tenga adentro.
 *   4. Las funciones         → agregar/eliminar, que SIEMPRE crean un array nuevo.
 *   5. `useDatos()`          → el hook que usan las pantallas para leerlo.
 *
 * DÓNDE SE MONTA:
 *   En app/_layout.tsx, envolviendo a todas las pantallas. Por eso cualquier
 *   pantalla puede llamar a `useDatos()`.
 *
 * TEORÍA:
 *   [JS 29] Context: "evita prop drilling, pero no reemplaza todo el estado".
 *   [JS 20] State: "no mutarlo directamente; usar el setter; actualización
 *           funcional cuando depende del valor anterior".
 *   [JS 9]  Inmutabilidad: "crea una nueva referencia".
 *   [JS 30] Custom hook: el nombre empieza con `use`, llama a otros hooks y
 *           expone una API pequeña.
 *   [CTX]   El `value` del Provider va memoizado con `useMemo`: "si el value es un
 *           objeto literal, va con useMemo. Siempre." (CTX = el PDF "React Native
 *           - Context".)
 *
 * QUÉ NO VA ACÁ:
 *   Lo que usa UNA sola pantalla (el texto de un buscador, un filtro, los campos
 *   de un formulario) queda en el `useState` de esa pantalla. El Context es solo
 *   para lo COMPARTIDO.
 */

// Del paquete `react` se importan cuatro funciones (los "hooks" y el creador de
// contextos) y un tipo:
//   - createContext: crea un contexto
//   - useContext:    lee el valor de un contexto
//   - useMemo:       guarda un valor calculado y solo lo recalcula si cambian sus
//                    dependencias (acá, para que el `value` del Provider no sea un
//                    objeto nuevo en cada render)
//   - useState:      guarda un valor que, al cambiar, vuelve a dibujar la pantalla
//   - ReactNode:     tipo de "cualquier cosa que React pueda dibujar" (para `children`)
import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

// Los valores iniciales de la agenda, de las solicitudes y de las materias.
import { eventosIniciales, type Evento } from "@/datos/agenda";
import {
  materiasIniciales,
  type EstadoMateria,
  type Materia,
} from "@/datos/carrera";
import { solicitudesEnviadasIniciales } from "@/datos/comunidad";
// La regla de qué cambios de estado de una materia están permitidos.
import {
  validarCambioDeEstado,
  validarCorreccionDeNota,
} from "@/utilidades/materias";

// Una foto de apunte guardada.
export type Apunte = {
  id: string;
  materiaId: string; // a qué materia pertenece
  titulo: string;
  /** URI de la foto, la misma que devolvió la galería. */
  uri: string; // ruta del archivo elegido; se muestra con <Image source={{ uri }} />
};

// PASO 1 — Todo lo que el contexto ofrece a las pantallas.
type ValorContexto = {
  // Eventos: la lista y las dos acciones para modificarla.
  eventos: Evento[];
  // `Omit<Evento, "id">` = un Evento SIN el campo `id` (el id lo genera esta
  // función, no quien llama).
  agregarEvento: (borrador: Omit<Evento, "id">) => void;
  eliminarEvento: (id: string) => void;

  /** Ids de los estudiantes a los que les mandé una solicitud. */
  solicitudesEnviadas: string[];
  /** Manda la solicitud, o la retira si ya estaba enviada. */
  alternarSolicitud: (estudianteId: string) => void;

  // Apuntes: la lista y las dos acciones.
  apuntes: Apunte[];
  agregarApunte: (materiaId: string, uri: string) => void;
  eliminarApunte: (id: string) => void;

  /** Las materias con su estado ACTUAL (y la nota si están aprobadas). */
  materias: Materia[];
  /**
   * Cambia el estado de una materia, solo si la regla lo permite (ver
   * `validarCambioDeEstado`). Para aprobarla hay que pasar la nota del final. Una
   * vez aprobada, la materia ya no cambia de estado (solo se corrige la nota).
   */
  cambiarEstadoMateria: (
    id: string,
    nuevoEstado: EstadoMateria,
    notaFinal?: number
  ) => void;
  /**
   * Corrige la nota del final de una materia YA aprobada (por un error de
   * tipeo), sin cambiar su estado. Ignora la nota si es inválida.
   */
  corregirNotaFinal: (id: string, notaFinal: number) => void;
};

// PASO 2 — Crear el contexto. `createContext<ValorContexto | null>(null)`:
// empieza en `null` (vacío) porque el valor real lo pone el proveedor. El tipo
// `ValorContexto | null` significa "o el valor completo, o null".
const ContextoDatos = createContext<ValorContexto | null>(null);

/**
 * Lo único que cambia durante la demo, y por eso lo único que vive en estado:
 * los eventos de la agenda, las solicitudes de amistad enviadas y las fotos de
 * apuntes. Se comparte por Context porque cada uno lo tocan pantallas distintas
 * (Inicio y Agenda leen los eventos; el formulario los crea).
 *
 * Todo lo demás son datos fijos que se importan de `datos/`. Al cerrar la app
 * se vuelve al estado inicial.
 */
// PASO 3 — El proveedor. Es un COMPONENTE (empieza con mayúscula, recibe props
// y devuelve JSX). Recibe `children`: todo lo que se escriba ENTRE sus etiquetas
// (`<ProveedorDatos> ...pantallas... </ProveedorDatos>`).
export function ProveedorDatos({ children }: { children: ReactNode }) {
  // `useState(valorInicial)` devuelve un par [valor, funciónParaCambiarlo].
  // Cuando se llama a la función, React vuelve a dibujar todo lo que dependa
  // del valor. Los `<Evento[]>` entre `<` `>` indican el tipo del valor.
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciales);

  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<string[]>(solicitudesEnviadasIniciales);
  
  const [apuntes, setApuntes] = useState<Apunte[]>([]); // arranca sin apuntes

  // Las materias arrancan como están en `datos/carrera.ts` y se van modificando.
  const [materias, setMaterias] = useState<Materia[]>(materiasIniciales);

  // PASO 4 — Las acciones.
  //
  // `agregarEvento`: recibe los datos del evento SIN id y le inventa uno.
  const agregarEvento = (borrador: Omit<Evento, "id">) => {
    // `Date.now()` son los milisegundos desde 1970: un número que casi nunca
    // se repite, útil como id único. `{ id: ..., ...borrador }` arma un objeto
    // nuevo con el id y copia todo lo demás del borrador (spread [JS 7]).
    const nuevo: Evento = { id: `ev-${Date.now()}`, ...borrador };
    // ACTUALIZACIÓN FUNCIONAL [JS 20]: como el nuevo valor depende del anterior,
    // se pasa una función que recibe el valor actual (`actuales`). Y
    // `[...actuales, nuevo]` es un array NUEVO con todos los eventos más el
    // nuevo (nunca se usa `push`, que modificaría el array existente).
    setEventos((actuales) => [...actuales, nuevo]);
  };

  // `eliminarEvento`: `filter` devuelve un array NUEVO con todos los eventos
  // MENOS el que tiene ese id (`!==` significa "distinto de").
  const eliminarEvento = (id: string) => {
    setEventos((actuales) => actuales.filter((evento) => evento.id !== id));
  };

  // `alternarSolicitud`: si ya estaba enviada la retira; si no, la agrega.
  // Es un ternario: `condición ? siEsVerdadero : siEsFalso`.
  const alternarSolicitud = (estudianteId: string) => {
    setSolicitudesEnviadas((actuales) =>
      actuales.includes(estudianteId)
        ? actuales.filter((id) => id !== estudianteId) // ya estaba → sacarla
        : [...actuales, estudianteId] // no estaba → agregarla
    );
  };

  // `agregarApunte`: arma el apunte con un título automático ("Apunte del 29/9")
  // y lo pone PRIMERO de la lista (así el más nuevo se ve arriba).
  const agregarApunte = (materiaId: string, uri: string) => {
    const hoy = new Date();
    const nuevo: Apunte = {
      id: `ap-${Date.now()}`,
      materiaId, // forma corta de `materiaId: materiaId`
      titulo: `Apunte del ${hoy.getDate()}/${hoy.getMonth() + 1}`, // getMonth() va de 0 a 11
      uri,
    };
    setApuntes((actuales) => [nuevo, ...actuales]);
  };

  const eliminarApunte = (id: string) => {
    setApuntes((actuales) => actuales.filter((apunte) => apunte.id !== id));
  };

  // `cambiarEstadoMateria`: devuelve una lista NUEVA con la materia cambiada. `map`
  // recorre las materias y deja las demás tal cual; a la que tiene ese `id` le
  // arma un objeto NUEVO con el estado y la nota (spread [JS 7], sin modificar el
  // original [JS 9]).
  const cambiarEstadoMateria = (
    id: string,
    nuevoEstado: EstadoMateria,
    notaFinal?: number
  ) => {
    setMaterias((actuales) =>
      actuales.map((materia) => {
        if (materia.id !== id) return materia;
        // Pasar al mismo estado no es un cambio. Importa: así esta función no se
        // puede usar para cambiar la nota de una materia aprobada (para eso está
        // `corregirNotaFinal`).
        if (nuevoEstado === materia.estado) return materia;
        // La pantalla ya avisa por qué no se puede; esto es una segunda defensa
        // para que un cambio inválido nunca llegue a guardarse.
        if (validarCambioDeEstado(materia.estado, nuevoEstado, notaFinal) !== null) {
          return materia;
        }
        return {
          ...materia,
          estado: nuevoEstado,
          // La nota solo existe mientras la materia está aprobada.
          notaFinal: nuevoEstado === "aprobada" ? notaFinal : undefined,
        };
      })
    );
  };

  // `corregirNotaFinal`: misma idea (lista NUEVA con `map`), pero solo cambia la
  // nota y solo si la materia está aprobada y la nota nueva es válida.
  const corregirNotaFinal = (id: string, notaFinal: number) => {
    setMaterias((actuales) =>
      actuales.map((materia) => {
        if (materia.id !== id) return materia;
        if (validarCorreccionDeNota(materia.estado, notaFinal) !== null) {
          return materia;
        }
        return { ...materia, notaFinal };
      })
    );
  };

  // El `value` va MEMOIZADO [CTX]: sin `useMemo`, cada render del Provider
  // crearía un objeto nuevo y avisaría a TODOS los que lo leen, aunque no haya
  // cambiado nada de lo que usan. Se recalcula solo cuando cambia alguna de estas
  // cuatro listas (las funciones usan siempre la forma funcional del `set`, así
  // que no dependen de ellas).
  const valor = useMemo<ValorContexto>(
    () => ({
      eventos,
      agregarEvento,
      eliminarEvento,
      solicitudesEnviadas,
      alternarSolicitud,
      apuntes,
      agregarApunte,
      eliminarApunte,
      materias,
      cambiarEstadoMateria,
      corregirNotaFinal,
    }),
    [eventos, solicitudesEnviadas, apuntes, materias]
  );

  // El proveedor devuelve el `Provider` del contexto. Su prop `value` es lo que
  // recibirá cualquier pantalla que llame a `useDatos()`. Al cambiar cualquiera de
  // los estados, React vuelve a dibujar a todos los que usan el contexto.
  return (
    <ContextoDatos.Provider value={valor}>
      {/* Acá van todas las pantallas de la app. */}
      {children}
    </ContextoDatos.Provider>
  );
}

// PASO 5 — El hook para leer el contexto. Se usa así, dentro de una pantalla:
//     const { eventos, agregarEvento } = useDatos();
// Es un "custom hook" [JS 30]: su nombre empieza con `use`, llama a otro hook
// (`useContext`) y expone una API chica.
export function useDatos(): ValorContexto {
  const valor = useContext(ContextoDatos);

  // Si el valor es `null`, significa que se llamó fuera de <ProveedorDatos>.
  // `throw new Error(...)` corta la ejecución con un mensaje claro [JS 12], en
  // lugar de fallar más adelante con un error confuso.
  if (!valor) {
    throw new Error("useDatos tiene que usarse dentro de <ProveedorDatos>");
  }

  return valor;
}
