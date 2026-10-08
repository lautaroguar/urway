/**
 * ============================================================================
 * app/evento/nuevo.tsx — Formulario para crear un evento
 * ============================================================================
 *
 * QUÉ ES:
 *   El único formulario "de verdad" de la app. Se abre con el botón "+" de la
 *   Agenda. Tiene: título, tipo (chips), materia (chips), fecha, hora de inicio
 *   y de fin, lugar y notas. Al tocar "Crear evento" valida los datos y, si
 *   están bien, los guarda en el Context y vuelve a la Agenda.
 *
 * POR QUÉ VIVE EN `evento/nuevo.tsx`:
 *   Ese archivo define la ruta `/evento/nuevo`. Existe además `evento/[id].tsx`
 *   para `/evento/ev-3`: la ruta ESTÁTICA "nuevo" tiene prioridad sobre la
 *   dinámica `[id]`, así que no se confunden.
 *
 * LA IDEA CENTRAL — FORMULARIO CONTROLADO Y ERRORES DERIVADOS:
 *   - Cada campo tiene su propio `useState` (formulario controlado).
 *   - Los errores NO se guardan en estado: se CALCULAN en cada render a partir
 *     de lo que hay escrito. Así nunca pueden quedar desactualizados.
 *   - `intentoGuardar` (un booleano) evita mostrar errores antes de que la
 *     persona intente enviar el formulario.
 *
 * TEORÍA:
 *   [JS 23] Formulario controlado: `value` + `onChangeText` en cada campo.
 *   [JS 25] Estado derivado: `errorTitulo`, `errorFecha`, `errorHora` y
 *           `hayErrores`.
 *   [JS 20] `useState` (varios) y `useState<TipoEvento>` con tipo.
 *   [JS 29] `agregarEvento` viene del Context.
 *   [NAV]   `router.back()` al terminar.
 *   [JS 7]  Spread para armar la lista de opciones de materia.
 *   [COMP]  `TextInput` (keyboardType, maxLength, multiline), `ChipsFiltro`.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ChipsFiltro } from "@/componentes/ChipsFiltro";
import { etiquetasTipo, type TipoEvento } from "@/datos/agenda";
// El Context de datos: ofrece `agregarEvento` y la lista ACTUAL de materias.
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import { aMinutos, claveFecha, desdeClave } from "@/utilidades/fechas";
// `codigosEnCurso(materias)`: los códigos de las materias que se están cursando AHORA.
import { codigosEnCurso } from "@/utilidades/materias";

// Las opciones del selector "Tipo", con la forma { clave, etiqueta } de
// `ChipsFiltro`. Se arman a partir del diccionario `etiquetasTipo`:
//   1. `Object.keys(...)` devuelve sus claves: ["clase", "parcial", "entrega"].
//      Devuelve `string[]`, y `as TipoEvento[]` le dice a TypeScript que en
//      realidad son del tipo más preciso `TipoEvento`.
//   2. `map` convierte cada clave en { clave, etiqueta }.
const TIPOS = (Object.keys(etiquetasTipo) as TipoEvento[]).map((clave) => ({
  clave,
  etiqueta: etiquetasTipo[clave],
}));

// Valor especial de "sin materia". Se guarda en una constante para no repetir
// el texto "ninguna" (y evitar errores de tipeo).
const SIN_MATERIA = "ninguna";

// EXPRESIONES REGULARES (patrones para validar texto):
//   ES_FECHA: `^\d{4}-\d{2}-\d{2}$`
//     `^` empieza el texto · `\d{4}` cuatro dígitos · `-` un guion ·
//     `\d{2}` dos dígitos · `$` termina el texto. Acepta "2026-10-02".
const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;
//   ES_HORA: `^([01]\d|2[0-3]):[0-5]\d$`
//     La hora es "0" o "1" seguido de un dígito (00–19), o "2" seguido de 0–3
//     (20–23); después `:` y los minutos (`[0-5]\d` = 00–59). Acepta "08:30".
const ES_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

/** Valida que sea una fecha real: "2026-02-31" tiene forma de fecha pero no lo es. */
// Doble verificación: (1) que tenga la FORMA correcta (regex) y (2) que sea una
// fecha REAL. Para (2) se convierte el texto a `Date` y se vuelve a texto: si
// "2026-02-31" pasa por `Date`, JavaScript la corrige a "2026-03-03", y como ya
// no coincide con el original, se detecta que era inválida.
function esFechaValida(texto: string): boolean {
  return ES_FECHA.test(texto) && claveFecha(desdeClave(texto)) === texto;
}

/** Formulario para crear un evento de la agenda. */
export default function PantallaNuevoEvento() {
  const router = useRouter();
  // La acción para agregar un evento y las materias ACTUALES (para el selector).
  // (Desestructuración: del objeto del Context se sacan solo esos dos campos.)
  const { agregarEvento, materias } = useDatos();

  // Las opciones del selector "Materia": primero "Ninguna" y después una por cada
  // materia que estoy cursando AHORA (cambian si una pasa a "pendiente de final",
  // por eso se calculan acá y no a nivel del archivo). `...` (SPREAD) esparce el
  // array generado por `map` dentro del array de afuera.
  const opcionesMateria = [
    { clave: SIN_MATERIA, etiqueta: "Ninguna" },
    // `map` convierte cada código ("MAT-201") en una opción { clave, etiqueta }.
    // Los paréntesis extra `({ ... })` son necesarios: sin ellos las llaves se
    // leerían como el cuerpo de la función y no como un objeto.
    ...codigosEnCurso(materias).map((codigo) => ({
      clave: codigo,
      etiqueta: codigo,
    })),
  ];

  // ESTADO DEL FORMULARIO: un `useState` por campo (formulario controlado).
  // El valor inicial de cada uno es el "valor por defecto" del formulario.
  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("clase");
  const [materiaId, setMateriaId] = useState(SIN_MATERIA);
  const [fecha, setFecha] = useState(claveFecha(new Date())); // hoy
  const [desde, setDesde] = useState("08:00");
  const [hasta, setHasta] = useState("10:00");
  const [lugar, setLugar] = useState("");
  const [notas, setNotas] = useState("");
  // ¿Ya se apretó "Crear evento" alguna vez? Hasta entonces no se muestran los
  // errores, para no "retar" a alguien que todavía no terminó de escribir.
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  // Los errores se calculan en el render, no se guardan en estado.
  // Cada uno es un TEXTO (el mensaje) o `null` (sin error).
  //
  // Título: error si, sin espacios, está vacío.
  const errorTitulo = titulo.trim().length === 0 ? "Poné un título." : null;
  // Fecha: error si no es una fecha real con el formato pedido.
  const errorFecha = esFechaValida(fecha)
    ? null
    : "La fecha va como AAAA-MM-DD, por ejemplo 2026-10-02.";
  // Horas: dos comprobaciones encadenadas con ternarios:
  //   1) si alguna no respeta el formato HH:MM → error de formato;
  //   2) si el formato está bien pero el fin no es posterior al inicio → error de orden;
  //   3) si todo está bien → `null`.
  // `aMinutos("08:30")` = 510: pasar a minutos permite comparar con `<=`.
  const errorHora =
    !ES_HORA.test(desde) || !ES_HORA.test(hasta)
      ? "Las horas van como HH:MM, por ejemplo 08:30."
      : aMinutos(hasta) <= aMinutos(desde)
        ? "La hora de fin tiene que ser posterior a la de inicio."
        : null;
  // `Boolean(...)` convierte a true/false: `||` devuelve el primer valor
  // "verdadero" (un texto no vacío cuenta como verdadero, `null` como falso).
  const hayErrores = Boolean(errorTitulo || errorFecha || errorHora);

  // Se ejecuta al tocar "Crear evento".
  const guardar = () => {
    // Desde ahora los errores (si los hay) se muestran.
    setIntentoGuardar(true);
    // Si hay errores, no se guarda nada y se corta la función.
    if (hayErrores) return;

    // `agregarEvento` (del Context) genera el id y agrega el evento a la lista.
    agregarEvento({
      titulo: titulo.trim(), // sin espacios sobrantes
      tipo,
      // Si se eligió "Ninguna", el campo queda `undefined` (opcional).
      materiaId: materiaId === SIN_MATERIA ? undefined : materiaId,
      fecha,
      desde,
      hasta,
      lugar: lugar.trim(),
      // `notas.trim() || undefined`: un texto vacío es "falso", así que en ese
      // caso se guarda `undefined` en vez de un texto vacío.
      notas: notas.trim() || undefined,
    });
    // Vuelve a la pantalla anterior (la Agenda), que ya muestra el evento nuevo.
    router.back();
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
        // Permite tocar botones y chips con el teclado abierto.
        keyboardShouldPersistTaps="handled"
        // En iOS, sube el contenido cuando aparece el teclado para no taparlo.
        automaticallyAdjustKeyboardInsets
      >
        {/* ---------- Título ---------- */}
        <Campo etiqueta="Título">
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Parcial de Física I"
            placeholderTextColor={colores.textoDebil}
            style={estilos.input}
          />
        </Campo>
        {/* El error aparece solo si ya se intentó guardar Y hay error.
            `&&` en un ternario con `null`: si falta alguna condición, no se
            dibuja nada. */}
        {intentoGuardar && errorTitulo ? (
          <Text style={estilos.error}>{errorTitulo}</Text>
        ) : null}

        {/* ---------- Tipo (chips) ---------- */}
        <Campo etiqueta="Tipo">
          <ChipsFiltro opciones={TIPOS} valor={tipo} alCambiar={setTipo} />
        </Campo>

        {/* ---------- Materia (chips) ---------- */}
        <Campo etiqueta="Materia">
          <ChipsFiltro
            opciones={opcionesMateria}
            valor={materiaId}
            alCambiar={setMateriaId}
          />
        </Campo>

        {/* ---------- Fecha ---------- */}
        <Campo etiqueta="Fecha">
          <TextInput
            value={fecha}
            onChangeText={setFecha}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colores.textoDebil}
            // Teclado con números y signos (guion, dos puntos).
            keyboardType="numbers-and-punctuation"
            maxLength={10} // "AAAA-MM-DD" tiene 10 caracteres
            style={estilos.input}
          />
        </Campo>
        {intentoGuardar && errorFecha ? (
          <Text style={estilos.error}>{errorFecha}</Text>
        ) : null}

        {/* ---------- Horas: "Desde" y "Hasta" en dos columnas ---------- */}
        <View style={estilos.filaHoras}>
          <View style={estilos.columnaHora}>
            <Campo etiqueta="Desde">
              <TextInput
                value={desde}
                onChangeText={setDesde}
                placeholder="HH:MM"
                placeholderTextColor={colores.textoDebil}
                keyboardType="numbers-and-punctuation"
                maxLength={5} // "HH:MM" tiene 5 caracteres
                style={estilos.input}
              />
            </Campo>
          </View>
          <View style={estilos.columnaHora}>
            <Campo etiqueta="Hasta">
              <TextInput
                value={hasta}
                onChangeText={setHasta}
                placeholder="HH:MM"
                placeholderTextColor={colores.textoDebil}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
                style={estilos.input}
              />
            </Campo>
          </View>
        </View>
        {intentoGuardar && errorHora ? (
          <Text style={estilos.error}>{errorHora}</Text>
        ) : null}

        {/* ---------- Lugar ---------- */}
        <Campo etiqueta="Lugar">
          <TextInput
            value={lugar}
            onChangeText={setLugar}
            placeholder="Aula 302"
            placeholderTextColor={colores.textoDebil}
            style={estilos.input}
          />
        </Campo>

        {/* ---------- Notas (varias líneas) ---------- */}
        <Campo etiqueta="Notas">
          <TextInput
            value={notas}
            onChangeText={setNotas}
            placeholder="Qué entra, qué llevar…"
            placeholderTextColor={colores.textoDebil}
            // Dos estilos: el común y uno que lo agranda.
            style={[estilos.input, estilos.inputLargo]}
            multiline // permite varias líneas
            textAlignVertical="top" // en Android, el texto arranca arriba
          />
        </Campo>

        {/* ---------- Botón de guardar ---------- */}
        <Pressable
          onPress={guardar}
          style={({ pressed }) => [
            estilos.boton,
            pressed && estilos.presionado,
          ]}
        >
          <Ionicons
            name="checkmark-circle-outline"
            size={18}
            color={colores.blanco}
          />
          <Text style={estilos.textoBoton}>Crear evento</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE AUXILIAR (privado): un campo con su etiqueta arriba
// ---------------------------------------------------------------------------

// Envuelve un control (un `TextInput`, unos chips...) con su rótulo. Usa
// `children`: lo que se escribe entre `<Campo>` y `</Campo>` se dibuja abajo
// del rótulo. Evita repetir el mismo bloque de rótulo + control ocho veces.
function Campo({
  etiqueta,
  children,
}: {
  etiqueta: string;
  children: ReactNode;
}) {
  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiquetaCampo}>{etiqueta}</Text>
      {children}
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  scroll: {
    flex: 1,
  },

  contenido: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg,
  },

  // Un campo: rótulo arriba y control abajo (en columna, con poca separación).
  campo: {
    gap: espaciado.sm,
  },

  etiquetaCampo: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  // El recuadro de todos los campos de texto.
  input: {
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.md,
    fontSize: 15,
    color: colores.textoSuave,
  },

  // Se suma a `input` en el campo de notas para que sea más alto.
  inputLargo: {
    minHeight: 92,
  },

  // "Desde" y "Hasta" en fila, cada uno con el mismo ancho.
  filaHoras: {
    flexDirection: "row",
    gap: espaciado.md,
  },

  columnaHora: {
    flex: 1,
  },

  // El mensaje de error va pegado debajo de su campo: el margen negativo anula
  // el `gap` del contenedor.
  error: {
    marginTop: -espaciado.sm,
    fontSize: 12,
    color: colores.alerta,
  },

  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
    borderRadius: radios.md,
    backgroundColor: colores.primario,
    paddingVertical: espaciado.md + 2,
  },

  textoBoton: {
    fontSize: 15,
    fontWeight: "700",
    color: colores.blanco,
  },

  presionado: {
    opacity: 0.7,
  },
});
