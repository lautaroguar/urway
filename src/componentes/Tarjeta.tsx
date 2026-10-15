import type { ReactNode } from "react";
import { StyleSheet, View, type StyleProp, type ViewStyle } from "react-native";

import { colores, espaciado, radios, sombraTarjeta } from "@/tema/colores";

type Props = {
  children: ReactNode;
  style?: StyleProp<ViewStyle>;
};

export function Tarjeta({ children, style }: Props) {
  return <View style={[estilos.tarjeta, style]}>{children}</View>;
}

const estilos = StyleSheet.create({
  tarjeta: {
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    padding: espaciado.lg,
    ...sombraTarjeta,
  },
});
