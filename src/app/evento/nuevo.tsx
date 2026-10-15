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
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import { aMinutos, claveFecha, desdeClave } from "@/utilidades/fechas";
import { codigosEnCurso } from "@/utilidades/materias";

const TIPOS = (Object.keys(etiquetasTipo) as TipoEvento[]).map((clave) => ({
  clave,
  etiqueta: etiquetasTipo[clave],
}));

const SIN_MATERIA = "ninguna";

const ES_FECHA = /^\d{4}-\d{2}-\d{2}$/;
const ES_HORA = /^([01]\d|2[0-3]):[0-5]\d$/;

function esFechaValida(texto: string): boolean {
  return ES_FECHA.test(texto) && claveFecha(desdeClave(texto)) === texto;
}

export default function PantallaNuevoEvento() {
  const router = useRouter();
  const { agregarEvento, materias } = useDatos();

  const opcionesMateria = [
    { clave: SIN_MATERIA, etiqueta: "Ninguna" },
    ...codigosEnCurso(materias).map((codigo) => ({
      clave: codigo,
      etiqueta: codigo,
    })),
  ];

  const [titulo, setTitulo] = useState("");
  const [tipo, setTipo] = useState<TipoEvento>("clase");
  const [materiaId, setMateriaId] = useState(SIN_MATERIA);
  const [fecha, setFecha] = useState(claveFecha(new Date()));
  const [desde, setDesde] = useState("08:00");
  const [hasta, setHasta] = useState("10:00");
  const [lugar, setLugar] = useState("");
  const [notas, setNotas] = useState("");
  const [intentoGuardar, setIntentoGuardar] = useState(false);

  const errorTitulo = titulo.trim().length === 0 ? "Poné un título." : null;
  const errorFecha = esFechaValida(fecha)
    ? null
    : "La fecha va como AAAA-MM-DD, por ejemplo 2026-10-02.";
  const errorHora =
    !ES_HORA.test(desde) || !ES_HORA.test(hasta)
      ? "Las horas van como HH:MM, por ejemplo 08:30."
      : aMinutos(hasta) <= aMinutos(desde)
        ? "La hora de fin tiene que ser posterior a la de inicio."
        : null;
  const hayErrores = Boolean(errorTitulo || errorFecha || errorHora);

  const guardar = () => {
    setIntentoGuardar(true);
    if (hayErrores) return;

    agregarEvento({
      titulo: titulo.trim(),
      tipo,
      materiaId: materiaId === SIN_MATERIA ? undefined : materiaId,
      fecha,
      desde,
      hasta,
      lugar: lugar.trim(),
      notas: notas.trim() || undefined,
    });
    router.back();
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Campo etiqueta="Título">
          <TextInput
            value={titulo}
            onChangeText={setTitulo}
            placeholder="Parcial de Física I"
            placeholderTextColor={colores.textoDebil}
            style={estilos.input}
          />
        </Campo>
        {intentoGuardar && errorTitulo ? (
          <Text style={estilos.error}>{errorTitulo}</Text>
        ) : null}

        <Campo etiqueta="Tipo">
          <ChipsFiltro opciones={TIPOS} valor={tipo} alCambiar={setTipo} />
        </Campo>

        <Campo etiqueta="Materia">
          <ChipsFiltro
            opciones={opcionesMateria}
            valor={materiaId}
            alCambiar={setMateriaId}
          />
        </Campo>

        <Campo etiqueta="Fecha">
          <TextInput
            value={fecha}
            onChangeText={setFecha}
            placeholder="AAAA-MM-DD"
            placeholderTextColor={colores.textoDebil}
            keyboardType="numbers-and-punctuation"
            maxLength={10}
            style={estilos.input}
          />
        </Campo>
        {intentoGuardar && errorFecha ? (
          <Text style={estilos.error}>{errorFecha}</Text>
        ) : null}

        <View style={estilos.filaHoras}>
          <View style={estilos.columnaHora}>
            <Campo etiqueta="Desde">
              <TextInput
                value={desde}
                onChangeText={setDesde}
                placeholder="HH:MM"
                placeholderTextColor={colores.textoDebil}
                keyboardType="numbers-and-punctuation"
                maxLength={5}
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

        <Campo etiqueta="Lugar">
          <TextInput
            value={lugar}
            onChangeText={setLugar}
            placeholder="Aula 302"
            placeholderTextColor={colores.textoDebil}
            style={estilos.input}
          />
        </Campo>

        <Campo etiqueta="Notas">
          <TextInput
            value={notas}
            onChangeText={setNotas}
            placeholder="Qué entra, qué llevar…"
            placeholderTextColor={colores.textoDebil}
            style={[estilos.input, estilos.inputLargo]}
            multiline
            textAlignVertical="top"
          />
        </Campo>

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

  inputLargo: {
    minHeight: 92,
  },

  filaHoras: {
    flexDirection: "row",
    gap: espaciado.md,
  },

  columnaHora: {
    flex: 1,
  },

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
