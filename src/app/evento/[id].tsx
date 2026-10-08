/**
 * ============================================================================
 * app/evento/[id].tsx — Detalle de un evento
 * ============================================================================
 *
 * QUÉ ES:
 *   Una ficha de SOLO LECTURA de un evento: ícono y color según el tipo,
 *   título, fecha, horario y duración, lugar, materia y notas, más un botón
 *   "Eliminar evento".
 *
 * RUTA DINÁMICA:
 *   `[id]` en el nombre del archivo = valor variable (`/evento/ev-1`,
 *   `/evento/ev-1727640000000`...). Se abre desde Inicio y desde Agenda, y como
 *   vive en el Stack raíz, sirve para las dos con un único archivo.
 *
 * DE DÓNDE SALE EL EVENTO:
 *   Se busca en la lista del Context (`useDatos().eventos`) por su id. NO está
 *   en un estado local: por eso, si se elimina, desaparece de todas partes.
 *
 * TEORÍA:
 *   [NAV]   `useLocalSearchParams` (parámetros de ruta) y `router.back()`
 *           (volver a la pantalla anterior).
 *   [JS 29] Se lee y se modifica el Context (`eventos`, `eliminarEvento`).
 *   [JS 22] Renderizado condicional: retorno temprano si no existe, y bloques
 *           que aparecen solo si hay dato (lugar, materia, notas).
 *   [JS 24] Regla de los hooks: todos se llaman antes del `return` condicional.
 *   [JS 8]  `find` para buscar un elemento en la lista.
 */
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

/** Ficha de solo lectura de un evento, con la opción de eliminarlo. */
export default function PantallaEvento() {
  // El `id` de la ruta ("/evento/ev-3" → "ev-3").
  const { id } = useLocalSearchParams<{ id: string }>();
  const router = useRouter();
  // Del Context: la lista de eventos y la acción de eliminar.
  const { eventos, eliminarEvento } = useDatos();

  // `find` devuelve el primer evento cuyo id coincide, o `undefined` si no hay.
  const evento = eventos.find((candidato) => candidato.id === id);

  // Si no existe (por ejemplo, ya se eliminó), se muestra un aviso y se corta.
  // Todos los hooks se llamaron ARRIBA de este `return`. Después de este `if`,
  // TypeScript sabe que `evento` no es `undefined`.
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

  // Colores e ícono según el tipo de evento (`tema/eventos.ts`).
  const estilo = estilosPorTipo[evento.tipo];
  // La materia del evento, si tiene. `materiaId` es opcional: se pregunta antes
  // de buscarla, y si no hay se usa `undefined`.
  const materia = evento.materiaId ? buscarMateria(evento.materiaId) : undefined;

  // Elimina el evento del Context y vuelve a la pantalla anterior
  // (Inicio o Agenda).
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
        {/* Insignia: cuadrado con el ícono del tipo y su color de fondo. El
            color va inline porque depende del tipo de evento. */}
        <View style={[estilos.insignia, { backgroundColor: estilo.fondo }]}>
          <Ionicons name={estilo.icono} size={22} color={estilo.acento} />
        </View>

        <Text style={estilos.titulo}>{evento.titulo}</Text>
        <Text style={[estilos.tipo, { color: estilo.acento }]}>
          {etiquetasTipo[evento.tipo]}
        </Text>

        {/* ---------- Tarjeta con los datos ---------- */}
        <Tarjeta style={estilos.tarjeta}>
          <Dato
            icono="calendar-outline"
            rotulo="Fecha"
            // "AAAA-MM-DD" → Date → "jueves 2 de octubre".
            valor={etiquetaDiaLargo(desdeClave(evento.fecha))}
          />
          <View style={estilos.separador} />
          <Dato
            icono="time-outline"
            rotulo="Horario"
            // Por ejemplo: "14:00 - 16:00 · 2 h". `duracion` calcula la diferencia.
            valor={`${evento.desde} - ${evento.hasta} · ${duracion(
              evento.desde,
              evento.hasta
            )}`}
          />
          {/* El lugar solo se muestra si el evento tiene (texto no vacío). El
              Fragment `<> </>` agrupa la línea separadora y el dato. */}
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
          {/* La materia solo si el evento pertenece a una que exista. */}
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

        {/* Las notas solo aparecen si el evento tiene. */}
        {evento.notas ? (
          <>
            <Text style={estilos.tituloSeccion}>Notas</Text>
            <Tarjeta>
              <Text style={estilos.notas}>{evento.notas}</Text>
            </Tarjeta>
          </>
        ) : null}

        {/* ---------- Botón para eliminar ---------- */}
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

// ---------------------------------------------------------------------------
// COMPONENTE AUXILIAR (privado): una fila "ícono + rótulo + valor"
// ---------------------------------------------------------------------------

type PropsDato = {
  icono: keyof typeof Ionicons.glyphMap;
  rotulo: string; // la etiqueta chica ("Fecha")
  valor: string; // el dato ("jueves 2 de octubre")
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

  // Cuadrado redondeado de 52 con el ícono centrado.
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

  // Margen negativo para acercarlo al título (compensa el `gap`).
  tipo: {
    marginTop: -espaciado.sm,
    fontSize: 13,
    fontWeight: "600",
  },

  tarjeta: {
    gap: espaciado.md,
  },

  // Línea horizontal fina entre datos.
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

  // Pantalla centrada para el caso "el evento no existe".
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
