/**
 * ============================================================================
 * componentes/MisApuntes.tsx — Solapa "Mis apuntes" del detalle de materia
 * ============================================================================
 *
 * QUÉ ES:
 *   Dos botones para sumar una foto (sacarla con la cámara o elegirla de la
 *   galería) y una grilla con las fotos que ya se sumaron a ESA materia. Cada
 *   foto se puede borrar con el tachito.
 *
 * QUÉ USA:
 *   - La CÁMARA: "Sacar foto" abre la pantalla `app/apunte/camara.tsx`
 *     (`expo-camera`, con linterna y zoom), que suma el apunte y vuelve acá.
 *   - `expo-image-picker`: "Galería" abre la galería del teléfono para elegir una
 *     foto. No hace falta pedir permiso.
 *   - El Context (`useDatos`): guarda la lista de apuntes en memoria; al cerrar
 *     la app se pierden. Las fotos no se suben a ningún lado.
 *
 * DÓNDE SE USA:
 *   app/materia/[id].tsx, cuando se elige la solapa "Mis apuntes".
 *
 * TEORÍA:
 *   [JS 14] `async/await` y `try/catch` para una operación que TARDA (abrir la
 *           galería y esperar a que el usuario elija).
 *   [JS 8]  `filter` para quedarse con los apuntes de la materia y `map` para
 *           dibujarlos.
 *   [JS 25] Estado derivado: `deLaMateria` se calcula en el render.
 *   [JS 29] La lista vive en el Context, no en un `useState` local.
 *   [JS 22] Renderizado condicional (lista vacía o grilla).
 *   [COMP]  `Image` con `source={{ uri }}` y `resizeMode`; `Alert.alert`.
 *   [EST]   Grilla de dos columnas con `flexWrap` + `space-between`; los dos
 *           botones, en fila y con el mismo ancho (`flex: 1`).
 *   [NAV]   `router.push` con parámetros para abrir la cámara de ESTA materia.
 */
import { Ionicons } from "@expo/vector-icons";
// `useRouter` permite abrir la pantalla de la cámara desde el código.
import { useRouter } from "expo-router";
// `* as ImagePicker` importa TODO el módulo bajo un nombre (se usa como
// `ImagePicker.launchImageLibraryAsync`).
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Tarjeta } from "@/componentes/Tarjeta";
// El Context de datos guarda los apuntes y ofrece sumar y borrar.
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  materiaId: string; // a qué materia pertenecen los apuntes que se muestran
};

/**
 * Solapa "Mis apuntes" del detalle de una materia: botones para sumar una foto
 * (con la cámara o desde la galería) y la grilla de lo que ya sumaste. Las fotos
 * no se suben a ningún lado: se muestran desde el archivo y duran mientras la
 * app esté abierta.
 */
export function MisApuntes({ materiaId }: Props) {
  // El `router` abre la cámara (`router.push`) desde el botón "Sacar foto".
  const router = useRouter();
  // Del Context: todos los apuntes (de todas las materias) y las dos acciones.
  const { apuntes, agregarApunte, eliminarApunte } = useDatos();
  // ESTADO DERIVADO [JS 25]: los apuntes de ESTA materia se calculan en cada
  // render filtrando la lista completa. No se guardan aparte.
  const deLaMateria = apuntes.filter((apunte) => apunte.materiaId === materiaId);

  /** La galería del sistema no pide permiso: el usuario elige qué compartir. */
  // `async`: la función devuelve una promesa y permite usar `await` adentro.
  const elegirDeGaleria = async () => {
    // `try/catch`: si algo falla dentro del `try`, se salta al `catch` en lugar
    // de romper la app.
    try {
      // `await` PAUSA esta función hasta que el usuario elige (o cancela) en la
      // galería. Mientras tanto la app sigue respondiendo.
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"], // solo fotos (no videos)
        quality: 0.7, // compresión: 70 % de calidad
      });
      // Si el usuario tocó "Cancelar", no hay nada que guardar: se sale.
      if (resultado.canceled) return;

      // `assets` es la lista de lo elegido; se toma el primero y su `uri` (la
      // ruta del archivo).
      agregarApunte(materiaId, resultado.assets[0].uri);
    } catch {
      // No se usa el error, así que se omite su nombre. Se avisa con un cuadro
      // de diálogo nativo.
      Alert.alert("No se pudo abrir la galería");
    }
  };

  // Abre la pantalla de la cámara, pasándole de qué materia es el apunte. `push`
  // la apila encima: al sacar la foto, `router.back()` vuelve acá.
  // `params: { materiaId }` es la forma corta de `{ materiaId: materiaId }`; viaja
  // en la ruta y la cámara lo lee con `useLocalSearchParams`.
  const sacarFoto = () =>
    router.push({ pathname: "/apunte/camara", params: { materiaId } });

  return (
    <View style={estilos.contenedor}>
      {/* Los dos botones en fila, cada uno con la mitad del ancho. Son
          hermanos: ningún botón va dentro de otro `Pressable`. */}
      <View style={estilos.botones}>
        {/* Botón 1: abre la cámara de esta materia. */}
        <Pressable
          onPress={sacarFoto}
          style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
        >
          <Ionicons name="camera-outline" size={20} color={colores.azulClaro} />
          <Text style={estilos.textoBoton}>Sacar foto</Text>
        </Pressable>

        {/* Botón 2: abre la galería del teléfono. */}
        <Pressable
          onPress={elegirDeGaleria}
          style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
        >
          <Ionicons name="images-outline" size={20} color={colores.azulClaro} />
          <Text style={estilos.textoBoton}>Galería</Text>
        </Pressable>
      </View>

      {/* Renderizado condicional [JS 22]: si no hay apuntes se muestra un cartel
          explicativo; si hay, la grilla. `cond ? A : B`. */}
      {deLaMateria.length === 0 ? (
        // ESTADO VACÍO: en lugar de dejar la solapa en blanco se explica qué hacer.
        <Tarjeta style={estilos.vacia}>
          <Ionicons
            name="document-text-outline"
            size={24}
            color={colores.textoTenue}
          />
          <Text style={estilos.textoVacio}>
            Todavía no sumaste apuntes de esta materia. Sacale una foto a la
            hoja o elegí una de la galería.
          </Text>
        </Tarjeta>
      ) : (
        <View style={estilos.grilla}>
          {/* Una celda por apunte; `key` estable = el id del apunte. */}
          {deLaMateria.map((apunte) => (
            <View key={apunte.id} style={estilos.celda}>
              {/* La foto. `source={{ uri }}`: la imagen viene de una ruta, no de
                  un archivo del proyecto. `resizeMode="cover"` la recorta para
                  llenar el recuadro sin deformarla. */}
              <Image
                source={{ uri: apunte.uri }}
                style={estilos.miniatura}
                resizeMode="cover"
              />
              <View style={estilos.pie}>
                <Text style={estilos.titulo} numberOfLines={1}>
                  {apunte.titulo}
                </Text>
                {/* Tachito: borra el apunte del Context. */}
                <Pressable
                  onPress={() => eliminarApunte(apunte.id)}
                  hitSlop={8}
                  style={({ pressed }) => pressed && estilos.presionado}
                >
                  <Ionicons
                    name="trash-outline"
                    size={16}
                    color={colores.alerta}
                  />
                </Pressable>
              </View>
            </View>
          ))}
        </View>
      )}
    </View>
  );
}

const estilos = StyleSheet.create({
  // Separa el botón de lo que va debajo.
  contenedor: {
    gap: espaciado.md,
  },

  // Los dos botones, uno al lado del otro.
  botones: {
    flexDirection: "row",
    gap: espaciado.md,
  },

  boton: {
    // `flex: 1`: cada botón ocupa la mitad del ancho.
    flex: 1,
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.primarioProfundo,
    paddingVertical: espaciado.md,
  },

  // El texto de los botones ("Sacar foto", "Galería").
  textoBoton: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.azulPalido,
  },

  // Se suma a un botón mientras se aprieta: queda semitransparente.
  presionado: {
    opacity: 0.7,
  },

  // La tarjeta del estado vacío: ícono y texto centrados en columna.
  vacia: {
    alignItems: "center",
    gap: espaciado.sm,
  },

  // El texto explicativo del estado vacío, centrado.
  textoVacio: {
    fontSize: 13,
    lineHeight: 19, // altura de cada renglón
    textAlign: "center",
    color: colores.textoDebil,
  },

  // Dos columnas: cada celda ocupa un poco menos de la mitad y el hueco del
  // medio lo reparte space-between.
  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: espaciado.md,
  },

  // 48.5 % + 48.5 % = 97 %; el 3 % restante queda como separación entre columnas.
  celda: {
    width: "48.5%",
    overflow: "hidden",
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
  },

  // La foto ocupa todo el ancho de la celda, con proporción 3:4 (vertical, como
  // una hoja).
  miniatura: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colores.superficieSuave,
  },

  // Fila inferior: título a la izquierda y tachito a la derecha
  // (`space-between` los separa a los extremos).
  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.sm,
    padding: espaciado.sm,
  },

  // El título de la foto; `flex: 1` lo deja ocupar lo que sobra y se corta con "..." si es largo.
  titulo: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colores.textoSuave,
  },
});
