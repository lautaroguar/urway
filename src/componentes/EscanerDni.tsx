import { CameraView, type BarcodeType } from "expo-camera";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { ControlesCamara, useAyudasCamara } from "@/componentes/ControlesCamara";
import { PermisoCamara } from "@/componentes/PermisoCamara";
import { colores, espaciado, radios } from "@/tema/colores";

const tiposDni: BarcodeType[] = ["pdf417"];

type Props = {
  alLeer: (texto: string) => void;
  alCancelar: () => void;
};

export function EscanerDni({ alLeer, alCancelar }: Props) {
  const ayudas = useAyudasCamara();
  const [errorCamara, setErrorCamara] = useState<string | null>(null);

  return (
    <View style={estilos.contenedor}>
      <PermisoCamara mensaje="Necesitamos la cámara para leer el código de barras de tu DNI.">
        <Text style={estilos.texto}>
          Apuntá al código de barras del DNI. Si no enfoca, alejá un poco el
          celular y subí el zoom; si hay poca luz, prendé la linterna.
        </Text>

        <View style={estilos.marco}>
          <CameraView
            style={StyleSheet.absoluteFill}
            facing="back"
            enableTorch={ayudas.linterna}
            zoom={ayudas.zoom}
            barcodeScannerSettings={{ barcodeTypes: tiposDni }}
            onBarcodeScanned={(lectura) => alLeer(lectura.data)}
            onMountError={(evento) => setErrorCamara(evento.message)}
          />
        </View>

        <ControlesCamara ayudas={ayudas} />

        {errorCamara ? (
          <Text style={estilos.textoError}>
            No se pudo abrir la cámara: {errorCamara}
          </Text>
        ) : null}
      </PermisoCamara>

      <Pressable
        onPress={alCancelar}
        style={({ pressed }) => [estilos.cancelar, pressed && estilos.presionado]}
      >
        <Text style={estilos.textoCancelar}>Cancelar y completar a mano</Text>
      </Pressable>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    gap: espaciado.md,
  },

  texto: {
    fontSize: 13,
    lineHeight: 19,
    color: colores.textoSecundario,
  },

  textoError: {
    fontSize: 13,
    lineHeight: 19,
    color: colores.alerta,
  },

  marco: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.superficie,
    overflow: "hidden",
  },

  cancelar: {
    alignItems: "center",
    justifyContent: "center",
    height: 44,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.borde,
  },

  textoCancelar: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  presionado: {
    opacity: 0.75,
  },
});
