/**
 * ============================================================================
 * componentes/EstadoDeMateria.tsx — Cambiar el estado de una materia
 * ============================================================================
 *
 * QUÉ ES:
 *   La tarjeta del detalle de una materia donde se elige en qué estado está:
 *   En curso · Pendiente de final · Aprobada. Aplica estas reglas:
 *     - En curso → Pendiente de final: se puede.
 *     - En curso → Aprobada: NO. Primero hay que dejarla "Pendiente de final" (se
 *       muestra el motivo).
 *     - Pendiente de final → Aprobada: al tocar "Aprobada" se abre el campo de la
 *       NOTA del final (4 a 10), con un MENSAJE EN ROJO que avisa que la
 *       operación NO se puede deshacer. Al confirmar se aprueba directo (no hay
 *       ventana de alerta: el aviso es parte del mismo formulario).
 *     - Pendiente de final → En curso: se puede (por ejemplo, si se quedó sin
 *       fechas de final y hay que recursarla).
 *     - Aprobada → cualquier otro estado: NO. Aprobar el final no se deshace, y
 *       volver a "En curso" sería empezar la materia de cero (se muestra el
 *       motivo).
 *   Una materia APROBADA solo permite "Corregir nota", para arreglar un error de
 *   tipeo sin cambiar el estado. Una materia BLOQUEADA no se cambia: solo se
 *   explica por qué.
 *
 * DÓNDE SE USA:
 *   `app/materia/[id].tsx`.
 *
 * DE DÓNDE SALEN LAS REGLAS:
 *   De `utilidades/materias.ts` (`validarCambioDeEstado`, `validarNotaFinal`). Este
 *   componente solo las aplica y muestra el mensaje; los cambios los guarda el
 *   Context de datos (`cambiarEstadoMateria` y `corregirNotaFinal`).
 *
 * TEORÍA:
 *   [JS 23] Formulario controlado: `value` + `onChangeText` en el campo de la nota.
 *   [JS 25] Estado derivado: `errorNota` se calcula en el render; `intentoNota`
 *           evita mostrarlo antes de apretar el botón.
 *   [JS 24] Regla de los hooks: todos se llaman ANTES del `return` condicional.
 *   [JS 29] `useDatos()` lee el Context y sus funciones lo modifican.
 *   [COMP]  `ChipsFiltro` como selector, `Tarjeta`, `Pressable` y `TextInput`.
 */
// Íconos de Ionicons (el candado, el signo de alerta, el lápiz).
import { Ionicons } from "@expo/vector-icons";
// `useState` guarda valores que, al cambiar, vuelven a dibujar el componente.
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

// La fila de "chips" que hace de selector de estado.
import { ChipsFiltro } from "@/componentes/ChipsFiltro";
import { Tarjeta } from "@/componentes/Tarjeta";
import {
  etiquetasEstado, // "pendienteFinal" → "Pendiente de final"
  type EstadoMateria,
  type Materia,
} from "@/datos/carrera";
// `useDatos` ofrece las funciones del Context para cambiar el estado y la nota.
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import {
  NOTA_MAXIMA, // 10
  NOTA_MINIMA, // 4
  validarCambioDeEstado, // ¿se puede pasar de un estado a otro? (y por qué no)
  validarNotaFinal, // ¿la nota escrita es un entero de 4 a 10?
} from "@/utilidades/materias";
import { soloDigitos } from "@/utilidades/validaciones";

// Los tres estados entre los que se puede elegir: todos menos "bloqueada".
// `Exclude<A, B>` es "el tipo A sin B".
type EstadoCambiable = Exclude<EstadoMateria, "bloqueada">;

// Las opciones del selector, con la forma que espera `ChipsFiltro` ({ clave,
// etiqueta }). Las etiquetas salen del diccionario de `datos/carrera.ts`.
const OPCIONES: { clave: EstadoCambiable; etiqueta: string }[] = [
  { clave: "cursando", etiqueta: etiquetasEstado.cursando },
  { clave: "pendienteFinal", etiqueta: etiquetasEstado.pendienteFinal },
  { clave: "aprobada", etiqueta: etiquetasEstado.aprobada },
];

// Qué hacer a continuación, según el estado actual. `Record<EstadoCambiable,
// string>` obliga a tener UN texto por cada estado: si se agrega uno y falta
// acá, TypeScript avisa.
const AYUDAS: Record<EstadoCambiable, string> = {
  cursando: "Cuando termines la cursada, pasala a «Pendiente de final».",
  pendienteFinal:
    "Cuando rindas el final, tocá «Aprobada» y cargá la nota. Si te quedaste sin fechas de final, podés volver a «En curso».",
  aprobada:
    "Aprobar el final no se deshace: la materia ya no cambia de estado. Si hubo un error de tipeo, corregí la nota.",
};

// Para qué se abre el campo de la nota: para APROBAR la materia o para CORREGIR la
// nota de una ya aprobada. `null` = el campo está cerrado. Es una unión de tres
// valores posibles.
type ModoNota = "aprobar" | "corregir" | null;

// Lo que recibe el componente: la materia (con su estado y nota actuales).
type Props = {
  materia: Materia;
};

/** Selector de estado de una materia, con las reglas del cambio. */
export function EstadoDeMateria({ materia }: Props) {
  // Las dos acciones del Context: cambiar el estado y corregir la nota.
  const { cambiarEstadoMateria, corregirNotaFinal } = useDatos();

  // ESTADO LOCAL (solo lo necesita esta tarjeta):
  //   - `modoNota`: ¿está abierto el campo de la nota? ¿Para aprobar o para corregir?
  //   - `nota`: lo escrito en ese campo (texto).
  //   - `intentoNota`: ¿ya se apretó el botón? (para mostrar el error recién ahí).
  //   - `aviso`: el motivo por el que no se pudo hacer el último cambio.
  const [modoNota, setModoNota] = useState<ModoNota>(null);
  const [nota, setNota] = useState("");
  const [intentoNota, setIntentoNota] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

  // RETORNO TEMPRANO: una materia bloqueada no se cambia. Los hooks de arriba ya
  // se llamaron, así que esto respeta la regla de los hooks [JS 24]. Después de
  // este `if`, TypeScript sabe que el estado NO es "bloqueada".
  if (materia.estado === "bloqueada") {
    return (
      <Tarjeta style={estilos.bloqueada}>
        <Ionicons name="lock-closed" size={18} color={colores.textoDebil} />
        <Text style={estilos.textoBloqueada}>
          Esta materia está bloqueada: todavía no la podés cursar.
        </Text>
      </Tarjeta>
    );
  }
  // Desde acá el estado es uno de los tres cambiables. Se guarda en una constante
  // con ese tipo más preciso para usarlo en el selector.
  const estadoActual: EstadoCambiable = materia.estado;

  // El error de la nota se CALCULA en cada render [JS 25]: un texto o `null`.
  const errorNota = validarNotaFinal(nota);

  // Cierra el campo de la nota y borra lo escrito.
  const cerrarNota = () => {
    setModoNota(null);
    setNota("");
    setIntentoNota(false);
  };

  // Se ejecuta al tocar uno de los tres estados (`nuevo` es el que se tocó).
  const elegir = (nuevo: EstadoCambiable) => {
    // Lo primero: se borra el aviso del cambio anterior.
    setAviso(null);
    setIntentoNota(false);

    // Tocar el estado en el que ya está no hace nada (solo cierra la nota).
    if (nuevo === estadoActual) {
      cerrarNota();
      return;
    }

    // De "Pendiente de final" a "Aprobada" falta un dato: la nota. Todavía NO se
    // cambia el estado: se abre el campo (con el aviso rojo) y se espera la
    // confirmación.
    if (nuevo === "aprobada" && estadoActual === "pendienteFinal") {
      setNota("");
      setModoNota("aprobar");
      return;
    }

    cerrarNota();
    // ¿Se puede? Si no, se muestra el motivo ("primero tiene que quedar pendiente
    // de final", "una materia aprobada ya no cambia de estado").
    const motivo = validarCambioDeEstado(estadoActual, nuevo);
    // `motivo` es un texto (hay un problema) o `null` (se puede): un texto no
    // vacío cuenta como "verdadero" en el `if`.
    if (motivo) {
      setAviso(motivo);
      return;
    }
    // Se puede: el Context cambia el estado de esta materia.
    cambiarEstadoMateria(materia.id, nuevo);
  };

  // "Corregir nota": abre el campo con la nota actual ya escrita.
  const empezarCorreccion = () => {
    setAviso(null);
    setIntentoNota(false);
    // `materia.notaFinal ?? ""`: la nota actual o, si por algo no hubiera, un texto
    // vacío. `String(8)` la pasa a texto, que es lo que guarda el campo.
    setNota(String(materia.notaFinal ?? ""));
    setModoNota("corregir");
  };

  // Se ejecuta al tocar el botón del formulario de la nota.
  const confirmarNota = () => {
    // Desde ahora el error de la nota (si lo hay) se muestra.
    setIntentoNota(true);
    // Si la nota no es válida, no se avanza.
    if (errorNota) return;
    // `Number("9")` pasa el texto a número.
    const notaNumero = Number(nota);

    // Corregir un error de tipeo se puede hacer las veces que haga falta: no pide
    // confirmación.
    if (modoNota === "corregir") {
      corregirNotaFinal(materia.id, notaNumero);
      cerrarNota();
      return;
    }

    // Aprobar NO se puede deshacer, pero el aviso ya se está viendo en el mismo
    // formulario (el cartel rojo de abajo): acá se aprueba directo. El promedio de
    // Inicio se recalcula solo (es un valor derivado).
    cambiarEstadoMateria(materia.id, "aprobada", notaNumero);
    cerrarNota();
  };

  return (
    <Tarjeta style={estilos.tarjeta}>
      <Text style={estilos.rotulo}>Estado de la materia</Text>

      {/* El selector: `valor` baja (el estado actual) y `alCambiar` sube (el que
          se tocó). */}
      <ChipsFiltro
        opciones={OPCIONES}
        valor={estadoActual}
        alCambiar={elegir}
      />

      {/* La nota, si está aprobada, con el botón para corregirla. La condición
          tiene dos partes unidas con `&&` ("y"): que esté aprobada Y que tenga nota. */}
      {estadoActual === "aprobada" && materia.notaFinal !== undefined ? (
        <View style={estilos.filaNota}>
          <View>
            <Text style={estilos.rotuloNota}>Nota del final</Text>
            <Text style={estilos.valorNota}>{materia.notaFinal}</Text>
          </View>
          <Pressable
            onPress={empezarCorreccion}
            // `style` como función: recibe `pressed` (¿se está apretando?).
            style={({ pressed }) => [
              estilos.botonCorregir,
              pressed && estilos.presionado,
            ]}
          >
            <Ionicons name="create-outline" size={16} color={colores.azulClaro} />
            <Text style={estilos.textoBotonCorregir}>Corregir nota</Text>
          </Pressable>
        </View>
      ) : null}
      {/* El texto de ayuda: se busca en el diccionario por el estado actual. */}
      <Text style={estilos.ayuda}>{AYUDAS[estadoActual]}</Text>

      {/* El motivo por el que no se pudo cambiar (solo si hay uno). */}
      {aviso ? (
        <View style={estilos.cartelAviso}>
          <Ionicons
            name="alert-circle-outline"
            size={16}
            color={colores.alerta}
          />
          <Text style={estilos.textoAviso}>{aviso}</Text>
        </View>
      ) : null}

      {/* El formulario de la nota: solo cuando se está por aprobar o corregir. */}
      {modoNota !== null ? (
        <View style={estilos.formularioNota}>
          {/* El AVISO de precaución, en rojo y con el mismo aspecto que el cartel
              de los errores de arriba. Solo al APROBAR: corregir una nota se puede
              hacer las veces que haga falta. */}
          {modoNota === "aprobar" ? (
            <View style={estilos.cartelAviso}>
              <Ionicons
                name="alert-circle-outline"
                size={16}
                color={colores.alerta}
              />
              <Text style={estilos.textoAviso}>
                Atención: aprobar la materia no se puede deshacer. Revisá la nota
                antes de confirmar (después solo vas a poder corregirla).
              </Text>
            </View>
          ) : null}

          <Text style={estilos.rotulo}>
            {/* El rótulo cambia según para qué se abrió el campo; `{" "}` es un
                espacio explícito entre las dos partes del texto. */}
            {modoNota === "corregir" ? "Nueva nota del final" : "Nota del final"}{" "}
            ({NOTA_MINIMA} a {NOTA_MAXIMA})
          </Text>
          <TextInput
            value={nota} // INPUT CONTROLADO [JS 23]: lo que se ve sale del estado...
            // ...y cada tecla lo actualiza. `soloDigitos` descarta lo que no sea
            // número (por ejemplo, si se pega) y corta en 2 caracteres.
            onChangeText={(texto) => setNota(soloDigitos(texto, 2))}
            placeholder="Por ejemplo, 8"
            placeholderTextColor={colores.textoDebil}
            keyboardType="number-pad" // teclado solo con números
            maxLength={2} // la nota más larga es "10"
            // Con error (y después de intentar) el borde se pinta de rojo claro.
            style={[estilos.input, intentoNota && errorNota && estilos.inputError]}
          />
          {/* El error de la nota (solo después de apretar el botón). */}
          {intentoNota && errorNota ? (
            <Text style={estilos.error}>{errorNota}</Text>
          ) : null}

          <View style={estilos.botones}>
            <Pressable
              onPress={confirmarNota}
              style={({ pressed }) => [
                estilos.botonPrincipal,
                pressed && estilos.presionado,
              ]}
            >
              <Text style={estilos.textoBotonPrincipal}>
                {/* El texto del botón cambia: guardar al corregir, aprobar al aprobar. */}
                {modoNota === "corregir" ? "Guardar nota" : "Aprobar con esta nota"}
              </Text>
            </Pressable>
            <Pressable
              onPress={cerrarNota} // cancelar = cerrar el campo sin cambiar nada
              style={({ pressed }) => [
                estilos.botonSecundario,
                pressed && estilos.presionado,
              ]}
            >
              <Text style={estilos.textoBotonSecundario}>Cancelar</Text>
            </Pressable>
          </View>
        </View>
      ) : null}
    </Tarjeta>
  );
}

const estilos = StyleSheet.create({
  // La tarjeta: `gap` separa el selector, la nota, los avisos y el formulario.
  tarjeta: {
    gap: espaciado.md,
  },

  // El rótulo chico en mayúsculas ("Estado de la materia", "Nota del final").
  // `textTransform` no cambia el texto escrito, solo cómo se ve.
  rotulo: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  // El texto de ayuda de abajo del selector. `lineHeight` es la altura de cada renglón.
  ayuda: {
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoTenue,
  },

  // La nota del final, cuando está aprobada: la nota a la izquierda y el botón de
  // corregirla a la derecha.
  filaNota: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
    borderRadius: radios.md,
    backgroundColor: colores.primarioProfundo,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
  },

  // "Nota del final" (el rótulo, chico).
  rotuloNota: {
    fontSize: 12,
    color: colores.azulPalido,
  },

  // La nota en grande.
  valorNota: {
    fontSize: 22,
    fontWeight: "700",
    color: colores.texto,
  },

  // El botón "Corregir nota": una pastilla con borde (`radios.pastilla` redondea
  // por completo los lados cortos).
  botonCorregir: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    borderRadius: radios.pastilla,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.md,
  },

  // El texto del botón "Corregir nota".
  textoBotonCorregir: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  // El cartel rojo (el motivo del rechazo y el aviso de "no se puede deshacer"):
  // ícono y texto en fila. `alignItems: "flex-start"` deja el ícono arriba si el
  // texto ocupa varios renglones.
  cartelAviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado.sm,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.alerta,
    padding: espaciado.md,
  },

  // `flex: 1`: el texto ocupa lo que sobra y baja de renglón (no empuja al ícono).
  textoAviso: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colores.alerta,
  },

  // El formulario de la nota: sus partes van en columna con poco espacio.
  formularioNota: {
    gap: espaciado.sm,
  },

  // El recuadro donde se escribe la nota.
  input: {
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficie,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.md,
    fontSize: 16,
    color: colores.textoSuave,
  },

  // Se suma a `input` cuando hay error: pisa el color del borde.
  inputError: {
    borderColor: colores.alerta,
  },

  // El mensaje de error de la nota, debajo del recuadro.
  error: {
    fontSize: 12,
    color: colores.alerta,
  },

  // Los dos botones en fila.
  botones: {
    flexDirection: "row",
    gap: espaciado.sm,
  },

  // El botón principal (aprobar / guardar): `flex: 1` = ocupa todo el ancho que
  // le deja el botón "Cancelar".
  botonPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: radios.md,
    backgroundColor: colores.primario,
  },

  // El texto blanco del botón principal ("Aprobar con esta nota" / "Guardar nota").
  textoBotonPrincipal: {
    fontSize: 14,
    fontWeight: "700",
    color: colores.blanco,
  },

  // El botón "Cancelar": solo con borde, sin relleno.
  botonSecundario: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    paddingHorizontal: espaciado.lg,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  // El texto del botón "Cancelar".
  textoBotonSecundario: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  // Se suma a un botón mientras se aprieta: queda un poco transparente.
  presionado: {
    opacity: 0.75,
  },

  // La tarjeta de una materia bloqueada: ícono y texto en fila.
  bloqueada: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  // El mensaje de la materia bloqueada; `flex: 1` lo deja bajar de renglón sin empujar el candado.
  textoBloqueada: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colores.textoDebil,
  },
});
