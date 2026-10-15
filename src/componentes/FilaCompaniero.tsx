import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/componentes/Avatar";
import { BotonAmistad } from "@/componentes/BotonAmistad";
import type { Recomendacion } from "@/utilidades/recomendaciones";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  companiero: Recomendacion;
};

export function FilaCompaniero({ companiero }: Props) {
  const router = useRouter();
  const { amigos } = companiero;

  return (
    <View style={estilos.fila}>
      <Pressable
        onPress={() => router.push(`/estudiante/${companiero.id}`)}
        style={({ pressed }) => [
          estilos.tocable,
          pressed && estilos.presionado,
        ]}
      >
        <Avatar nombre={companiero.nombre} tamanio={42} />

        <View style={estilos.texto}>
          <Text style={estilos.nombre} numberOfLines={1}>
            {companiero.nombre}
          </Text>
          <Text style={estilos.detalle} numberOfLines={1}>
            {amigos} {amigos === 1 ? "amigo" : "amigos"} ·{" "}
            {companiero.cuatrimestre}º cuatrimestre
          </Text>

          <View style={estilos.materias}>
            {companiero.materias.map((materia) => {
              const comun = companiero.enComun.includes(materia);
              return (
                <Text
                  key={materia}
                  style={[estilos.materia, comun && estilos.materiaComun]}
                >
                  {materia}
                </Text>
              );
            })}
          </View>
        </View>
      </Pressable>

      <BotonAmistad estudiante={companiero} />
    </View>
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
    padding: espaciado.md,
  },

  tocable: {
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  presionado: {
    opacity: 0.7,
  },

  texto: {
    flex: 1,
    gap: 2,
  },

  nombre: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  detalle: {
    fontSize: 12,
    color: colores.textoTenue,
  },

  materias: {
    flexDirection: "row",
    flexWrap: "wrap",
    gap: espaciado.xs,
    marginTop: espaciado.xs,
  },

  materia: {
    overflow: "hidden",
    borderRadius: radios.sm,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    paddingHorizontal: 6,
    paddingVertical: 1,
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.4,
    color: colores.textoTenue,
  },

  materiaComun: {
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.primarioProfundo,
    color: colores.azulClaro,
  },
});
