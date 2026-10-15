import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { useState } from "react";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ChipsFiltro } from "@/componentes/ChipsFiltro";
import { Etiqueta } from "@/componentes/Etiqueta";
import { EstadoDeMateria } from "@/componentes/EstadoDeMateria";
import { MisApuntes } from "@/componentes/MisApuntes";
import { Tarjeta } from "@/componentes/Tarjeta";
import {
  carrera,
  etiquetasCategoria,
  etiquetasEstado,
  type CategoriaRecurso,
} from "@/datos/carrera";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import { estilosPorEstado } from "@/tema/materias";
import { etiquetaPeriodo } from "@/utilidades/materias";

const CATEGORIAS: { clave: CategoriaRecurso; etiqueta: string }[] = [
  { clave: "oficiales", etiqueta: etiquetasCategoria.oficiales },
  { clave: "comunidad", etiqueta: etiquetasCategoria.comunidad },
  { clave: "misApuntes", etiqueta: etiquetasCategoria.misApuntes },
];

const ICONOS_FORMATO: Record<string, keyof typeof Ionicons.glyphMap> = {
  PDF: "document-text-outline",
  DOCX: "document-outline",
  ZIP: "folder-outline",
  TXT: "create-outline",
};

export default function PantallaMateria() {
  const { id } = useLocalSearchParams<{ id: string }>();
  const [categoria, setCategoria] = useState<CategoriaRecurso>("oficiales");

  const { materias } = useDatos();

  const materia = materias.find((candidata) => candidata.id === id);

  if (!materia) {
    return (
      <View style={[estilos.pantalla, estilos.vacioPantalla]}>
        <Ionicons
          name="help-circle-outline"
          size={32}
          color={colores.textoDebil}
        />
        <Text style={estilos.textoVacio}>No encontramos la materia {id}.</Text>
      </View>
    );
  }

  const recursos = materia.recursos.filter(
    (recurso) => recurso.categoria === categoria
  );

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <Text style={estilos.titulo}>{materia.nombre}</Text>
        <Text style={estilos.subtitulo}>
          {materia.id} · {carrera.nombre}
        </Text>

        <Etiqueta
          texto={etiquetasEstado[materia.estado]}
          icono={estilosPorEstado[materia.estado].icono}
          color={estilosPorEstado[materia.estado].colorEtiqueta}
          fondo={estilosPorEstado[materia.estado].fondoEtiqueta}
        />

        <Tarjeta style={estilos.tarjetaDatos}>
          <View style={estilos.fila}>
            <View style={estilos.columna}>
              <Text style={estilos.rotulo}>Cursada</Text>
              <Text style={estilos.valor}>{etiquetaPeriodo(materia)}</Text>
            </View>
            <View style={estilos.columna}>
              <Text style={estilos.rotulo}>Créditos</Text>
              <Text style={estilos.valor}>{materia.creditos}</Text>
            </View>
          </View>

          <View>
            <Text style={estilos.rotulo}>Profesor</Text>
            <Text style={estilos.valor}>{materia.profesor}</Text>
          </View>
        </Tarjeta>

        <EstadoDeMateria materia={materia} />

        <Tarjeta style={estilos.tarjetaDificultad}>
          <Text style={estilos.rotuloChico}>Dificultad estimada</Text>
          <Estrellas valor={materia.dificultad} />
          <Text style={estilos.puntaje}>
            {materia.dificultad.toFixed(1)} / 5.0
          </Text>
          <Text style={estilos.resenias}>
            Basado en {materia.resenias} reseñas
          </Text>
        </Tarjeta>

        <Text style={estilos.tituloSeccion}>Apuntes y recursos</Text>

        <ChipsFiltro
          opciones={CATEGORIAS}
          valor={categoria}
          alCambiar={setCategoria}
        />

        {categoria === "misApuntes" ? (
          materia.estado === "bloqueada" ? (
            <Tarjeta style={estilos.tarjetaVacia}>
              <Text style={estilos.textoVacio}>
                Vas a poder subir apuntes cuando empieces a cursarla.
              </Text>
            </Tarjeta>
          ) : (
            <MisApuntes materiaId={materia.id} />
          )
        ) : recursos.length === 0 ? (
          <Tarjeta style={estilos.tarjetaVacia}>
            <Text style={estilos.textoVacio}>
              Todavía no hay material en esta solapa.
            </Text>
          </Tarjeta>
        ) : (
          recursos.map((recurso) => (
            <Pressable
              key={recurso.id}
              style={({ pressed }) => [
                estilos.filaRecurso,
                pressed && estilos.presionado,
              ]}
            >
              <View style={estilos.iconoRecurso}>
                <Ionicons
                  name={ICONOS_FORMATO[recurso.formato] ?? "document-outline"}
                  size={18}
                  color={colores.azulClaro}
                />
              </View>
              <View style={estilos.textoRecurso}>
                <Text style={estilos.nombreRecurso}>{recurso.nombre}</Text>
                <Text style={estilos.metaRecurso}>
                  {recurso.formato} · {recurso.peso}
                </Text>
              </View>
              <Ionicons
                name="download-outline"
                size={18}
                color={colores.textoTenue}
              />
            </Pressable>
          ))
        )}
      </ScrollView>
    </View>
  );
}

function Estrellas({ valor }: { valor: number }) {
  const posiciones = [1, 2, 3, 4, 5];

  return (
    <View style={estilos.estrellas}>
      {posiciones.map((posicion) => {
        const nombre =
          valor >= posicion
            ? "star"
            : valor >= posicion - 0.5
              ? "star-half"
              : "star-outline";

        return (
          <Ionicons
            key={posicion}
            name={nombre}
            size={18}
            color={valor >= posicion - 0.5 ? colores.alerta : colores.borde}
          />
        );
      })}
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

  titulo: {
    fontSize: 30,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colores.texto,
  },

  subtitulo: {
    marginTop: -espaciado.sm,
    fontSize: 13,
    color: colores.textoTenue,
  },

  tarjetaDatos: {
    gap: espaciado.lg,
  },

  fila: {
    flexDirection: "row",
    gap: espaciado.lg,
  },

  columna: {
    flex: 1,
  },

  rotulo: {
    fontSize: 10,
    fontWeight: "700",
    letterSpacing: 0.8,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  rotuloChico: {
    fontSize: 10,
    fontWeight: "600",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  valor: {
    marginTop: espaciado.xs,
    fontSize: 15,
    color: colores.textoSuave,
  },

  tarjetaDificultad: {
    alignItems: "center",
    gap: espaciado.sm,
  },

  estrellas: {
    flexDirection: "row",
    gap: espaciado.xs,
  },

  puntaje: {
    fontSize: 20,
    fontWeight: "700",
    color: colores.texto,
  },

  resenias: {
    fontSize: 11,
    color: colores.textoTenue,
  },

  tituloSeccion: {
    marginTop: espaciado.sm,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  filaRecurso: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    padding: espaciado.md,
  },

  presionado: {
    opacity: 0.7,
  },

  iconoRecurso: {
    width: 34,
    height: 34,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radios.sm,
    backgroundColor: colores.primarioProfundo,
  },

  textoRecurso: {
    flex: 1,
  },

  nombreRecurso: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.textoSuave,
  },

  metaRecurso: {
    marginTop: 2,
    fontSize: 11,
    color: colores.textoTenue,
  },

  tarjetaVacia: {
    alignItems: "center",
  },

  vacioPantalla: {
    flex: 1,
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
