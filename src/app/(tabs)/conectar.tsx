/**
 * ============================================================================
 * app/(tabs)/conectar.tsx — Pestaña "Conectar"
 * ============================================================================
 *
 * QUÉ MUESTRA:
 *   1. Un buscador (por compañero, materia o link).
 *   2. Chips de filtro: Todos · Personas · Links oficiales.
 *   3. "Encontrá compañeros": estudiantes que todavía no son mis amigos,
 *      ordenados por cuántas materias comparten conmigo.
 *   4. "Links oficiales de tus materias": Discord, aula virtual, etc.,
 *      agrupados por materia y SOLO de las que estoy cursando.
 *
 * ESTADO (dos `useState` locales):
 *   - `busqueda` → texto del buscador.
 *   - `filtro`   → chip elegido.
 *   Las solicitudes de amistad, en cambio, viven en el Context: las usa
 *   `BotonAmistad` (dentro de `FilaCompaniero`) y también el perfil.
 *
 * LO DERIVADO (se calcula en cada render):
 *   `recomendados`, `linksVisibles`, `materiasConLinks`, `mostrarPersonas`,
 *   `mostrarLinks`.
 *
 * TEORÍA:
 *   [JS 23] Buscador = INPUT CONTROLADO.
 *   [JS 25] Estado derivado: solo `busqueda` y `filtro` son estado.
 *   [JS 7]  Parámetros "rest" (`...campos`) y spread en llamadas y arrays.
 *   [JS 8]  `filter`, `map`, `some`.
 *   [JS 14] `async/await` + `try/catch` al abrir un link.
 *   [JS 22] Renderizado condicional con `cond ? <> ... </> : null`.
 *   [COMP]  `Linking.openURL` y `Alert.alert` (APIs de React Native).
 */
import { Ionicons } from "@expo/vector-icons";
import { useState } from "react";
import {
  Alert,
  Linking,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { ChipsFiltro } from "@/componentes/ChipsFiltro";
import { FilaCompaniero } from "@/componentes/FilaCompaniero";
import { buscarMateria } from "@/datos/carrera";
import {
  estudiantes,
  links,
  type LinkOficial,
  type TipoLink,
} from "@/datos/comunidad";
// Las materias ACTUALES viven en el Context de datos (su estado cambia en el detalle).
import { useDatos } from "@/estado/datos";
import {
  colores,
  espaciado,
  espacioBajoTabs,
  radios,
} from "@/tema/colores";
// `codigosEnCurso(materias)`: los códigos de las materias que se están cursando AHORA.
import { codigosEnCurso } from "@/utilidades/materias";
import { recomendar } from "@/utilidades/recomendaciones";

// Los tres valores posibles del filtro.
type Filtro = "todos" | "personas" | "oficiales";

// Opciones de `ChipsFiltro` ({ clave, etiqueta }).
const FILTROS: { clave: Filtro; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "personas", etiqueta: "Personas" },
  { clave: "oficiales", etiqueta: "Links oficiales" },
];

// Qué ícono corresponde a cada tipo de link. `Record<TipoLink, ...>` obliga a
// tener UNA entrada por cada tipo posible: si se agrega un tipo nuevo y falta
// acá, TypeScript avisa.
const ICONOS_LINK: Record<TipoLink, keyof typeof Ionicons.glyphMap> = {
  discord: "logo-discord",
  whatsapp: "logo-whatsapp",
  campus: "school-outline",
  web: "globe-outline",
  repositorio: "logo-github",
};

export default function PantallaConectar() {
  // Las materias ACTUALES: de las que estoy cursando salen las "en común" con
  // cada compañero (si una pasa a "pendiente de final", deja de contar).
  // `{ materias }` es desestructuración: del objeto del Context se saca solo ese campo.
  const { materias } = useDatos();

  // ESTADO de esta pantalla (local: nadie más lo necesita).
  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  // Todo lo de abajo se calcula en el render a partir de la búsqueda y del filtro.
  // Texto de búsqueda normalizado (sin espacios extremos y en minúsculas).
  const texto = busqueda.trim().toLowerCase();

  // Función auxiliar: ¿alguno de estos campos contiene el texto buscado?
  //   - `...campos` (parámetro REST) junta todos los argumentos en un array:
  //     `coincide("Ana", "CS-302")` → campos = ["Ana", "CS-302"].
  //   - Sin texto, todo coincide.
  //   - `some` devuelve true si AL MENOS UNO cumple la condición.
  const coincide = (...campos: string[]) =>
    texto.length === 0 ||
    campos.some((campo) => campo.toLowerCase().includes(texto));

  // Personas: se recomiendan las que aún no son amigas (`recomendar` las ordena
  // por materias en común) y se filtran por la búsqueda: por nombre o por
  // alguna de sus materias. `...persona.materias` (SPREAD) reparte el array en
  // argumentos sueltos para la función `coincide`.
  // El segundo argumento de `recomendar` son MIS materias de ahora: con eso se
  // calcula cuántas tiene en común cada persona.
  const recomendados = recomendar(estudiantes, codigosEnCurso(materias)).filter(
    (persona) => coincide(persona.nombre, ...persona.materias)
  );

  // Se agrupan por materia para mostrarlos bajo su nombre.
  // Links que coinciden con la búsqueda por título, código o nombre de materia.
  // `buscarMateria(...)?.nombre ?? ""`: el `?.` evita un error si la materia no
  // existe (devuelve `undefined`), y `?? ""` pone un texto vacío en ese caso.
  const linksVisibles = links.filter((link) =>
    coincide(link.titulo, link.materiaId, buscarMateria(link.materiaId)?.nombre ?? "")
  );
  // Los códigos de materia distintos entre esos links (sin repetir, con Set).
  const materiasConLinks = [...new Set(linksVisibles.map((link) => link.materiaId))];

  // ¿Qué secciones se muestran según el chip elegido? "todos" muestra ambas.
  const mostrarPersonas = filtro === "todos" || filtro === "personas";
  const mostrarLinks = filtro === "todos" || filtro === "oficiales";

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <Text style={estilos.titulo}>Conectar</Text>

        {/* ---------- Buscador ---------- */}
        <View style={estilos.buscador}>
          <Ionicons name="search" size={16} color={colores.textoDebil} />
          {/* INPUT CONTROLADO: el estado es la única fuente de verdad. */}
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar compañeros, materias o links"
            placeholderTextColor={colores.textoDebil}
            style={estilos.input}
            returnKeyType="search"
          />
        </View>

        {/* ---------- Filtro ---------- */}
        <ChipsFiltro opciones={FILTROS} valor={filtro} alCambiar={setFiltro} />

        {/* ---------- Sección de personas (según el filtro) ---------- */}
        {mostrarPersonas ? (
          <>
            <Text style={estilos.tituloSeccion}>Encontrá compañeros</Text>

            {recomendados.length === 0 ? (
              <Text style={estilos.textoVacio}>
                Sin compañeros que coincidan.
              </Text>
            ) : (
              recomendados.map((persona) => (
                <FilaCompaniero key={persona.id} companiero={persona} />
              ))
            )}
          </>
        ) : null}

        {/* ---------- Sección de links (según el filtro) ---------- */}
        {mostrarLinks ? (
          <>
            <Text style={estilos.tituloSeccion}>
              Links oficiales de tus materias
            </Text>
            <Text style={estilos.subtituloSeccion}>
              Solo de lo que estás cursando este cuatrimestre.
            </Text>

            {materiasConLinks.length === 0 ? (
              <Text style={estilos.textoVacio}>Sin links que coincidan.</Text>
            ) : (
              // Un bloque por materia, con sus links adentro.
              materiasConLinks.map((materiaId) => (
                <View key={materiaId} style={estilos.grupoLinks}>
                  {/* Cabecera del bloque: código + nombre de la materia. */}
                  <View style={estilos.cabeceraMateria}>
                    <Text style={estilos.codigoMateria}>{materiaId}</Text>
                    <Text style={estilos.nombreMateria} numberOfLines={1}>
                      {buscarMateria(materiaId)?.nombre ?? materiaId}
                    </Text>
                  </View>

                  {/* Los links de ESTA materia (filter dentro del map). */}
                  {linksVisibles
                    .filter((link) => link.materiaId === materiaId)
                    .map((link, indice) => (
                      <FilaLink key={link.id} link={link} primera={indice === 0} />
                    ))}
                </View>
              ))
            )}
          </>
        ) : null}
      </ScrollView>
    </View>
  );
}

// ---------------------------------------------------------------------------
// COMPONENTE AUXILIAR (privado): una fila de link oficial
// ---------------------------------------------------------------------------

function FilaLink({ link, primera }: { link: LinkOficial; primera: boolean }) {
  // Abrir un enlace TARDA y puede FALLAR: por eso es `async` con `try/catch`
  // [JS 14]. `await` espera a que el sistema termine de abrirlo; si algo sale
  // mal, el `catch` muestra un aviso en lugar de romper la app.
  const abrir = async () => {
    try {
      // `Linking.openURL` abre la URL en el navegador del teléfono.
      await Linking.openURL(link.url);
    } catch {
      Alert.alert("No se pudo abrir el link", link.url);
    }
  };

  return (
    <Pressable
      onPress={abrir}
      style={({ pressed }) => [
        estilos.filaLink,
        // Línea separadora arriba de todas las filas menos la primera.
        !primera && estilos.separador,
        pressed && estilos.presionado,
      ]}
    >
      <View style={estilos.iconoLink}>
        <Ionicons
          // Se busca el ícono con el tipo del link como CLAVE del objeto.
          name={ICONOS_LINK[link.tipo]}
          size={18}
          color={colores.azulClaro}
        />
      </View>

      <View style={estilos.textoLink}>
        <Text style={estilos.tituloLink}>{link.titulo}</Text>
        <Text style={estilos.detalleLink} numberOfLines={1}>
          {link.detalle}
        </Text>
      </View>

      {/* Ícono que indica "esto abre algo afuera de la app". */}
      <Ionicons name="open-outline" size={16} color={colores.textoTenue} />
    </Pressable>
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

  // `espacioBajoTabs`: lugar para la barra de tabs flotante.
  contenido: {
    padding: espaciado.lg,
    paddingBottom: espacioBajoTabs,
    gap: espaciado.md,
  },

  titulo: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colores.texto,
  },

  // Caja del buscador: lupa + campo en fila.
  buscador: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    height: 42,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficie,
    paddingHorizontal: espaciado.md,
  },

  input: {
    flex: 1,
    fontSize: 14,
    color: colores.textoSuave,
    padding: 0,
  },

  tituloSeccion: {
    marginTop: espaciado.md,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  // Margen NEGATIVO: acerca el subtítulo a su título (anula el `gap` del contenedor).
  subtituloSeccion: {
    marginTop: -espaciado.sm,
    fontSize: 13,
    color: colores.textoTenue,
  },

  presionado: {
    opacity: 0.7,
  },

  // Un bloque agrupado por materia, al estilo de Ajustes en iOS.
  grupoLinks: {
    overflow: "hidden",
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
  },

  // Franja superior del bloque con el código y el nombre de la materia.
  cabeceraMateria: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.bordeSuave,
    backgroundColor: colores.superficieSuave,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
  },

  codigoMateria: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    color: colores.azulClaro,
  },

  nombreMateria: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colores.textoSecundario,
  },

  // Fila de un link: ícono + textos + ícono de "abrir".
  filaLink: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    padding: espaciado.md,
  },

  separador: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.bordeSuave,
  },

  iconoLink: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radios.sm,
    backgroundColor: colores.primarioProfundo,
  },

  textoLink: {
    flex: 1,
  },

  tituloLink: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.textoSuave,
  },

  detalleLink: {
    marginTop: 2,
    fontSize: 11,
    color: colores.textoTenue,
  },

  textoVacio: {
    fontSize: 13,
    color: colores.textoDebil,
  },
});
