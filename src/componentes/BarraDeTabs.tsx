import { Ionicons } from "@expo/vector-icons";
import { BlurView } from "expo-blur";
import type { BottomTabBarProps } from "expo-router/js-tabs";
import { Pressable, StyleSheet, Text, View } from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";

import {
  barraTabs,
  colores,
  espaciado,
  radios,
  sombraFlotante,
} from "@/tema/colores";

type NombreIcono = keyof typeof Ionicons.glyphMap;

type DefinicionTab = {
  nombre: string;
  etiqueta: string;
  icono: NombreIcono;
  iconoActivo: NombreIcono;
};

const TABS: DefinicionTab[] = [
  {
    nombre: "inicio",
    etiqueta: "Inicio",
    icono: "home-outline",
    iconoActivo: "home",
  },
  {
    nombre: "plan",
    etiqueta: "Plan",
    icono: "book-outline",
    iconoActivo: "book",
  },
  {
    nombre: "agenda",
    etiqueta: "Agenda",
    icono: "calendar-outline",
    iconoActivo: "calendar",
  },
  {
    nombre: "conectar",
    etiqueta: "Conectar",
    icono: "people-outline",
    iconoActivo: "people",
  },
];

export function BarraDeTabs({ state, navigation }: BottomTabBarProps) {
  const margenes = useSafeAreaInsets();

  return (
    <View
      style={[
        estilos.contenedor,
        {
          bottom: Math.max(
            margenes.bottom + barraTabs.margenInferior,
            barraTabs.margenMinimo
          ),
        },
      ]}
    >
      <BlurView intensity={36} tint="dark" style={StyleSheet.absoluteFill} />
      <View style={[StyleSheet.absoluteFill, estilos.velo]} />

      {state.routes.map((ruta, indice) => {
        const definicion = TABS.find((tab) => tab.nombre === ruta.name);
        if (!definicion) {
          return null;
        }

        const activa = state.index === indice;

        const alPresionar = () => {
          const evento = navigation.emit({
            type: "tabPress",
            target: ruta.key,
            canPreventDefault: true,
          });

          if (!activa && !evento.defaultPrevented) {
            navigation.navigate(ruta.name);
          }
        };

        return (
          <Pressable
            key={ruta.key}
            onPress={alPresionar}
            style={estilos.celda}
          >
            <View style={[estilos.pastilla, activa && estilos.pastillaActiva]}>
              <Ionicons
                name={activa ? definicion.iconoActivo : definicion.icono}
                size={19}
                color={activa ? colores.blanco : colores.textoTenue}
              />
              <Text
                style={[estilos.etiqueta, activa && estilos.etiquetaActiva]}
                numberOfLines={1}
              >
                {definicion.etiqueta}
              </Text>
            </View>
          </Pressable>
        );
      })}
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    position: "absolute",
    left: barraTabs.margenLateral,
    right: barraTabs.margenLateral,
    height: barraTabs.alto,
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: espaciado.xs,
    borderRadius: barraTabs.alto / 2,
    borderWidth: 1,
    borderColor: colores.bordeVidrio,
    overflow: "hidden",
    ...sombraFlotante,
  },

  velo: {
    backgroundColor: colores.velo,
  },

  celda: {
    flex: 1,
    alignItems: "center",
  },

  pastilla: {
    alignItems: "center",
    justifyContent: "center",
    gap: 1,
    minWidth: 68,
    borderRadius: radios.xl,
    paddingVertical: espaciado.sm,
  },

  pastillaActiva: {
    backgroundColor: colores.primario,
  },

  etiqueta: {
    fontSize: 10,
    fontWeight: "600",
    color: colores.textoTenue,
  },

  etiquetaActiva: {
    color: colores.blanco,
  },
});
