import { Pressable, StyleSheet, Text, View } from "react-native";

import { colores, espaciado, radios } from "@/tema/colores";

export type OpcionChip<T extends string> = {
  clave: T;
  etiqueta: string;
};

type Props<T extends string> = {
  opciones: OpcionChip<T>[];
  valor: T;
  alCambiar: (clave: T) => void;
};

export function ChipsFiltro<T extends string>({
  opciones,
  valor,
  alCambiar,
}: Props<T>) {
  return (
    <View style={estilos.fila}>
      {opciones.map((opcion) => {
        const activo = opcion.clave === valor;

        return (
          <Pressable
            key={opcion.clave}
            onPress={() => alCambiar(opcion.clave)}
            style={({ pressed }) => [
              estilos.chip,
              activo && estilos.chipActivo,
              pressed && estilos.chipPresionado,
            ]}
          >
            <Text style={[estilos.texto, activo && estilos.textoActivo]}>
              {opcion.etiqueta}
            </Text>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.sm,
  },

  chip: {
    borderRadius: radios.pastilla,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficie,
    paddingVertical: 7,
    paddingHorizontal: espaciado.md,
  },

  chipActivo: {
    borderColor: colores.primario,
    backgroundColor: colores.primario,
  },

  chipPresionado: {
    opacity: 0.65,
  },

  texto: {
    fontSize: 13,
    color: colores.textoTenue,
  },

  textoActivo: {
    color: colores.blanco,
    fontWeight: "600",
  },
});
