import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BotonAmistad } from "@/componentes/BotonAmistad";
import { CabeceraPerfil } from "@/componentes/CabeceraPerfil";
import { buscarMateria } from "@/datos/carrera";
import { estudiantes } from "@/datos/comunidad";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import {
  codigosEnCurso,
  etiquetaPeriodo,
} from "@/utilidades/materias";

export default function PantallaEstudiante() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const { solicitudesEnviadas, materias } = useDatos();

  const persona = estudiantes.find((candidato) => candidato.id === id);

  if (!persona) {
    return (
      <View style={[estilos.pantalla, estilos.vacio]}>
        <Ionicons name="person-outline" size={32} color={colores.textoDebil} />
        <Text style={estilos.textoVacio}>No encontramos a este estudiante.</Text>
      </View>
    );
  }

  const misMaterias = codigosEnCurso(materias);
  const enComun = persona.materias.filter((materia) =>
    misMaterias.includes(materia)
  );
  const relacion = persona.esAmigo
    ? "Son amigos"
    : solicitudesEnviadas.includes(persona.id)
      ? "Le mandaste una solicitud"
      : null;

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <CabeceraPerfil
          nombre={persona.nombre}
          cuatrimestre={persona.cuatrimestre}
          contadores={[
            { valor: persona.amigos, rotulo: "Amigos" },
            { valor: persona.materias.length, rotulo: "Materias" },
            { valor: enComun.length, rotulo: "En común" },
          ]}
        />

        <View style={estilos.acciones}>
          {relacion ? <Text style={estilos.relacion}>{relacion}</Text> : null}
          <BotonAmistad estudiante={persona} tamanio="grande" />
        </View>

        <Text style={estilos.tituloSeccion}>Materias que está cursando</Text>

        <View style={estilos.grupo}>
          {persona.materias.map((codigo, indice) => {
            const materia = buscarMateria(codigo);
            const comun = enComun.includes(codigo);

            return (
              <View
                key={codigo}
                style={[estilos.fila, indice > 0 && estilos.separador]}
              >
                <View style={estilos.textoFila}>
                  <Text style={estilos.tituloFila}>
                    {materia?.nombre ?? codigo}
                  </Text>
                  <Text style={estilos.subtituloFila}>
                    {codigo}
                    {materia ? ` · ${etiquetaPeriodo(materia)}` : ""}
                  </Text>
                </View>

                {comun ? (
                  <View style={estilos.insignia}>
                    <Ionicons
                      name="link"
                      size={12}
                      color={colores.azulClaro}
                    />
                    <Text style={estilos.textoInsignia}>En común</Text>
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
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

  acciones: {
    alignItems: "center",
    gap: espaciado.sm,
    paddingVertical: espaciado.sm,
  },

  relacion: {
    fontSize: 13,
    color: colores.textoTenue,
  },

  tituloSeccion: {
    marginTop: espaciado.md,
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
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  separador: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.bordeSuave,
  },

  textoFila: {
    flex: 1,
  },

  tituloFila: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  subtituloFila: {
    marginTop: 2,
    fontSize: 12,
    color: colores.textoTenue,
  },

  insignia: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    borderRadius: radios.pastilla,
    backgroundColor: colores.primarioProfundo,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 3,
  },

  textoInsignia: {
    fontSize: 11,
    fontWeight: "600",
    color: colores.azulClaro,
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
