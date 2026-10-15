import { Pressable, StyleSheet, Text, View } from "react-native";

import type { OpcionPregunta } from "@/datos/registro";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  pregunta: string;
  opciones: OpcionPregunta[];
  valor: string | null;
  alElegir: (clave: string) => void;
  error?: string | null;
};

export function OpcionesPregunta({
  pregunta,
  opciones,
  valor,
  alElegir,
  error,
}: Props) {
  return (
    <View style={estilos.contenedor}>
      <Text style={estilos.pregunta}>{pregunta}</Text>

      {opciones.map((opcion) => {
        const elegida = opcion.clave === valor;
        return (
          <Pressable
            key={opcion.clave}
            onPress={() => alElegir(opcion.clave)}
            style={({ pressed }) => [
              estilos.opcion,
              elegida && estilos.opcionElegida,
              pressed && estilos.presionado,
            ]}
          >
            <View style={[estilos.circulo, elegida && estilos.circuloElegido]}>
              {elegida ? <View style={estilos.punto} /> : null}
            </View>
            <Text style={[estilos.etiqueta, elegida && estilos.etiquetaElegida]}>
              {opcion.etiqueta}
            </Text>
          </Pressable>
        );
      })}

      {error ? <Text style={estilos.error}>{error}</Text> : null}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.sm,
  },

  pregunta: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  opcion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  opcionElegida: {
    borderColor: colores.primario,
    backgroundColor: colores.primarioProfundo,
  },

  circulo: {
    width: 20,
    height: 20,
    borderRadius: radios.pastilla,
    borderWidth: 2,
    borderColor: colores.textoDebil,
    alignItems: "center",
    justifyContent: "center",
  },

  circuloElegido: {
    borderColor: colores.azulClaro,
  },

  punto: {
    width: 10,
    height: 10,
    borderRadius: radios.pastilla,
    backgroundColor: colores.azulClaro,
  },

  etiqueta: {
    flex: 1,
    fontSize: 15,
    color: colores.textoSuave,
  },

  etiquetaElegida: {
    fontWeight: "600",
    color: colores.azulPalido,
  },

  error: {
    fontSize: 12,
    color: colores.alerta,
  },

  presionado: {
    opacity: 0.7,
  },
});
