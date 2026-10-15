import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radios } from "@/tema/colores";

const ZOOMS = [0, 0.2, 0.3, 0.4, 0.5];

export function useAyudasCamara() {
  const [linterna, setLinterna] = useState(false);
  const [nivelZoom, setNivelZoom] = useState(0);

  return {
    linterna,
    nivelZoom,
    zoom: ZOOMS[nivelZoom],
    esZoomMinimo: nivelZoom === 0,
    esZoomMaximo: nivelZoom === ZOOMS.length - 1,
    alternarLinterna: () => setLinterna((actual) => !actual),
    subirZoom: () =>
      setNivelZoom((actual) => Math.min(actual + 1, ZOOMS.length - 1)),
    bajarZoom: () => setNivelZoom((actual) => Math.max(actual - 1, 0)),
  };
}

export type AyudasCamara = ReturnType<typeof useAyudasCamara>;

type Props = {
  ayudas: AyudasCamara;
};

export function ControlesCamara({ ayudas }: Props) {
  const { linterna, nivelZoom, esZoomMinimo, esZoomMaximo } = ayudas;

  return (
    <View style={estilos.fila}>
      <Pressable
        onPress={ayudas.alternarLinterna}
        style={({ pressed }) => [
          estilos.linterna,
          linterna && estilos.linternaPrendida,
          pressed && estilos.presionado,
        ]}
      >
        <Ionicons
          name={linterna ? "flash" : "flash-outline"}
          size={18}
          color={linterna ? colores.blanco : colores.azulClaro}
        />
        <Text style={[estilos.texto, linterna && estilos.textoPrendida]}>
          Linterna
        </Text>
      </Pressable>

      <View style={estilos.zoom}>
        <Pressable
          onPress={ayudas.bajarZoom}
          disabled={esZoomMinimo}
          hitSlop={8}
          style={({ pressed }) => [
            esZoomMinimo && estilos.apagado,
            pressed && estilos.presionado,
          ]}
        >
          <Ionicons
            name="remove-circle-outline"
            size={30}
            color={colores.azulClaro}
          />
        </Pressable>

        <Text style={estilos.texto}>
          {nivelZoom === 0 ? "Sin zoom" : `Zoom ${nivelZoom}`}
        </Text>

        <Pressable
          onPress={ayudas.subirZoom}
          disabled={esZoomMaximo}
          hitSlop={8}
          style={({ pressed }) => [
            esZoomMaximo && estilos.apagado,
            pressed && estilos.presionado,
          ]}
        >
          <Ionicons
            name="add-circle-outline"
            size={30}
            color={colores.azulClaro}
          />
        </Pressable>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
  },

  linterna: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    paddingVertical: espaciado.sm,
    paddingHorizontal: espaciado.lg,
    borderRadius: radios.pastilla,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.primarioProfundo,
  },

  linternaPrendida: {
    borderColor: colores.primario,
    backgroundColor: colores.primario,
  },

  texto: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.azulPalido,
  },

  textoPrendida: {
    color: colores.blanco,
  },

  zoom: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },

  apagado: {
    opacity: 0.3,
  },

  presionado: {
    opacity: 0.75,
  },
});
