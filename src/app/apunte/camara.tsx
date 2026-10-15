import { CameraView } from "expo-camera";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useRef, useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ControlesCamara, useAyudasCamara } from "@/componentes/ControlesCamara";
import { PermisoCamara } from "@/componentes/PermisoCamara";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";

export default function PantallaCamaraApunte() {
  const router = useRouter();
  const { materiaId } = useLocalSearchParams<{ materiaId?: string }>();
  const { agregarApunte } = useDatos();

  const camara = useRef<CameraView>(null);
  const ayudas = useAyudasCamara();

  const [lista, setLista] = useState(false);
  const [sacando, setSacando] = useState(false);
  const [error, setError] = useState<string | null>(null);

  const sacarFoto = async () => {
    if (!materiaId || !lista || sacando || !camara.current) return;
    setSacando(true);
    setError(null);
    try {
      const foto = await camara.current.takePictureAsync({ quality: 0.7 });
      agregarApunte(materiaId, foto.uri);
      router.back();
    } catch {
      setError("No se pudo sacar la foto. Probá de nuevo.");
      setSacando(false);
    }
  };

  const apagado = !lista || sacando;

  return (
    <View style={estilos.pantalla}>
      <PermisoCamara mensaje="Necesitamos la cámara para sacarle fotos a tus apuntes.">
        <View style={estilos.marco}>
          <CameraView
            ref={camara}
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={ayudas.linterna}
            zoom={ayudas.zoom}
            onCameraReady={() => setLista(true)}
            onMountError={(evento) => setError(evento.message)}
          />
        </View>

        <ControlesCamara ayudas={ayudas} />

        {error ? <Text style={estilos.textoError}>{error}</Text> : null}

        <Pressable
          onPress={sacarFoto}
          disabled={apagado}
          style={({ pressed }) => [
            estilos.aro,
            apagado && estilos.aroApagado,
            pressed && estilos.presionado,
          ]}
        >
          <View style={estilos.disparador} />
        </Pressable>
      </PermisoCamara>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    padding: espaciado.lg,
    gap: espaciado.md,
    backgroundColor: colores.fondo,
  },

  marco: {
    flex: 1,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.superficie,
    overflow: "hidden",
  },

  textoError: {
    fontSize: 13,
    textAlign: "center",
    color: colores.alerta,
  },

  aro: {
    alignSelf: "center",
    alignItems: "center",
    justifyContent: "center",
    width: 74,
    height: 74,
    borderRadius: radios.pastilla,
    borderWidth: 4,
    borderColor: colores.blanco,
  },

  aroApagado: {
    opacity: 0.4,
  },

  disparador: {
    width: 56,
    height: 56,
    borderRadius: radios.pastilla,
    backgroundColor: colores.blanco,
  },

  presionado: {
    opacity: 0.7,
  },
});
