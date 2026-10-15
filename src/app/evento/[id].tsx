import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Tarjeta } from "@/componentes/Tarjeta";
import { etiquetasTipo } from "@/datos/agenda";
import { buscarMateria } from "@/datos/carrera";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import { estilosPorTipo } from "@/tema/eventos";
import { desdeClave, duracion, etiquetaDiaLargo } from "@/utilidades/fechas";

export default function PantallaEvento() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  const { eventos, eliminarEvento } = useDatos();

  const evento = eventos.find((candidato) => candidato.id === id);

  if (!evento) {
    return (
      <View style={[estilos.pantalla, estilos.vacio]}>
        <Ionicons
          name="calendar-outline"
          size={32}
          color={colores.textoDebil}
        />
        <Text style={estilos.textoVacio}>
          Este evento ya no existe. Puede que lo hayas eliminado.
        </Text>
      </View>
    );
  }

  const estilo = estilosPorTipo[evento.tipo];
  const materia = evento.materiaId ? buscarMateria(evento.materiaId) : undefined;

  const borrar = () => {
    eliminarEvento(evento.id);
    router.back();
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={[estilos.insignia, { backgroundColor: estilo.fondo }]}>
          <Ionicons name={estilo.icono} size={22} color={estilo.acento} />
        </View>

        <Text style={estilos.titulo}>{evento.titulo}</Text>
        <Text style={[estilos.tipo, { color: estilo.acento }]}>
          {etiquetasTipo[evento.tipo]}
        </Text>

        <Tarjeta style={estilos.tarjeta}>
          <Dato
            icono="calendar-outline"
            rotulo="Fecha"
            valor={etiquetaDiaLargo(desdeClave(evento.fecha))}
          />
          <View style={estilos.separador} />
          <Dato
            icono="time-outline"
            rotulo="Horario"
            valor={`${evento.desde} - ${evento.hasta} · ${duracion(
              evento.desde,
              evento.hasta
            )}`}
          />
          {evento.lugar ? (
            <>
              <View style={estilos.separador} />
              <Dato
                icono="location-outline"
                rotulo="Lugar"
                valor={evento.lugar}
              />
            </>
          ) : null}
          {materia ? (
            <>
              <View style={estilos.separador} />
              <Dato
                icono="book-outline"
                rotulo="Materia"
                valor={`${materia.id} · ${materia.nombre}`}
              />
            </>
          ) : null}
        </Tarjeta>

        {evento.notas ? (
          <>
            <Text style={estilos.tituloSeccion}>Notas</Text>
            <Tarjeta>
              <Text style={estilos.notas}>{evento.notas}</Text>
            </Tarjeta>
          </>
        ) : null}

        <Pressable
          onPress={borrar}
          style={({ pressed }) => [
            estilos.botonBorrar,
            pressed && estilos.presionado,
          ]}
        >
          <Ionicons name="trash-outline" size={18} color={colores.alerta} />
          <Text style={estilos.textoBorrar}>Eliminar evento</Text>
        </Pressable>
      </ScrollView>
    </View>
  );
}

type PropsDato = {
  icono: keyof typeof Ionicons.glyphMap;
  rotulo: string;
  valor: string;
};

function Dato({ icono, rotulo, valor }: PropsDato) {
  return (
    <View style={estilos.dato}>
      <Ionicons name={icono} size={18} color={colores.textoTenue} />
      <View style={estilos.textoDato}>
        <Text style={estilos.rotulo}>{rotulo}</Text>
        <Text style={estilos.valor}>{valor}</Text>
      </View>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  scroll: {
    flex: 1,
  },

  contenido: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.md,
  },

  insignia: {
    width: 52,
    height: 52,
    borderRadius: radios.lg,
    alignItems: "center",
    justifyContent: "center",
  },

  titulo: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colores.texto,
  },

  tipo: {
    marginTop: -espaciado.sm,
    fontSize: 13,
    fontWeight: "600",
  },

  tarjeta: {
    gap: espaciado.md,
  },

  separador: {
    height: StyleSheet.hairlineWidth,
    backgroundColor: colores.bordeSuave,
  },

  dato: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  textoDato: {
    flex: 1,
  },

  rotulo: {
    fontSize: 11,
    color: colores.textoTenue,
  },

  valor: {
    marginTop: 2,
    fontSize: 15,
    color: colores.textoSuave,
  },

  tituloSeccion: {
    marginTop: espaciado.sm,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  notas: {
    fontSize: 14,
    lineHeight: 21,
    color: colores.textoSecundario,
  },

  botonBorrar: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
    marginTop: espaciado.sm,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    paddingVertical: espaciado.md + 2,
  },

  textoBorrar: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.alerta,
  },

  presionado: {
    opacity: 0.7,
  },

  vacio: {
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.md,
    padding: espaciado.xl,
  },

  textoVacio: {
    fontSize: 13,
    textAlign: "center",
    color: colores.textoDebil,
  },
});
