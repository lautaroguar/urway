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
import { useDatos } from "@/estado/datos";
import {
  colores,
  espaciado,
  espacioBajoTabs,
  radios,
} from "@/tema/colores";
import { codigosEnCurso } from "@/utilidades/materias";
import { recomendar } from "@/utilidades/recomendaciones";

type Filtro = "todos" | "personas" | "oficiales";

const FILTROS: { clave: Filtro; etiqueta: string }[] = [
  { clave: "todos", etiqueta: "Todos" },
  { clave: "personas", etiqueta: "Personas" },
  { clave: "oficiales", etiqueta: "Links oficiales" },
];

const ICONOS_LINK: Record<TipoLink, keyof typeof Ionicons.glyphMap> = {
  discord: "logo-discord",
  whatsapp: "logo-whatsapp",
  campus: "school-outline",
  web: "globe-outline",
  repositorio: "logo-github",
};

export default function PantallaConectar() {
  const { materias } = useDatos();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todos");

  const texto = busqueda.trim().toLowerCase();

  const coincide = (...campos: string[]) =>
    texto.length === 0 ||
    campos.some((campo) => campo.toLowerCase().includes(texto));

  const recomendados = recomendar(estudiantes, codigosEnCurso(materias)).filter(
    (persona) => coincide(persona.nombre, ...persona.materias)
  );

  const linksVisibles = links.filter((link) =>
    coincide(link.titulo, link.materiaId, buscarMateria(link.materiaId)?.nombre ?? "")
  );
  const materiasConLinks = [...new Set(linksVisibles.map((link) => link.materiaId))];

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

        <View style={estilos.buscador}>
          <Ionicons name="search" size={16} color={colores.textoDebil} />
          <TextInput
            value={busqueda}
            onChangeText={setBusqueda}
            placeholder="Buscar compañeros, materias o links"
            placeholderTextColor={colores.textoDebil}
            style={estilos.input}
            returnKeyType="search"
          />
        </View>

        <ChipsFiltro opciones={FILTROS} valor={filtro} alCambiar={setFiltro} />

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
              materiasConLinks.map((materiaId) => (
                <View key={materiaId} style={estilos.grupoLinks}>
                  <View style={estilos.cabeceraMateria}>
                    <Text style={estilos.codigoMateria}>{materiaId}</Text>
                    <Text style={estilos.nombreMateria} numberOfLines={1}>
                      {buscarMateria(materiaId)?.nombre ?? materiaId}
                    </Text>
                  </View>

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

function FilaLink({ link, primera }: { link: LinkOficial; primera: boolean }) {
  const abrir = async () => {
    try {
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
        !primera && estilos.separador,
        pressed && estilos.presionado,
      ]}
    >
      <View style={estilos.iconoLink}>
        <Ionicons
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

  subtituloSeccion: {
    marginTop: -espaciado.sm,
    fontSize: 13,
    color: colores.textoTenue,
  },

  presionado: {
    opacity: 0.7,
  },

  grupoLinks: {
    overflow: "hidden",
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
  },

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
