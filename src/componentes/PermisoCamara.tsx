import { Ionicons } from "@expo/vector-icons";
import { useCameraPermissions } from "expo-camera";
import type { ReactNode } from "react";
import { Linking, Pressable, StyleSheet, Text } from "react-native";

import { Tarjeta } from "@/componentes/Tarjeta";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  mensaje: string;
  children: ReactNode;
};

export function PermisoCamara({ mensaje, children }: Props) {
  const [permiso, pedirPermiso] = useCameraPermissions();

  if (!permiso) {
    return (
      <Tarjeta style={estilos.aviso}>
        <Text style={estilos.texto}>Consultando permisos de la cámara…</Text>
      </Tarjeta>
    );
  }

  if (!permiso.granted) {
    return (
      <Tarjeta style={estilos.aviso}>
        <Ionicons name="camera-outline" size={28} color={colores.azulClaro} />
        <Text style={estilos.texto}>{mensaje}</Text>
        {permiso.canAskAgain ? (
          <Pressable
            onPress={pedirPermiso}
            style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
          >
            <Text style={estilos.textoBoton}>Dar permiso</Text>
          </Pressable>
        ) : (
          <>
            <Text style={estilos.textoTenue}>
              El permiso fue denegado. Habilitalo desde los ajustes del teléfono.
            </Text>
            <Pressable
              onPress={() => Linking.openSettings()}
              style={({ pressed }) => [
                estilos.botonSecundario,
                pressed && estilos.presionado,
              ]}
            >
              <Text style={estilos.textoBotonSecundario}>Abrir ajustes</Text>
            </Pressable>
          </>
        )}
      </Tarjeta>
    );
  }

  return <>{children}</>;
}

const estilos = StyleSheet.create({
  aviso: {
    alignItems: "center",
    gap: espaciado.md,
  },

  texto: {
    fontSize: 14,
    lineHeight: 20,
    textAlign: "center",
    color: colores.textoSuave,
  },

  textoTenue: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: colores.textoTenue,
  },

  boton: {
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    paddingHorizontal: espaciado.xl,
    borderRadius: radios.lg,
    backgroundColor: colores.primario,
  },

  textoBoton: {
    fontSize: 15,
    fontWeight: "700",
    color: colores.blanco,
  },

  botonSecundario: {
    alignItems: "center",
    justifyContent: "center",
    height: 46,
    paddingHorizontal: espaciado.xl,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  textoBotonSecundario: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  presionado: {
    opacity: 0.75,
  },
});
