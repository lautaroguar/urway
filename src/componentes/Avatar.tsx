import { StyleSheet, Text, View } from "react-native";

import { colores } from "@/tema/colores";

type Props = {
  nombre: string;
  tamanio?: number;
};

function iniciales(nombre: string): string {
  const palabras = nombre
    .trim()
    .split(/\s+/);
  const elegidas =
    palabras.length === 1
      ? palabras
      : [palabras[0], palabras[palabras.length - 1]];
  return elegidas
    .map((parte) => parte.charAt(0).toUpperCase())
    .join("");
}

export function Avatar({ nombre, tamanio = 44 }: Props) {
  const marco = {
    width: tamanio,
    height: tamanio,
    borderRadius: tamanio / 2,
  };

  return (
    <View style={[estilos.base, marco]}>
      <Text style={[estilos.texto, { fontSize: tamanio * 0.36 }]}>
        {iniciales(nombre)}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  base: {
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colores.bordeVidrio,
    backgroundColor: colores.primarioProfundo,
  },

  texto: {
    fontWeight: "700",
    color: colores.azulClaro,
  },
});
