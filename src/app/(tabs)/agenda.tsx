/**
 * ============================================================================
 * app/(tabs)/agenda.tsx — Pestaña "Agenda"
 * ============================================================================
 *
 * QUÉ MUESTRA:
 *   Todos los eventos, AGRUPADOS POR DÍA y ordenados del más próximo al más
 *   lejano. Cada día es una "sección" con su título ("Hoy", "Mañana", "jue 2
 *   oct"...) y debajo sus eventos. Arriba a la derecha hay un botón "+" que abre
 *   el formulario para crear un evento.
 *
 * POR QUÉ UNA `SectionList`:
 *   Es el componente de React Native pensado para listas con secciones. La
 *   agenda es exactamente eso: una lista agrupada por día. Además dibuja solo
 *   lo que se ve en pantalla, aunque hoy tenga pocos eventos.
 *
 * DE DÓNDE SALEN LOS DATOS:
 *   De `useDatos()` (Context). Al crear o borrar un evento, la lista se
 *   actualiza sola. Las secciones NO se guardan en un estado: se ARMAN en cada
 *   render a partir de los eventos.
 *
 * TEORÍA:
 *   [COMP]  `SectionList`: `sections`, `renderItem`, `renderSectionHeader`,
 *           `keyExtractor`, `ListHeaderComponent`, `ListEmptyComponent`,
 *           `ItemSeparatorComponent`.
 *   [JS 25] Estado derivado: `ordenados`, `fechas` y `secciones`.
 *   [JS 9]  Inmutabilidad: se COPIA el array con `[...eventos]` antes de ordenar
 *           (porque `sort` modifica el array que recibe).
 *   [JS 7]  Spread `[...x]` y `[...new Set(x)]`.
 *   [NAV]   `router.push` a `/evento/[id]` y a `/evento/nuevo`.
 */
import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, SectionList, StyleSheet, Text, View } from "react-native";

import { FilaEvento } from "@/componentes/FilaEvento";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, espacioBajoTabs } from "@/tema/colores";
import { desdeClave, etiquetaRelativa } from "@/utilidades/fechas";

/**
 * Agenda: los eventos agrupados por día, del más próximo al más lejano. Es una
 * `SectionList`: cada día es una sección con su título y sus eventos.
 */
export default function PantallaAgenda() {
  const router = useRouter();
  const { eventos } = useDatos();

  // Se arma en el render: primero ordenados por fecha y hora, después un grupo
  // por cada fecha distinta.
  //
  // PASO 1 — Ordenar. `[...eventos]` hace una COPIA (spread): `sort` modifica el
  // array sobre el que se llama, y no se debe modificar la lista del Context.
  // Se ordena por el texto "AAAA-MM-DD HH:MM" (así fecha y hora se comparan juntas).
  const ordenados = [...eventos].sort((a, b) =>
    `${a.fecha} ${a.desde}`.localeCompare(`${b.fecha} ${b.desde}`)
  );
  // PASO 2 — Fechas distintas. `map` saca la fecha de cada evento; `new Set`
  // elimina los repetidos; `[...]` lo vuelve array. Como ya estaban ordenados,
  // las fechas quedan en orden.
  const fechas = [...new Set(ordenados.map((evento) => evento.fecha))];
  // PASO 3 — Un objeto por fecha con la forma que pide `SectionList`:
  //   { fecha: "2026-09-29", data: [ ...eventos de ese día ] }
  // `data` es la única clave obligatoria; `fecha` es libre y se usa en el
  // encabezado de la sección.
  const secciones = fechas.map((fecha) => ({
    fecha,
    data: ordenados.filter((evento) => evento.fecha === fecha),
  }));

  return (
    <View style={estilos.pantalla}>
      <SectionList
        // Las secciones armadas arriba.
        sections={secciones}
        // Cómo sacar una `key` estable de cada elemento: su id.
        keyExtractor={(evento) => evento.id}
        // Cómo dibujar UN evento (`item`). Se reutiliza `FilaEvento`.
        renderItem={({ item }) => (
          <FilaEvento
            evento={item}
            alTocar={() => router.push(`/evento/${item.id}`)}
          />
        )}
        // Cómo dibujar el título de cada sección: "Hoy", "Mañana" o el día.
        renderSectionHeader={({ section }) => (
          <Text style={estilos.tituloDia}>
            {etiquetaRelativa(desdeClave(section.fecha))}
          </Text>
        )}
        // Los títulos de día NO se quedan pegados arriba al desplazarse.
        stickySectionHeadersEnabled={false}
        showsVerticalScrollIndicator={false}
        // Estilo del contenido interno (con el margen inferior para la tab bar).
        contentContainerStyle={estilos.contenido}
        // Componente que se dibuja ENTRE cada par de eventos.
        ItemSeparatorComponent={Separador}
        // Encabezado de toda la lista: el título "Agenda" y el botón "+".
        ListHeaderComponent={
          <View style={estilos.cabecera}>
            <Text style={estilos.titulo}>Agenda</Text>
            <Pressable
              onPress={() => router.push("/evento/nuevo")}
              hitSlop={8}
              style={estilos.botonMas}
            >
              <Ionicons name="add" size={20} color={colores.blanco} />
            </Pressable>
          </View>
        }
        // Lo que se muestra cuando no hay ningún evento (ESTADO VACÍO).
        ListEmptyComponent={
          <View style={estilos.vacio}>
            <Ionicons
              name="calendar-outline"
              size={28}
              color={colores.textoDebil}
            />
            <Text style={estilos.textoVacio}>
              No hay eventos. Tocá + para agregar uno.
            </Text>
          </View>
        }
      />
    </View>
  );
}

// El separador entre eventos: un espacio vacío de 8 dp. Es un componente para
// poder pasarlo a `ItemSeparatorComponent`.
function Separador() {
  return <View style={estilos.separador} />;
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  // `paddingBottom: espacioBajoTabs`: lugar para la barra de tabs flotante.
  contenido: {
    padding: espaciado.lg,
    paddingBottom: espacioBajoTabs,
  },

  // Título a la izquierda y botón "+" a la derecha.
  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    marginBottom: espaciado.sm,
  },

  titulo: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colores.texto,
  },

  // Botón "+" circular (32 de lado y radio 16).
  botonMas: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.primario,
  },

  // Título de cada día ("Hoy", "Mañana"...).
  tituloDia: {
    marginTop: espaciado.lg,
    marginBottom: espaciado.sm,
    fontSize: 18,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  separador: {
    height: espaciado.sm,
  },

  vacio: {
    alignItems: "center",
    gap: espaciado.sm,
    paddingVertical: espaciado.xxl,
  },

  textoVacio: {
    fontSize: 13,
    color: colores.textoDebil,
  },
});
