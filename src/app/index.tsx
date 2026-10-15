import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useEffect, useRef } from "react";
import { Animated, Pressable, StyleSheet } from "react-native";

import { useSesion } from "@/estado/sesion";
import { colores, espaciado, radios } from "@/tema/colores";

const PAUSA_FINAL_MS = 900;

export default function PantallaBienvenida() {
  const router = useRouter();
  const { usuario } = useSesion();
  const destino = usuario ? "/inicio" : "/login";

  const logo = useRef(new Animated.Value(0)).current;
  const nombre = useRef(new Animated.Value(0)).current;
  const lema = useRef(new Animated.Value(0)).current;

  const entrada = useRef<Animated.CompositeAnimation | null>(null);

  const continuar = () => {
    entrada.current?.stop();
    router.replace(destino);
  };

  useEffect(() => {
    entrada.current = Animated.sequence([
      Animated.stagger(300, [
        Animated.spring(logo, {
          toValue: 1,
          friction: 6,
          tension: 60,
          useNativeDriver: true,
        }),
        Animated.timing(nombre, {
          toValue: 1,
          duration: 700,
          useNativeDriver: true,
        }),
        Animated.timing(lema, {
          toValue: 1,
          duration: 600,
          useNativeDriver: true,
        }),
      ]),
      Animated.delay(PAUSA_FINAL_MS),
    ]);

    entrada.current.start(({ finished }) => {
      if (finished) router.replace(destino);
    });

    return () => entrada.current?.stop();
  }, []);

  return (
    <Pressable style={estilos.pantalla} onPress={continuar}>
      <Animated.View
        style={[
          estilos.logo,
          {
            opacity: logo.interpolate({
              inputRange: [0, 0.5, 1],
              outputRange: [0, 1, 1],
            }),
            transform: [
              {
                scale: logo.interpolate({
                  inputRange: [0, 1],
                  outputRange: [0.5, 1],
                }),
              },
            ],
          },
        ]}
      >
        <Ionicons name="school" size={48} color={colores.azulTenue} />
      </Animated.View>

      <Animated.Text
        style={[
          estilos.nombre,
          {
            opacity: nombre,
            transform: [
              {
                translateY: nombre.interpolate({
                  inputRange: [0, 1],
                  outputRange: [16, 0],
                }),
              },
            ],
          },
        ]}
      >
        urway
      </Animated.Text>

      <Animated.Text style={[estilos.lema, { opacity: lema }]}>
        For students, By students.
      </Animated.Text>
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.lg,
    backgroundColor: colores.fondo,
  },

  logo: {
    width: 104,
    height: 104,
    alignItems: "center",
    justifyContent: "center",
    borderRadius: radios.xl + 4,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.primarioProfundo,
  },

  nombre: {
    fontSize: 48,
    fontWeight: "800",
    letterSpacing: -1,
    color: colores.azulTenue,
  },

  lema: {
    fontSize: 15,
    color: colores.textoTenue,
  },
});
