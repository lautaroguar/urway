import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { etiquetasTipo, type Evento } from "@/datos/agenda";
import { colores, espaciado, radios } from "@/tema/colores";
import { estilosPorTipo } from "@/tema/eventos";
import { desdeClave, etiquetaRelativa } from "@/utilidades/fechas";

type Props = {
  evento: Evento;
  alTocar: () => void;
  mostrarFecha?: boolean;
};

export function FilaEvento({ evento, alTocar, mostrarFecha = false }: Props) {
  const estilo = estilosPorTipo[evento.tipo];

  return (
    <Pressable
      onPress={alTocar}
      style={({ pressed }) => [estilos.fila, pressed && estilos.presionada]}
    >
      <View style={[estilos.barra, { backgroundColor: estilo.acento }]} />

      <View style={estilos.texto}>
        <Text style={estilos.titulo} numberOfLines={1}>
          {evento.titulo}
        </Text>

        <Text style={estilos.detalle} numberOfLines={1}>
          {mostrarFecha
            ? `${etiquetaRelativa(desdeClave(evento.fecha))} · ${evento.desde}`
            : `${evento.desde} - ${evento.hasta}`}
          {evento.lugar ? ` · ${evento.lugar}` : ""}
        </Text>
      </View>

      <View style={[estilos.etiquetaTipo, { borderColor: estilo.borde }]}>
        <Text style={[estilos.textoTipo, { color: estilo.acento }]}>
          {etiquetasTipo[evento.tipo]}
        </Text>
      </View>

      <Ionicons name="chevron-forward" size={16} color={colores.textoDebil} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.md,
  },

  presionada: {
    opacity: 0.7,
  },

  barra: {
    width: 3,
    alignSelf: "stretch",
    borderRadius: 2,
  },

  texto: {
    flex: 1,
  },

  titulo: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  detalle: {
    marginTop: 3,
    fontSize: 12,
    color: colores.textoTenue,
  },

  etiquetaTipo: {
    borderRadius: radios.pastilla,
    borderWidth: 1,
    paddingVertical: 3,
    paddingHorizontal: espaciado.sm,
  },

  textoTipo: {
    fontSize: 10,
    fontWeight: "700",
  },
});
