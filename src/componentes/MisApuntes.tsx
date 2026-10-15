import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import * as ImagePicker from "expo-image-picker";
import { Alert, Image, Pressable, StyleSheet, Text, View } from "react-native";

import { Tarjeta } from "@/componentes/Tarjeta";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  materiaId: string;
};

export function MisApuntes({ materiaId }: Props) {
  const router = useRouter();
  const { apuntes, agregarApunte, eliminarApunte } = useDatos();
  const deLaMateria = apuntes.filter((apunte) => apunte.materiaId === materiaId);

  const elegirDeGaleria = async () => {
    try {
      const resultado = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ["images"],
        quality: 0.7,
      });
      if (resultado.canceled) return;

      agregarApunte(materiaId, resultado.assets[0].uri);
    } catch {
      Alert.alert("No se pudo abrir la galería");
    }
  };

  const sacarFoto = () =>
    router.push({ pathname: "/apunte/camara", params: { materiaId } });

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.botones}>
        <Pressable
          onPress={sacarFoto}
          style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
        >
          <Ionicons name="camera-outline" size={20} color={colores.azulClaro} />
          <Text style={estilos.textoBoton}>Sacar foto</Text>
        </Pressable>

        <Pressable
          onPress={elegirDeGaleria}
          style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
        >
          <Ionicons name="images-outline" size={20} color={colores.azulClaro} />
          <Text style={estilos.textoBoton}>Galería</Text>
        </Pressable>
      </View>

      {deLaMateria.length === 0 ? (
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
          {deLaMateria.map((apunte) => (
            <View key={apunte.id} style={estilos.celda}>
              <Image
                source={{ uri: apunte.uri }}
                style={estilos.miniatura}
                resizeMode="cover"
              />
              <View style={estilos.pie}>
                <Text style={estilos.titulo} numberOfLines={1}>
                  {apunte.titulo}
                </Text>
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
  contenedor: {
    gap: espaciado.md,
  },

  botones: {
    flexDirection: "row",
    gap: espaciado.md,
  },

  boton: {
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

  textoBoton: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.azulPalido,
  },

  presionado: {
    opacity: 0.7,
  },

  vacia: {
    alignItems: "center",
    gap: espaciado.sm,
  },

  textoVacio: {
    fontSize: 13,
    lineHeight: 19,
    textAlign: "center",
    color: colores.textoDebil,
  },

  grilla: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
    rowGap: espaciado.md,
  },

  celda: {
    width: "48.5%",
    overflow: "hidden",
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
  },

  miniatura: {
    width: "100%",
    aspectRatio: 3 / 4,
    backgroundColor: colores.superficieSuave,
  },

  pie: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.sm,
    padding: espaciado.sm,
  },

  titulo: {
    flex: 1,
    fontSize: 13,
    fontWeight: "600",
    color: colores.textoSuave,
  },
});
