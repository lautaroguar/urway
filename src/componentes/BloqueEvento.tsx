import { Pressable, StyleSheet, Text, View } from "react-native";

import type { Evento } from "@/datos/agenda";
import { colores, radios } from "@/tema/colores";
import { estilosPorTipo } from "@/tema/eventos";
import {
  ALTO_MINIMO_BLOQUE,
  distanciaDesdeArriba,
} from "@/utilidades/calendario";
import { aMinutos } from "@/utilidades/fechas";

const ALTO_LINEA = 12;
const RELLENO_VERTICAL = 3;

type Props = {
  evento: Evento;
  columna: number;
  columnas: number;
  horaInicio: number;
  alTocar: () => void;
};

export function BloqueEvento({
  evento,
  columna,
  columnas,
  horaInicio,
  alTocar,
}: Props) {
  const estilo = estilosPorTipo[evento.tipo];

  const top = distanciaDesdeArriba(aMinutos(evento.desde), horaInicio);
  const fin = distanciaDesdeArriba(aMinutos(evento.hasta), horaInicio);
  const alto = Math.max(fin - top, ALTO_MINIMO_BLOQUE);

  const lineas = Math.max(
    1,
    Math.floor((alto - RELLENO_VERTICAL * 2) / ALTO_LINEA)
  );

  const mostrarTitulo = columnas === 1;

  return (
    <Pressable
      onPress={alTocar}
      style={({ pressed }) => [
        estilos.posicion,
        {
          top,
          height: alto,
          left: `${(columna / columnas) * 100}%`,
          width: `${100 / columnas}%`,
        },
        pressed && estilos.presionado,
      ]}
    >
      <View
        style={[
          estilos.bloque,
          { backgroundColor: estilo.fondo, borderLeftColor: estilo.acento },
        ]}
      >
        {mostrarTitulo ? (
          <Text style={estilos.titulo} numberOfLines={lineas}>
            {evento.titulo}
          </Text>
        ) : null}
      </View>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  posicion: {
    position: "absolute",
    padding: 1,
  },

  presionado: {
    opacity: 0.7,
  },

  bloque: {
    flex: 1,
    overflow: "hidden",
    borderRadius: radios.sm - 2,
    borderLeftWidth: 2,
    paddingVertical: RELLENO_VERTICAL,
    paddingHorizontal: 3,
  },

  titulo: {
    fontSize: 10,
    lineHeight: ALTO_LINEA,
    fontWeight: "600",
    color: colores.texto,
  },
});
