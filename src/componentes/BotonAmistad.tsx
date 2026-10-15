import { Ionicons } from "@expo/vector-icons";
import { Pressable, StyleSheet, Text } from "react-native";

import type { Estudiante } from "@/datos/comunidad";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  estudiante: Estudiante;
  tamanio?: "chico" | "grande";
};

export function BotonAmistad({ estudiante, tamanio = "chico" }: Props) {
  const { solicitudesEnviadas, alternarSolicitud } = useDatos();
  const grande = tamanio === "grande";

  if (estudiante.esAmigo) {
    return <Boton texto="Amigos" icono="people" grande={grande} />;
  }

  if (solicitudesEnviadas.includes(estudiante.id)) {
    return (
      <Boton
        texto="Enviada"
        icono="time-outline"
        grande={grande}
        alTocar={() => alternarSolicitud(estudiante.id)}
      />
    );
  }

  return (
    <Boton
      texto="Agregar"
      icono="person-add-outline"
      primario
      grande={grande}
      alTocar={() => alternarSolicitud(estudiante.id)}
    />
  );
}

function Boton({
  texto,
  icono,
  primario = false,
  grande,
  alTocar,
}: {
  texto: string;
  icono: keyof typeof Ionicons.glyphMap;
  primario?: boolean;
  grande: boolean;
  alTocar?: () => void;
}) {
  const color = primario ? colores.blanco : colores.azulClaro;

  return (
    <Pressable
      onPress={alTocar}
      disabled={!alTocar}
      hitSlop={6}
      style={({ pressed }) => [
        estilos.boton,
        grande && estilos.botonGrande,
        primario && estilos.primario,
        pressed && estilos.presionado,
      ]}
    >
      <Ionicons name={icono} size={grande ? 16 : 14} color={color} />
      <Text style={[estilos.texto, grande && estilos.textoGrande, { color }]}>
        {texto}
      </Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  boton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.xs,
    minWidth: 84,
    minHeight: 30,
    borderRadius: radios.pastilla,
    borderWidth: 1,
    borderColor: colores.borde,
    paddingVertical: 6,
    paddingHorizontal: espaciado.md,
  },

  botonGrande: {
    minWidth: 128,
    minHeight: 40,
    paddingHorizontal: espaciado.lg,
  },

  primario: {
    borderColor: colores.primario,
    backgroundColor: colores.primario,
  },

  presionado: {
    opacity: 0.6,
  },

  texto: {
    fontSize: 12,
    fontWeight: "600",
  },

  textoGrande: {
    fontSize: 15,
  },
});
