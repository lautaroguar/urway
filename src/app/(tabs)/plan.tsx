import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";

import { BarraProgreso } from "@/componentes/BarraProgreso";
import { ChipsFiltro } from "@/componentes/ChipsFiltro";
import {
  carrera,
  estudiante,
  type EstadoMateria,
  type Materia,
} from "@/datos/carrera";
import { useDatos } from "@/estado/datos";
import {
  colores,
  espaciado,
  espacioBajoTabs,
  radios,
} from "@/tema/colores";
import { estilosPorEstado } from "@/tema/materias";
import {
  anioDe,
  nombreDelAnio,
  resumenCarrera,
} from "@/utilidades/materias";

type Filtro = "todas" | EstadoMateria;

const FILTROS: { clave: Filtro; etiqueta: string }[] = [
  { clave: "todas", etiqueta: "Todas" },
  { clave: "cursando", etiqueta: "En curso" },
  { clave: "pendienteFinal", etiqueta: "Pendientes de final" },
  { clave: "aprobada", etiqueta: "Aprobadas" },
  { clave: "bloqueada", etiqueta: "Bloqueadas" },
];

export default function PantallaPlan() {
  const router = useRouter();
  const { materias } = useDatos();

  const [busqueda, setBusqueda] = useState("");
  const [filtro, setFiltro] = useState<Filtro>("todas");
  const [aniosAbiertos, setAniosAbiertos] = useState<number[]>([
    anioDe(estudiante.cuatrimestreActual),
  ]);

  const alternarAnio = (anio: number) => {
    setAniosAbiertos((actuales) =>
      actuales.includes(anio)
        ? actuales.filter((abierto) => abierto !== anio)
        : [...actuales, anio]
    );
  };

  const texto = busqueda.trim().toLowerCase();

  const visibles = materias.filter((materia) => {
    const coincideFiltro = filtro === "todas" || materia.estado === filtro;
    const coincideTexto =
      texto.length === 0 ||
      materia.nombre.toLowerCase().includes(texto) ||
      materia.id.toLowerCase().includes(texto);

    return coincideFiltro && coincideTexto;
  });

  const hayFiltro = texto.length > 0 || filtro !== "todas";

  const anios = [
    ...new Set(visibles.map((materia) => anioDe(materia.cuatrimestre))),
  ].sort((a, b) => a - b);

  const resumen = resumenCarrera(materias);
  const avance = resumen.materiasAprobadas / resumen.materiasTotales;

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
      >
        <View>
          <Text style={estilos.titulo}>Plan de estudios</Text>
          <Text style={estilos.subtitulo}>
            {carrera.nombre} · {carrera.universidad}
          </Text>
        </View>

        <View style={estilos.bloqueProgreso}>
          <View style={estilos.filaProgreso}>
            <Text style={estilos.textoProgreso}>
              {resumen.materiasAprobadas} de {resumen.materiasTotales} materias
              aprobadas
              {resumen.finalesPendientes > 0
                ? ` · ${resumen.finalesPendientes} ${
                    resumen.finalesPendientes === 1
                      ? "final pendiente"
                      : "finales pendientes"
                  }`
                : ""}
            </Text>
            <Text style={estilos.porcentaje}>{Math.round(avance * 100)}%</Text>
          </View>
          <BarraProgreso valor={avance} alto={6} />
        </View>

        <View style={estilos.filaBusqueda}>
          <View style={estilos.buscador}>
            <Ionicons name="search" size={16} color={colores.textoDebil} />
            <TextInput
              value={busqueda}
              onChangeText={setBusqueda}
              placeholder="Buscar materia o apunte"
              placeholderTextColor={colores.textoDebil}
              style={estilos.input}
              returnKeyType="search"
            />
          </View>
        </View>

        <ChipsFiltro opciones={FILTROS} valor={filtro} alCambiar={setFiltro} />

        {anios.length === 0 ? (
          <View style={estilos.vacio}>
            <Ionicons
              name="search-outline"
              size={28}
              color={colores.textoDebil}
            />
            <Text style={estilos.textoVacio}>
              Ninguna materia coincide con la búsqueda.
            </Text>
          </View>
        ) : (
          anios.map((anio) => {
            const delAnio = materias.filter(
              (materia) => anioDe(materia.cuatrimestre) === anio
            );
            const aprobadasDelAnio = delAnio.filter(
              (materia) => materia.estado === "aprobada"
            ).length;
            const abierto = hayFiltro || aniosAbiertos.includes(anio);

            return (
              <View key={anio} style={estilos.bloqueAnio}>
                <Pressable
                  onPress={() => alternarAnio(anio)}
                  disabled={hayFiltro}
                  style={({ pressed }) => [
                    estilos.cabeceraAnio,
                    pressed && estilos.filaPresionada,
                  ]}
                >
                  <View style={estilos.textosAnio}>
                    <Text style={estilos.tituloAnio}>{nombreDelAnio(anio)}</Text>
                    <Text style={estilos.resumenAnio}>
                      {aprobadasDelAnio} de {delAnio.length} aprobadas
                    </Text>
                  </View>
                  <Ionicons
                    name={abierto ? "chevron-up" : "chevron-down"}
                    size={20}
                    color={colores.azulClaro}
                  />
                </Pressable>

                {abierto ? (
                  <View style={estilos.contenidoAnio}>
                    {[1, 2].map((delAnioNumero) => {
                      const cuatrimestre = (anio - 1) * 2 + delAnioNumero;
                      const delCuatrimestre = visibles.filter(
                        (materia) => materia.cuatrimestre === cuatrimestre
                      );
                      if (delCuatrimestre.length === 0) return null;

                      return (
                        <View key={cuatrimestre} style={estilos.seccion}>
                          <View style={estilos.tituloSeccion}>
                            <View style={estilos.puntoSeccion} />
                            <Text style={estilos.textoSeccion}>
                              {delAnioNumero}º cuatrimestre
                            </Text>
                          </View>

                          {delCuatrimestre.map((materia) => (
                            <FilaMateria
                              key={materia.id}
                              materia={materia}
                              alAbrir={() => router.push(`/materia/${materia.id}`)}
                            />
                          ))}
                        </View>
                      );
                    })}
                  </View>
                ) : null}
              </View>
            );
          })
        )}
      </ScrollView>
    </View>
  );
}

type PropsFila = {
  materia: Materia;
  alAbrir: () => void;
};

function FilaMateria({ materia, alAbrir }: PropsFila) {
  const bloqueada = materia.estado === "bloqueada";
  const aspecto = estilosPorEstado[materia.estado];

  return (
    <Pressable
      onPress={alAbrir}
      disabled={bloqueada}
      style={({ pressed }) => [
        estilos.fila,
        { backgroundColor: aspecto.fondo, borderColor: aspecto.borde },
        pressed && !bloqueada && estilos.filaPresionada,
      ]}
    >
      <View style={estilos.textoFila}>
        <Text
          style={[estilos.nombre, bloqueada && estilos.nombreBloqueado]}
          numberOfLines={1}
        >
          {materia.nombre}
        </Text>
        <Text style={estilos.codigo}>
          {materia.id} · {materia.creditos} créditos
        </Text>
      </View>

      <View style={estilos.derechaFila}>
        {materia.notaFinal !== undefined ? (
          <Text style={estilos.nota}>{materia.notaFinal}</Text>
        ) : null}
        <Ionicons name={aspecto.icono} size={16} color={aspecto.acento} />
      </View>
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
    gap: espaciado.lg,
  },

  titulo: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.7,
    color: colores.texto,
  },

  subtitulo: {
    marginTop: 4,
    fontSize: 12,
    color: colores.textoTenue,
  },

  bloqueProgreso: {
    gap: espaciado.sm,
  },

  filaProgreso: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
  },

  textoProgreso: {
    flex: 1,
    fontSize: 13,
    color: colores.textoTenue,
  },

  porcentaje: {
    fontSize: 14,
    fontWeight: "700",
    color: colores.azulClaro,
  },

  filaBusqueda: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },

  buscador: {
    flex: 1,
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

  bloqueAnio: {
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    overflow: "hidden",
  },

  cabeceraAnio: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  textosAnio: {
    flex: 1,
  },

  tituloAnio: {
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: -0.2,
    color: colores.texto,
  },

  resumenAnio: {
    marginTop: 2,
    fontSize: 12,
    color: colores.textoTenue,
  },

  contenidoAnio: {
    gap: espaciado.lg,
    paddingHorizontal: espaciado.md,
    paddingBottom: espaciado.md,
  },

  seccion: {
    gap: espaciado.sm,
  },

  tituloSeccion: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
    marginBottom: espaciado.xs,
  },

  puntoSeccion: {
    width: 6,
    height: 6,
    borderRadius: 3,
    backgroundColor: colores.primario,
  },

  textoSeccion: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 1,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  fila: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
    minHeight: 54,
    borderRadius: radios.md,
    borderWidth: 1,
    paddingHorizontal: espaciado.md,
    paddingVertical: espaciado.sm,
  },

  filaPresionada: {
    opacity: 0.75,
  },

  textoFila: {
    flexShrink: 1,
  },

  nombre: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  nombreBloqueado: {
    color: colores.textoDebil,
    fontWeight: "500",
  },

  codigo: {
    marginTop: 2,
    fontSize: 11,
    color: colores.textoTenue,
  },

  derechaFila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },

  nota: {
    fontSize: 15,
    fontWeight: "700",
    color: colores.texto,
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
