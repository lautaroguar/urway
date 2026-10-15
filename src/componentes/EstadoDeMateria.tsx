import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, TextInput, View } from "react-native";

import { ChipsFiltro } from "@/componentes/ChipsFiltro";
import { Tarjeta } from "@/componentes/Tarjeta";
import {
  etiquetasEstado,
  type EstadoMateria,
  type Materia,
} from "@/datos/carrera";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import {
  NOTA_MAXIMA,
  NOTA_MINIMA,
  validarCambioDeEstado,
  validarNotaFinal,
} from "@/utilidades/materias";
import { soloDigitos } from "@/utilidades/validaciones";

type EstadoCambiable = Exclude<EstadoMateria, "bloqueada">;

const OPCIONES: { clave: EstadoCambiable; etiqueta: string }[] = [
  { clave: "cursando", etiqueta: etiquetasEstado.cursando },
  { clave: "pendienteFinal", etiqueta: etiquetasEstado.pendienteFinal },
  { clave: "aprobada", etiqueta: etiquetasEstado.aprobada },
];

const AYUDAS: Record<EstadoCambiable, string> = {
  cursando: "Cuando termines la cursada, pasala a «Pendiente de final».",
  pendienteFinal:
    "Cuando rindas el final, tocá «Aprobada» y cargá la nota. Si te quedaste sin fechas de final, podés volver a «En curso».",
  aprobada:
    "Aprobar el final no se deshace: la materia ya no cambia de estado. Si hubo un error de tipeo, corregí la nota.",
};

type ModoNota = "aprobar" | "corregir" | null;

type Props = {
  materia: Materia;
};

export function EstadoDeMateria({ materia }: Props) {
  const { cambiarEstadoMateria, corregirNotaFinal } = useDatos();

  const [modoNota, setModoNota] = useState<ModoNota>(null);
  const [nota, setNota] = useState("");
  const [intentoNota, setIntentoNota] = useState(false);
  const [aviso, setAviso] = useState<string | null>(null);

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
  const estadoActual: EstadoCambiable = materia.estado;

  const errorNota = validarNotaFinal(nota);

  const cerrarNota = () => {
    setModoNota(null);
    setNota("");
    setIntentoNota(false);
  };

  const elegir = (nuevo: EstadoCambiable) => {
    setAviso(null);
    setIntentoNota(false);

    if (nuevo === estadoActual) {
      cerrarNota();
      return;
    }

    if (nuevo === "aprobada" && estadoActual === "pendienteFinal") {
      setNota("");
      setModoNota("aprobar");
      return;
    }

    cerrarNota();
    const motivo = validarCambioDeEstado(estadoActual, nuevo);
    if (motivo) {
      setAviso(motivo);
      return;
    }
    cambiarEstadoMateria(materia.id, nuevo);
  };

  const empezarCorreccion = () => {
    setAviso(null);
    setIntentoNota(false);
    setNota(String(materia.notaFinal ?? ""));
    setModoNota("corregir");
  };

  const confirmarNota = () => {
    setIntentoNota(true);
    if (errorNota) return;
    const notaNumero = Number(nota);

    if (modoNota === "corregir") {
      corregirNotaFinal(materia.id, notaNumero);
      cerrarNota();
      return;
    }

    cambiarEstadoMateria(materia.id, "aprobada", notaNumero);
    cerrarNota();
  };

  return (
    <Tarjeta style={estilos.tarjeta}>
      <Text style={estilos.rotulo}>Estado de la materia</Text>

      <ChipsFiltro
        opciones={OPCIONES}
        valor={estadoActual}
        alCambiar={elegir}
      />

      {estadoActual === "aprobada" && materia.notaFinal !== undefined ? (
        <View style={estilos.filaNota}>
          <View>
            <Text style={estilos.rotuloNota}>Nota del final</Text>
            <Text style={estilos.valorNota}>{materia.notaFinal}</Text>
          </View>
          <Pressable
            onPress={empezarCorreccion}
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
      <Text style={estilos.ayuda}>{AYUDAS[estadoActual]}</Text>

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

      {modoNota !== null ? (
        <View style={estilos.formularioNota}>
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
            {modoNota === "corregir" ? "Nueva nota del final" : "Nota del final"}{" "}
            ({NOTA_MINIMA} a {NOTA_MAXIMA})
          </Text>
          <TextInput
            value={nota}
            onChangeText={(texto) => setNota(soloDigitos(texto, 2))}
            placeholder="Por ejemplo, 8"
            placeholderTextColor={colores.textoDebil}
            keyboardType="number-pad"
            maxLength={2}
            style={[estilos.input, intentoNota && errorNota && estilos.inputError]}
          />
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
                {modoNota === "corregir" ? "Guardar nota" : "Aprobar con esta nota"}
              </Text>
            </Pressable>
            <Pressable
              onPress={cerrarNota}
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
  tarjeta: {
    gap: espaciado.md,
  },

  rotulo: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  ayuda: {
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoTenue,
  },

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

  rotuloNota: {
    fontSize: 12,
    color: colores.azulPalido,
  },

  valorNota: {
    fontSize: 22,
    fontWeight: "700",
    color: colores.texto,
  },

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

  textoBotonCorregir: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  cartelAviso: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado.sm,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.alerta,
    padding: espaciado.md,
  },

  textoAviso: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colores.alerta,
  },

  formularioNota: {
    gap: espaciado.sm,
  },

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

  inputError: {
    borderColor: colores.alerta,
  },

  error: {
    fontSize: 12,
    color: colores.alerta,
  },

  botones: {
    flexDirection: "row",
    gap: espaciado.sm,
  },

  botonPrincipal: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: radios.md,
    backgroundColor: colores.primario,
  },

  textoBotonPrincipal: {
    fontSize: 14,
    fontWeight: "700",
    color: colores.blanco,
  },

  botonSecundario: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    paddingHorizontal: espaciado.lg,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  textoBotonSecundario: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  presionado: {
    opacity: 0.75,
  },

  bloqueada: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  textoBloqueada: {
    flex: 1,
    fontSize: 13,
    lineHeight: 18,
    color: colores.textoDebil,
  },
});
