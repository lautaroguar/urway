/**
 * ============================================================================
 * app/escanear-dni.tsx — PRUEBA: qué devuelve el código de barras del DNI
 * ============================================================================
 *
 * QUÉ ES:
 *   Una pantalla de DIAGNÓSTICO, no parte del flujo de la app. Abre la cámara,
 *   lee el primer código de barras que encuentra y muestra EXACTAMENTE lo que
 *   devolvió `expo-camera`: el tipo de código, el texto crudo, el mismo texto con
 *   los caracteres invisibles a la vista y ese texto partido por "@". En Android
 *   suma además el campo `raw` y lo extra que entrega (en iOS no existen).
 *   Al final muestra qué datos cargaría el REGISTRO con esa lectura.
 *
 * PARA QUÉ SIRVE:
 *   Para comparar teléfonos (en iPhone el texto del PDF417 llega con caracteres
 *   rotos; falta ver Android) y para confirmar el formato del DNI con documentos
 *   reales, antes de fiarse del lector de `utilidades/dni.ts`.
 *
 * QUÉ NO HACE:
 *   No guarda ni envía lo leído: vive en el `useState` de esta pantalla y se
 *   pierde al salir. No se escribe en la consola. No saca fotos.
 *
 * DÓNDE VIVE:
 *   En el Stack raíz, a pantalla completa. Se abre desde el login
 *   ("Escanear DNI (prueba)"). El escaneo de verdad está en el registro
 *   (`EscanerDni`); esta pantalla se puede sacar cuando el formato esté confirmado.
 *
 * TEORÍA:
 *   [SENS 26] `expo-camera`: `<CameraView />` y `onBarcodeScanned` con
 *             `barcodeScannerSettings` (permiso en `PermisoCamara`).
 *   [SENS 31] "Limpiar siempre": la cámara se libera al quitar `CameraView` de la
 *             pantalla (acá, apenas se lee un código).
 *   [MÁS 6]   Linterna (`enableTorch`) y zoom, en `ControlesCamara`.
 *   [JS 20]   `useState` con actualización funcional.
 *   [JS 22]   Renderizado condicional (cámara o resultado).
 *   [JS 8]    `split` y `map` para listar los campos separados por "@".
 *   [COMP]    `Pressable`, `ScrollView`, `Text selectable`.
 *   [EST]     `StyleSheet.absoluteFill`, `aspectRatio` y flexbox.
 */
// `CameraView` es la vista de la cámara de expo-camera. Los dos `type` son solo
// tipos de TypeScript: el resultado de una lectura (`BarcodeScanningResult`) y la
// lista de códigos que se pueden buscar (`BarcodeType`).
import {
  CameraView,
  type BarcodeScanningResult,
  type BarcodeType,
} from "expo-camera";
import { useState } from "react";
// `Platform` dice en qué sistema se corre (se usa para elegir la letra de ancho fijo).
import { Platform, Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

// La linterna y el zoom: el hook con su estado y la fila de botones.
import { ControlesCamara, useAyudasCamara } from "@/componentes/ControlesCamara";
// Pide el permiso de la cámara; si ya lo hay, dibuja lo que tiene adentro.
import { PermisoCamara } from "@/componentes/PermisoCamara";
import { Tarjeta } from "@/componentes/Tarjeta";
import { colores, espaciado, radios } from "@/tema/colores";
// Interpreta el texto del código de barras del DNI (nombre, apellido, nacimiento, DNI).
import { leerDatosDni } from "@/utilidades/dni";

// Qué códigos busca la cámara. El del DNI es "pdf417", pero se dejan otros para
// ver si el documento trae alguno más (el DNI nuevo suma un QR). Es una constante
// FUERA del componente: no cambia, así que no hace falta recrearla en cada render.
const tiposDeCodigo: BarcodeType[] = [
  "pdf417",
  "qr",
  "datamatrix",
  "code128",
  "code39",
];

// Letra de ancho fijo para ver bien los separadores. "monospace" no existe en
// iOS: ahí se usa Menlo, que viene instalada.
const letraFija = Platform.select({ ios: "Menlo", default: "monospace" });

/**
 * Pantalla de prueba del escáner: muestra tal cual lo que lee la cámara del
 * código de barras del DNI.
 */
export default function PantallaEscanearDni() {
  // ESTADO. Lo que se leyó (o `null` si todavía no se leyó nada) y el mensaje de
  // error si la cámara no pudo arrancar.
  // (`X | null` en el tipo: guarda una lectura o `null`, y arranca en `null`.)
  const [leido, setLeido] = useState<BarcodeScanningResult | null>(null);
  const [errorCamara, setErrorCamara] = useState<string | null>(null);
  // Linterna y zoom (un custom hook [JS 30], compartido con las otras cámaras).
  const ayudas = useAyudasCamara();

  // La cámara puede avisar el mismo código varias veces antes de que React alcance
  // a volver a dibujar. Con la forma FUNCIONAL [JS 20] el primero gana: si ya
  // había una lectura (`actual`) se la conserva y se descarta la nueva.
  const alEscanear = (resultado: BarcodeScanningResult) => {
    // `a ?? b`: si `a` existe (no es `null` ni `undefined`) se queda con `a`; si no, con `b`.
    setLeido((actual) => actual ?? resultado);
  };

  // Volver a la cámara: se borra la lectura y `CameraView` se vuelve a montar.
  const escanearOtro = () => {
    setLeido(null);
    setErrorCamara(null);
  };

  // Estados derivados [JS 25]: se calculan en cada render a partir de la lectura.
  //  - `campos`: el texto cortado en cada "@".
  //  - `hayExtra`: lo "extra" de Android es un objeto que puede venir vacío.
  //  - `interpretado`: lo que cargaría el registro con ese texto.
  // `split("@")` corta el texto en cada "@" y devuelve un array con los pedazos.
  const campos = leido ? leido.data.split("@") : [];
  // `leido?.extra`: el `?.` (encadenamiento opcional) da `undefined` en vez de fallar
  // si `leido` es `null`. `Object.keys(...)` lista las claves del objeto: si no
  // tiene ninguna, no hay nada "extra" para mostrar.
  const hayExtra = leido?.extra !== undefined && Object.keys(leido.extra).length > 0;
  // Si todavía no se leyó nada, no se interpreta nada (un objeto vacío).
  const interpretado = leido ? leerDatosDni(leido.data) : {};

  return (
    <ScrollView
      style={estilos.pantalla}
      contentContainerStyle={estilos.contenido}
      showsVerticalScrollIndicator={false}
    >
      {/* El cartel que aclara que esto es una prueba y que no se guarda nada. */}
      <Text style={estilos.aclaracion}>
        Pantalla de prueba. Lo que se lee solo se muestra acá: no se guarda ni se
        envía.
      </Text>

      {/* Mientras no se leyó nada se ve la cámara (con su pedido de permiso); al
          leer un código, el resultado. */}
      {leido === null ? (
        <PermisoCamara mensaje="Necesitamos la cámara para leer el código de barras de tu DNI.">
          <Text style={estilos.texto}>
            Apuntá al código de barras del DNI. Si no enfoca, alejá un poco el
            celular y subí el zoom; si hay poca luz, prendé la linterna. Si hay
            reflejos, inclinalo un poco.
          </Text>

          {/* El marco recorta la cámara con bordes redondeados. La cámara solo
              existe MIENTRAS se escanea: al leer algo se quita de la pantalla y
              se libera [SENS 31]. */}
          <View style={estilos.marco}>
            <CameraView
              // `absoluteFill` = pegada a los cuatro bordes del marco.
              style={StyleSheet.absoluteFill}
              facing="back" // la cámara trasera
              enableTorch={ayudas.linterna} // la luz, según el botón Linterna
              zoom={ayudas.zoom} // el zoom elegido (0 a 1)
              // Solo busca los códigos de la lista de arriba.
              barcodeScannerSettings={{ barcodeTypes: tiposDeCodigo }}
              // Se llama cada vez que la cámara detecta un código.
              onBarcodeScanned={alEscanear}
              // Si la cámara no arranca (por ejemplo, en un equipo sin cámara),
              // se guarda el mensaje para mostrarlo.
              onMountError={(evento) => setErrorCamara(evento.message)}
            />
          </View>

          {/* Los botones de linterna y zoom; comparten el estado con la cámara. */}
          <ControlesCamara ayudas={ayudas} />

          {/* El error, si la cámara no pudo abrirse. */}
          {errorCamara ? (
            <Text style={estilos.textoError}>
              No se pudo abrir la cámara: {errorCamara}
            </Text>
          ) : null}
        </PermisoCamara>
      ) : (
        // Los `<> ... </>` agrupan todas las tarjetas del resultado sin sumar una
        // `View` de más.
        <>
          {/* RESULTADO 1: el tipo de código y cuánto texto trajo. */}
          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Tipo de código</Text>
            <Text style={estilos.valor}>{leido.type}</Text>

            <Text style={estilos.rotulo}>Largo</Text>
            <Text style={estilos.valor}>{leido.data.length} caracteres</Text>
          </Tarjeta>

          {/* RESULTADO 2: el texto tal cual salió de la cámara. `selectable`
              permite mantener apretado para copiarlo. */}
          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Texto leído</Text>
            <Text selectable style={estilos.plano}>
              {leido.data}
            </Text>
          </Tarjeta>

          {/* RESULTADO 3: el mismo texto "con escapes". `JSON.stringify` muestra
              los saltos de línea como \n y los caracteres de control como
              \u0000, que a simple vista no se ven. */}
          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Con caracteres invisibles</Text>
            <Text selectable style={estilos.plano}>
              {JSON.stringify(leido.data)}
            </Text>
          </Tarjeta>

          {/* RESULTADO 4: cortado por "@". Si el texto no tiene "@", `split`
              devuelve un solo campo y esta tarjeta no se muestra. */}
          {campos.length > 1 ? (
            <Tarjeta style={estilos.resultado}>
              <Text style={estilos.rotulo}>
                Separado por "@" ({campos.length} campos)
              </Text>
              {/* `key` estable: el número de posición del campo no cambia
                  mientras se muestra esta lectura. */}
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

          {/* RESULTADO 5 (solo Android): el campo `raw`, que es el texto antes de
              que Android lo "interprete" para mostrarlo. En iOS no existe
              (`undefined`) y la tarjeta no se muestra. Sirve para comparar los
              dos celulares. */}
          {leido.raw !== undefined ? (
            <Tarjeta style={estilos.resultado}>
              <Text style={estilos.rotulo}>Raw (solo Android)</Text>
              <Text selectable style={estilos.plano}>
                {JSON.stringify(leido.raw)}
              </Text>
            </Tarjeta>
          ) : null}

          {/* RESULTADO 6 (solo Android): datos "extra" que Android ya separó por
              su cuenta, si reconoció el contenido como algún formato. */}
          {hayExtra ? (
            <Tarjeta style={estilos.resultado}>
              <Text style={estilos.rotulo}>Extra (solo Android)</Text>
              <Text selectable style={estilos.plano}>
                {JSON.stringify(leido.extra, null, 2)}
              </Text>
            </Tarjeta>
          ) : null}

          {/* RESULTADO 7: lo que cargaría el REGISTRO con esta lectura. Cada dato
              solo aparece si pasó las validaciones; si no, queda en "—". */}
          <Tarjeta style={estilos.resultado}>
            <Text style={estilos.rotulo}>Lo que cargaría el registro</Text>
            <FilaDato etiqueta="Nombre" valor={interpretado.nombre} />
            <FilaDato etiqueta="Apellido" valor={interpretado.apellido} />
            <FilaDato etiqueta="Nacimiento" valor={interpretado.fechaNacimiento} />
            <FilaDato etiqueta="DNI" valor={interpretado.dni} />
          </Tarjeta>

          {/* Vuelve a la cámara: borra la lectura y deja escanear otro documento. */}
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

// ---------------------------------------------------------------------------
// COMPONENTE AUXILIAR (privado): una fila "rótulo + valor" del dato interpretado
// ---------------------------------------------------------------------------

// `valor` puede venir `undefined` (el dato no se pudo leer): en ese caso se
// muestra un guion largo apagado.
function FilaDato({ etiqueta, valor }: { etiqueta: string; valor?: string }) {
  return (
    <View style={estilos.filaCampo}>
      <Text style={estilos.etiquetaDato}>{etiqueta}</Text>
      <Text style={valor ? estilos.campo : estilos.sinDato}>
        {/* `valor ?? "..."`: el texto de reemplazo cuando el dato no existe. */}
        {valor ?? "— no se pudo leer"}
      </Text>
    </View>
  );
}

const estilos = StyleSheet.create({
  // Contenedor raíz de la pantalla: ocupa todo el alto disponible.
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  // Relleno del scroll. No lleva `espacioBajoTabs`: esta pantalla está en el
  // Stack raíz, donde no hay barra de tabs.
  contenido: {
    padding: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.lg,
  },

  // Cartel de "pantalla de prueba": chico y tenue para que no compita con lo
  // importante.
  aclaracion: {
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoTenue,
  },

  // El texto de las instrucciones.
  texto: {
    fontSize: 14,
    lineHeight: 20,
    color: colores.textoSuave,
  },

  // El mensaje de error si la cámara no arranca: en rojo.
  textoError: {
    fontSize: 13,
    lineHeight: 19,
    color: colores.alerta,
  },

  // El marco de la cámara: cuadrado (`aspectRatio: 1` = alto igual al ancho), con
  // esquinas redondeadas. `overflow: "hidden"` recorta la cámara en ellas.
  marco: {
    width: "100%",
    aspectRatio: 1,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.superficie,
    overflow: "hidden",
  },

  // Cada tarjeta de resultado separa sus renglones con un hueco chico.
  resultado: {
    gap: espaciado.xs,
  },

  // El nombre de cada dato de una tarjeta de resultado ("Tipo de código").
  rotulo: {
    marginTop: espaciado.xs,
    fontSize: 12,
    fontWeight: "600",
    color: colores.textoTenue,
  },

  // El dato en sí, un poco más grande.
  valor: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  // El texto crudo, en letra de ancho fijo.
  plano: {
    fontSize: 13,
    lineHeight: 19,
    fontFamily: letraFija,
    color: colores.textoSuave,
  },

  // Un campo de la lista: posición (o rótulo) a la izquierda y valor a la derecha.
  filaCampo: {
    flexDirection: "row",
    alignItems: "flex-start",
    gap: espaciado.md,
    paddingVertical: espaciado.xs,
  },

  // Ancho fijo para que todos los valores arranquen alineados.
  posicion: {
    width: 22,
    fontSize: 13,
    fontFamily: letraFija,
    color: colores.azulClaro,
  },

  // El rótulo de los datos interpretados (más ancho: son palabras).
  etiquetaDato: {
    width: 90,
    fontSize: 13,
    fontFamily: letraFija,
    color: colores.azulClaro,
  },

  // `flex: 1` = ocupa lo que sobra y, si es largo, baja de renglón.
  campo: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: letraFija,
    color: colores.texto,
  },

  // Un dato que no se pudo leer: apagado.
  sinDato: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    fontFamily: letraFija,
    color: colores.textoDebil,
  },

  // El botón "Escanear otro": ancho completo y azul.
  boton: {
    alignItems: "center",
    justifyContent: "center",
    height: 50,
    borderRadius: radios.lg,
    backgroundColor: colores.primario,
  },

  // El texto blanco del botón.
  textoBoton: {
    fontSize: 16,
    fontWeight: "700",
    color: colores.blanco,
  },

  // Se suma al botón mientras se aprieta: queda semitransparente.
  presionado: {
    opacity: 0.75,
  },
});
