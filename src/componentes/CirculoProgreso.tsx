import type { ReactNode } from "react";
import { StyleSheet, View } from "react-native";

import { colores } from "@/tema/colores";

const RAYITAS = 48;

type Props = {
  valor: number;
  tamanio?: number;
  largo?: number;
  grosor?: number;
  children?: ReactNode;
};

export function CirculoProgreso({
  valor,
  tamanio = 88,
  largo = 9,
  grosor = 3,
  children,
}: Props) {
  const radio = tamanio / 2 - largo / 2;

  const encendidas = Math.round(Math.min(Math.max(valor, 0), 1) * RAYITAS);

  return (
    <View style={{ width: tamanio, height: tamanio }}>
      {Array.from({ length: RAYITAS }, (_, posicion) => (
        <View
          key={`rayita-${posicion}`}
          style={[
            estilos.rayita,
            {
              width: grosor,
              height: largo,
              borderRadius: grosor / 2,
              left: tamanio / 2 - grosor / 2,
              top: tamanio / 2 - largo / 2,
              backgroundColor:
                posicion < encendidas ? colores.primario : colores.pizarra,
              transform: [
                { rotate: `${(360 / RAYITAS) * posicion}deg` },
                { translateY: -radio },
              ],
            },
          ]}
        />
      ))}

      <View style={estilos.centro}>{children}</View>
    </View>
  );
}

const estilos = StyleSheet.create({
  rayita: {
    position: "absolute",
  },

  centro: {
    ...StyleSheet.absoluteFill,
    alignItems: "center",
    justifyContent: "center",
  },
});
