import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { notificaciones, type Notificacion } from "@/datos/notificaciones";
import { colores, espaciado, radios } from "@/tema/colores";
import { estilosPorTipo } from "@/tema/eventos";

export default function PantallaNotificaciones() {
  const nuevas = notificaciones.filter((aviso) => !aviso.leida);
  const anteriores = notificaciones.filter((aviso) => aviso.leida);

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        {nuevas.length > 0 ? (
          <>
            <Text style={estilos.tituloSeccion}>Nuevas</Text>
            <View style={estilos.grupo}>
              {nuevas.map((aviso, indice) => (
                <FilaNotificacion
                  key={aviso.id}
                  aviso={aviso}
                  primera={indice === 0}
                />
              ))}
            </View>
          </>
        ) : null}

        {anteriores.length > 0 ? (
          <>
            <Text style={estilos.tituloSeccion}>Anteriores</Text>
            <View style={estilos.grupo}>
              {anteriores.map((aviso, indice) => (
                <FilaNotificacion
                  key={aviso.id}
                  aviso={aviso}
                  primera={indice === 0}
                />
              ))}
            </View>
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

function FilaNotificacion({
  aviso,
  primera,
}: {
  aviso: Notificacion;
  primera: boolean;
}) {
  const estiloEvento = aviso.tipoEvento ? estilosPorTipo[aviso.tipoEvento] : null;

  return (
    <View style={[estilos.fila, !primera && estilos.separador]}>
      <View
        style={[
          estilos.icono,
          estiloEvento && { backgroundColor: estiloEvento.fondo },
        ]}
      >
        <Ionicons
          name={estiloEvento ? estiloEvento.icono : "people"}
          size={18}
          color={estiloEvento ? estiloEvento.acento : colores.azulClaro}
        />
      </View>

      <View style={estilos.cuerpo}>
        <Text style={[estilos.titulo, !aviso.leida && estilos.tituloNuevo]}>
          {aviso.titulo}
        </Text>
        <Text style={estilos.detalle}>{aviso.detalle}</Text>
        <Text style={estilos.cuando}>{aviso.cuando}</Text>
      </View>

      {!aviso.leida ? <View style={estilos.punto} /> : null}
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
    paddingHorizontal: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.md,
  },

  tituloSeccion: {
    marginTop: espaciado.sm,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  grupo: {
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    overflow: "hidden",
  },

  fila: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado.md,
    padding: espaciado.md,
  },

  separador: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.bordeSuave,
  },

  icono: {
    width: 38,
    height: 38,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: 19,
    backgroundColor: colores.primarioProfundo,
  },

  cuerpo: {
    flex: 1,
    gap: 2,
  },

  titulo: {
    fontSize: 14,
    fontWeight: "500",
    color: colores.textoSecundario,
  },

  tituloNuevo: {
    fontWeight: "700",
    color: colores.texto,
  },

  detalle: {
    fontSize: 12,
    color: colores.textoTenue,
  },

  cuando: {
    marginTop: 2,
    fontSize: 11,
    color: colores.textoDebil,
  },

  punto: {
    width: 9,
    height: 9,
    marginTop: 6,
    borderRadius: 5,
    backgroundColor: colores.primario,
  },
});
