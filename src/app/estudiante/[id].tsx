/**
 * ============================================================================
 * app/estudiante/[id].tsx — Perfil de otro estudiante
 * ============================================================================
 *
 * QUÉ ES:
 *   El perfil de un compañero, con la misma forma que el propio: cabecera con
 *   contadores (Amigos / Materias / En común), el estado de la relación, el
 *   botón de amistad y la lista de materias que cursa (con una insignia "En
 *   común" en las que también curso yo).
 *
 * DESDE DÓNDE SE ABRE:
 *   Desde "Encontrá compañeros" (Conectar) y desde la lista de amigos del
 *   perfil propio. Como vive en el Stack raíz, una sola pantalla sirve para
 *   ambos orígenes, y "volver" regresa a donde se estaba.
 *
 * RUTA DINÁMICA:
 *   `[id]` es un valor variable: `/estudiante/est-2` → `id = "est-2"`.
 *
 * TEORÍA:
 *   [NAV]   `useLocalSearchParams` para leer el parámetro de la ruta.
 *   [JS 29] Lee del Context (`solicitudesEnviadas`) para saber si ya le mandé
 *           una solicitud. El propio `BotonAmistad` también usa el Context, así
 *           que el botón y el texto de relación quedan siempre sincronizados.
 *   [JS 25] `enComun` y `relacion` son valores DERIVADOS (se calculan en el
 *           render, no se guardan).
 *   [JS 22] Renderizado condicional (retorno temprano, ternarios, `null`).
 *   [COMP]  Reutilización de `CabeceraPerfil` y `BotonAmistad`.
 */
import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams } from "expo-router";
import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BotonAmistad } from "@/componentes/BotonAmistad";
import { CabeceraPerfil } from "@/componentes/CabeceraPerfil";
// `buscarMateria` trae los datos fijos de una materia (el nombre, el cuatrimestre).
import { buscarMateria } from "@/datos/carrera";
import { estudiantes } from "@/datos/comunidad";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import {
  codigosEnCurso, // los códigos de las materias que se están cursando
  etiquetaPeriodo, // "Primer año · 2º cuatrimestre"
} from "@/utilidades/materias";

/**
 * Perfil de otro estudiante, con la misma forma que el propio: cuántos amigos
 * tiene, qué está cursando y qué materias comparten. Se abre desde Conectar y
 * desde la lista de amigos del perfil.
 */
export default function PantallaEstudiante() {
  // El id de la ruta ("/estudiante/est-2" → "est-2").
  const { id } = useLocalSearchParams<{ id: string }>();
  // Las solicitudes y las materias ACTUALES (de las que estoy cursando salen las
  // que tengo en común con esta persona).
  // (Desestructuración: se sacan del Context solo los dos campos que se usan.)
  const { solicitudesEnviadas, materias } = useDatos();

  // Se busca al estudiante por id (`find` devuelve `undefined` si no está).
  const persona = estudiantes.find((candidato) => candidato.id === id);

  // Retorno temprano si el id no corresponde a nadie. Los hooks ya se llamaron.
  if (!persona) {
    return (
      <View style={[estilos.pantalla, estilos.vacio]}>
        <Ionicons name="person-outline" size={32} color={colores.textoDebil} />
        <Text style={estilos.textoVacio}>No encontramos a este estudiante.</Text>
      </View>
    );
  }

  // Materias que cursa esa persona Y que también curso yo (la intersección).
  // Mis materias de AHORA (cambian si paso una a "pendiente de final").
  const misMaterias = codigosEnCurso(materias);
  // `filter` se queda con las de esa persona que también están en mi lista;
  // `includes` dice si un valor está dentro de un array.
  const enComun = persona.materias.filter((materia) =>
    misMaterias.includes(materia)
  );
  // Texto que describe la relación (o `null` si no hay ninguna). Ternarios
  // encadenados: ¿son amigos? → "Son amigos"; si no, ¿le mandé solicitud? →
  // "Le mandaste una solicitud"; si no → `null`.
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
        {/* La misma cabecera que el perfil propio, con contadores distintos. */}
        <CabeceraPerfil
          nombre={persona.nombre}
          cuatrimestre={persona.cuatrimestre}
          contadores={[
            { valor: persona.amigos, rotulo: "Amigos" },
            { valor: persona.materias.length, rotulo: "Materias" },
            { valor: enComun.length, rotulo: "En común" },
          ]}
        />

        {/* Texto de relación (si hay) y botón de amistad en su versión grande. */}
        <View style={estilos.acciones}>
          {relacion ? <Text style={estilos.relacion}>{relacion}</Text> : null}
          <BotonAmistad estudiante={persona} tamanio="grande" />
        </View>

        <Text style={estilos.tituloSeccion}>Materias que está cursando</Text>

        {/* Lista agrupada de las materias de esa persona. */}
        <View style={estilos.grupo}>
          {persona.materias.map((codigo, indice) => {
            // Datos completos de la materia (nombre, cuatrimestre). Puede ser
            // `undefined` si la materia no está en mi catálogo (por ejemplo,
            // una materia que yo no tengo cargada).
            const materia = buscarMateria(codigo);
            // ¿La curso yo también?
            const comun = enComun.includes(codigo);

            return (
              <View
                key={codigo}
                // Línea separadora arriba, salvo en la primera fila.
                style={[estilos.fila, indice > 0 && estilos.separador]}
              >
                <View style={estilos.textoFila}>
                  <Text style={estilos.tituloFila}>
                    {/* `?.` accede a `nombre` solo si `materia` existe; `??`
                        usa el código como respaldo si no hay nombre. */}
                    {materia?.nombre ?? codigo}
                  </Text>
                  <Text style={estilos.subtituloFila}>
                    {codigo}
                    {/* Si la materia se encontró, agrega " · Primer año · 2º
                        cuatrimestre". */}
                    {materia ? ` · ${etiquetaPeriodo(materia)}` : ""}
                  </Text>
                </View>

                {/* Insignia "En común", solo en las materias compartidas. */}
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
  // El contenedor raíz: ocupa toda la pantalla con el fondo negro del tema.
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  // El `ScrollView` ocupa todo el alto disponible.
  scroll: {
    flex: 1,
  },

  // El relleno del contenido del scroll; `gap` separa cada bloque.
  contenido: {
    paddingHorizontal: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.md,
  },

  // Texto de relación y botón, centrados en columna.
  acciones: {
    alignItems: "center",
    gap: espaciado.sm,
    paddingVertical: espaciado.sm,
  },

  // "Son amigos" o "Le mandaste una solicitud", chico y apagado.
  relacion: {
    fontSize: 13,
    color: colores.textoTenue,
  },

  // "Materias que está cursando".
  tituloSeccion: {
    marginTop: espaciado.md,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  // Tarjeta redondeada que agrupa las filas (estilo Ajustes de iOS).
  grupo: {
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    overflow: "hidden",
  },

  // Una fila de materia: el texto a la izquierda y la insignia a la derecha.
  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  // La línea fina que va arriba de cada fila menos la primera.
  separador: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.bordeSuave,
  },

  // El bloque del texto: `flex: 1` ocupa lo que deja la insignia.
  textoFila: {
    flex: 1,
  },

  // El nombre de la materia.
  tituloFila: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  // "MAT-201 · Primer año · 2º cuatrimestre", más chico y apagado.
  subtituloFila: {
    marginTop: 2,
    fontSize: 12,
    color: colores.textoTenue,
  },

  // La insignia "En común": pastilla azul con ícono y texto.
  insignia: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    borderRadius: radios.pastilla,
    backgroundColor: colores.primarioProfundo,
    paddingHorizontal: espaciado.sm,
    paddingVertical: 3,
  },

  // El texto de la insignia "En común".
  textoInsignia: {
    fontSize: 11,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  // Pantalla centrada para el caso "no existe ese estudiante".
  vacio: {
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.md,
    padding: espaciado.xl,
  },

  // El texto del aviso "No encontramos a este estudiante".
  textoVacio: {
    fontSize: 13,
    textAlign: "center",
    color: colores.textoDebil,
  },
});
