import { StyleSheet, View } from "react-native";

import { colores, radios } from "@/tema/colores";

type Props = {
  valor: number;
  color?: string;
  alto?: number;
};

export function BarraProgreso({
  valor,
  color = colores.primario,
  alto = 6,
}: Props) {
  const porcentaje = Math.round(Math.min(Math.max(valor, 0), 1) * 100);

  return (
    <View style={[estilos.riel, { height: alto, borderRadius: alto / 2 }]}>
      <View
        style={[
          estilos.relleno,
          {
            width: `${porcentaje}%`,
            backgroundColor: color,
            borderRadius: alto / 2,
          },
        ]}
      />
    </View>
  );
}

const estilos = StyleSheet.create({
  riel: {
    width: "100%",
    overflow: "hidden",
    backgroundColor: colores.pizarra,
    borderRadius: radios.sm,
  },

  relleno: {
    height: "100%",
  },
});
