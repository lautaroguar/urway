import {
  CameraView,
  type BarcodeScanningResult,
  type BarcodeType,
} from "expo-camera";
import { useState } from "react";
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { ControlesCamara, useAyudasCamara } from "@/componentes/ControlesCamara";
import { PermisoCamara } from "@/componentes/PermisoCamara";
import { Tarjeta } from "@/componentes/Tarjeta";
import { colores, espaciado, radios } from "@/tema/colores";
import { leerDatosDni } from "@/utilidades/dni";

const tiposDeCodigo: BarcodeType[] = [
  "pdf417",
  "qr",
  "datamatrix",
  "code128",
  "code39",
];

const letraFija = Platform.select({ ios: "Menlo", default: "monospace" });

export default function PantallaEscanearDni() {
  const [leido, setLeido] = useState<BarcodeScanningResult | null>(null);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  const ayudas = useAyudasCamara();

  const alEscanear = (resultado: BarcodeScanningResult) => {
    setLeido((actual) => actual ?? resultado);
  };

  const escanearOtro = () => {
    setLeido(null);
    setErrorCamara(null);
  };

  const campos = leido ? leido.data.split("@") : [];
  const hayExtra = leido?.extra !== undefined && Object.keys(leido.extra).length > 0;
  const interpretado = leido ? leerDatosDni(leido.data) : {};

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      showsVerticalScrollIndicator={false}
    >
      <Text style={estilos.aclaracion}>
        Pantalla de prueba. Lo que se lee solo se muestra acá: no se guarda ni se
        envía.
      </Text>

      {leido === null ? (
        <PermisoCamara mensaje="Necesitamos la cámara para leer el código de barras de tu DNI.">
          <Text style={estilos.texto}>
            Apuntá al código de barras del DNI. Si no enfoca, alejá un poco el
            celular y subí el zoom; si hay poca luz, prendé la linterna. Si hay
            reflejos, inclinalo un poco.
          </Text>

          <View style={estilos.marco}>
            <CameraView
              style={StyleSheet.absoluteFill}
              facing="back"
              enableTorch={ayudas.linterna}
              zoom={ayudas.zoom}
              barcodeScannerSettings={{ barcodeTypes: tiposDeCodigo }}
              onBarcodeScanned={alEscanear}
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
      ) : (
        <>
          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Tipo de código</Text>
            <Text style={estilos.valor}>{leido.type}</Text>

            <Text style={estilos.rotulo}>Largo</Text>
            <Text style={estilos.valor}>{leido.data.length} caracteres</Text>
          </Tarjeta>

          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Texto leído</Text>
            <Text selectable style={estilos.plano}>
              {leido.data}
            </Text>
          </Tarjeta>

          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Con caracteres invisibles</Text>
            <Text selectable style={estilos.plano}>
              {JSON.stringify(leido.data)}
            </Text>
          </Tarjeta>

          {campos.length > 1 ? (
            <Tarjeta style={estilos.resultado}>
              <Text style={estilos.rotulo}>
                Separado por "@" ({campos.length} campos)
              </Text>
              {campos.map((campo, posicion) => (
                <View key={`campo-${posicion}`} style={estilos.filaCampo}>
                  <Text style={estilos.posicion}>{posicion}</Text>
                  <Text selectable style={estilos.campo}>
                    {campo === "" ? "(vacío)" : campo}
                  </Text>
                </View>
              ))}
            </Tarjeta>
          ) : null}

          {leido.raw !== undefined ? (
            <Tarjeta style={estilos.resultado}>
              <Text style={estilos.rotulo}>Raw (solo Android)</Text>
              <Text selectable style={estilos.plano}>
                {JSON.stringify(leido.raw)}
              </Text>
            </Tarjeta>
          ) : null}

          {hayExtra ? (
            <Tarjeta style={estilos.resultado}>
              <Text style={estilos.rotulo}>Extra (solo Android)</Text>
              <Text selectable style={estilos.plano}>
                {JSON.stringify(leido.extra, null, 2)}
              </Text>
            </Tarjeta>
          ) : null}

          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Lo que cargaría el registro</Text>
            <FilaDato etiqueta="Nombre" valor={interpretado.nombre} />
            <FilaDato etiqueta="Apellido" valor={interpretado.apellido} />
            <FilaDato etiqueta="Nacimiento" valor={interpretado.fechaNacimiento} />
            <FilaDato etiqueta="DNI" valor={interpretado.dni} />
          </Tarjeta>

          <Pressable
            onPress={escanearOtro}
            style={({ pressed }) => [estilos.boton, pressed && estilos.presionado]}
          >
            <Text style={estilos.textoBoton}>Escanear otro</Text>
          </Pressable>
        </>
      )}
    </ScrollView>
  );
}

function FilaDato({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <View style={estilos.filaCampo}>
      <Text style={estilos.etiquetaDato}>{etiqueta}</Text>
      <Text style={valor ? estilos.campo : estilos.sinDato}>
        {valor ?? "— no se pudo leer"}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  contenido: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg,
  },

  aclaracion: {
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoTenue,
  },

  texto: {
    fontSize: 14,
    lineHeight: 20,
    color: colores.textoSuave,
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

  resultado: {
    gap: espaciado.xs,
  },

  rotulo: {
    marginTop: espaciado.xs,
    fontSize: 12,
    fontWeight: "600",
    color: colores.textoTenue,
  },

  valor: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  plano: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: letraFija,
    color: colores.textoSuave,
  },

  filaCampo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado.md,
    paddingVertical: espaciado.xs,
  },

  posicion: {
    width: 22,
    fontSize: 13,
    fontFamily: letraFija,
    color: colores.azulClaro,
  },

  etiquetaDato: {
    width: 90,
    fontSize: 13,
    fontFamily: letraFija,
    color: colores.azulClaro,
  },

  campo: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: letraFija,
    color: colores.texto,
  },

  sinDato: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: letraFija,
    color: colores.textoDebil,
  },

  boton: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: radios.lg,
    backgroundColor: colores.primario,
  },

  textoBoton: {
    fontSize: 16,
    fontWeight: "700",
    color: colores.blanco,
  },

  presionado: {
    opacity: 0.75,
  },
});
