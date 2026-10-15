import { Ionicons } from "@expo/vector-icons";
import { StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  texto: string;
  color?: string;
  fondo?: string;
  icono?: keyof typeof Ionicons.glyphMap;
};

export function Etiqueta({
  texto,
  color = colores.azulClaro,
  fondo = colores.primarioProfundo,
  icono,
}: Props) {
  return (
    <View style={[estilos.etiqueta, { backgroundColor: fondo }]}>
      {icono ? <Ionicons name={icono} size={11} color={color} /> : null}
      <Text style={[estilos.texto, { color }]}>{texto}</Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  etiqueta: {
    flexDirection: "row",
    alignItems: "center",
    alignSelf: "flex-start",
    gap: espaciado.xs,
    borderRadius: radios.pastilla,
    paddingVertical: 4,
    paddingHorizontal: espaciado.sm,
  },

  texto: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.4,
    textTransform: "uppercase",
  },
});
