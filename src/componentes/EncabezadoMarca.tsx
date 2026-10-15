import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/componentes/Avatar";
import { useSesion } from "@/estado/sesion";
import { colores, espaciado } from "@/tema/colores";
import { nombreCompleto } from "@/utilidades/usuario";

export function MarcaHeader() {
  return (
    <View style={estilos.marca}>
      <Ionicons name="school" size={24} color={colores.azulTenue} />
      <Text style={estilos.nombre}>urway</Text>
    </View>
  );
}

export function AccionesHeader() {
  const router = useRouter();
  const { usuario } = useSesion();

  return (
    <View style={estilos.acciones}>
      <Pressable
        onPress={() => router.push("/notificaciones")}
        hitSlop={8}
        style={({ pressed }) => pressed && estilos.presionado}
      >
        <Ionicons
          name="notifications-outline"
          size={24}
          color={colores.azulTenue}
        />
      </Pressable>

      <Pressable
        onPress={() => router.push("/perfil")}
        hitSlop={8}
        style={({ pressed }) => [estilos.anillo, pressed && estilos.presionado]}
      >
        <Avatar nombre={nombreCompleto(usuario)} tamanio={34} />
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  marca: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    paddingLeft: espaciado.lg,
  },

  nombre: {
    fontSize: 24,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.azulTenue,
  },

  acciones: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingRight: espaciado.lg,
  },

  anillo: {
    padding: 2,
    borderRadius: 999,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  presionado: {
    opacity: 0.6,
  },
});
