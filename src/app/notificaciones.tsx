/**
 * ============================================================================
 * app/notificaciones.tsx — Historial de notificaciones (solo visual)
 * ============================================================================
 *
 * QUÉ ES:
 *   Una lista de avisos dividida en dos grupos: "Nuevas" (sin leer, con un
 *   puntito azul) y "Anteriores". Se abre con la campana del header.
 *
 * QUÉ NO HACE:
 *   Es solo para mostrar. Los avisos están escritos a mano en
 *   `datos/notificaciones.ts`; no se pueden tocar ni marcar como leídos, y no
 *   llegan solos (no hay servidor que los envíe).
 *
 * DÓNDE VIVE:
 *   En el Stack raíz, a pantalla completa (con botón de volver).
 *
 * TEORÍA:
 *   [JS 8]  `filter` para separar nuevas de anteriores; `map` para dibujar.
 *   [JS 25] Estado derivado: `nuevas` y `anteriores` se calculan del mismo
 *           array; no se guardan dos listas.
 *   [JS 22] Renderizado condicional (`cond ? <A /> : null`), Fragment y listas
 *           con `key`.
 *   [COMP]  Componente auxiliar (`FilaNotificacion`) para no repetir el dibujo
 *           de cada fila.
 *   [EST]   Colores por tipo de evento (`tema/eventos.ts`), compartidos con la
 *           agenda.
 */
import { Ionicons } from "@expo/vector-icons";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { notificaciones, type Notificacion } from "@/datos/notificaciones";
import { colores, espaciado, radios } from "@/tema/colores";
import { estilosPorTipo } from "@/tema/eventos";

/**
 * Historial de notificaciones. Es solo visual: los avisos están escritos a mano
 * en `datos/notificaciones.ts` y no se pueden tocar ni marcar como leídos.
 */
export default function PantallaNotificaciones() {
  // Se parte la MISMA lista en dos con `filter`. `!aviso.leida` = "no leída".
  const nuevas = notificaciones.filter((aviso) => !aviso.leida);
  const anteriores = notificaciones.filter((aviso) => aviso.leida);

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        {/* Si hay avisos nuevos se muestra su sección; si no, nada (`null`).
            El Fragment `<> </>` agrupa el título y la tarjeta sin agregar una
            vista extra. */}
        {nuevas.length > 0 ? (
          <>
            <Text style={estilos.tituloSeccion}>Nuevas</Text>
            <View style={estilos.grupo}>
              {nuevas.map((aviso, indice) => (
                <FilaNotificacion
                  key={aviso.id}
                  aviso={aviso}
                  // `primera` es true solo para el primero: no lleva línea
                  // separadora arriba.
                  primera={indice === 0}
                />
              ))}
            </View>
          </>
        ) : null}

        {/* Igual para los anteriores. */}
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

// Una fila de la lista. Es un componente PRIVADO de este archivo (sin `export`).
function FilaNotificacion({
  aviso,
  primera,
}: {
  aviso: Notificacion;
  primera: boolean;
}) {
  // Las de calendario usan el color y el ícono de su tipo de evento; las de
  // amistad, el ícono de personas.
  // Si el aviso tiene `tipoEvento` se busca su estilo; si no, queda `null`.
  const estiloEvento = aviso.tipoEvento ? estilosPorTipo[aviso.tipoEvento] : null;

  return (
    // Todas las filas menos la primera llevan una línea arriba (`!primera`).
    <View style={[estilos.fila, !primera && estilos.separador]}>
      {/* Círculo con el ícono. Si hay `estiloEvento`, el fondo toma ese color
          (`estiloEvento && {...}`: si es `null`, no se agrega nada). */}
      <View
        style={[
          estilos.icono,
          estiloEvento && { backgroundColor: estiloEvento.fondo },
        ]}
      >
        <Ionicons
          // Ícono y color según sea un aviso de calendario o de amistad.
          name={estiloEvento ? estiloEvento.icono : "people"}
          size={18}
          color={estiloEvento ? estiloEvento.acento : colores.azulClaro}
        />
      </View>

      {/* Textos: los avisos nuevos van en negrita y con texto más claro. */}
      <View style={estilos.cuerpo}>
        <Text style={[estilos.titulo, !aviso.leida && estilos.tituloNuevo]}>
          {aviso.titulo}
        </Text>
        <Text style={estilos.detalle}>{aviso.detalle}</Text>
        <Text style={estilos.cuando}>{aviso.cuando}</Text>
      </View>

      {/* El puntito azul: aparece solo en los avisos sin leer. */}
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

  // Tarjeta redondeada que agrupa las filas (estilo lista de Ajustes de iOS).
  grupo: {
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    overflow: "hidden",
  },

  // Fila: ícono + textos + punto, alineados ARRIBA (`flex-start`) porque el
  // texto puede ocupar varias líneas.
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

  // Círculo del ícono: 38 de lado y radio 19 (la mitad) = círculo perfecto.
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

  // Se suma al `titulo` cuando el aviso no fue leído: pisa peso y color.
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

  // Puntito de "sin leer": 9 de lado con radio 5 = círculo.
  punto: {
    width: 9,
    height: 9,
    marginTop: 6,
    borderRadius: 5,
    backgroundColor: colores.primario,
  },
});
