import { Ionicons } from "@expo/vector-icons";
import { useLocalSearchParams, useRouter } from "expo-router";
import { useState } from "react";
import {
  KeyboardAvoidingView,
  Platform,
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

import { Tarjeta } from "@/componentes/Tarjeta";
import { useSesion } from "@/estado/sesion";
import { colores, espaciado, radios } from "@/tema/colores";
import {
  validarContraseniaLogin,
  validarEmail,
} from "@/utilidades/validaciones";

export default function PantallaLogin() {
  const router = useRouter();
  const { iniciarSesion } = useSesion();
  const { registrado } = useLocalSearchParams<{ registrado?: string }>();

  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [intento, setIntento] = useState(false);
  const [errorIngreso, setErrorIngreso] = useState<string | null>(null);
  const [ingresando, setIngresando] = useState(false);

  const errorEmail = validarEmail(email);
  const errorContrasenia = validarContraseniaLogin(contrasenia);

  const ingresar = async () => {
    setIntento(true);
    if (errorEmail || errorContrasenia || ingresando) return;

    setIngresando(true);
    const resultado = await iniciarSesion(email, contrasenia);
    if (resultado === "contraseniaIncorrecta") {
      setErrorIngreso("La contraseña no es correcta para ese correo.");
      setIngresando(false);
      return;
    }
    router.replace("/inicio");
  };

  const crearCuenta = () => router.push("/registro");

  const probarEscanerDni = () => router.push("/escanear-dni");

  return (
    <SafeAreaView style={estilos.pantalla}>
      <KeyboardAvoidingView
        style={estilos.teclado}
        behavior={Platform.OS === "ios" ? "padding" : undefined}
      >
        <ScrollView
          contentContainerStyle={estilos.contenido}
          keyboardShouldPersistTaps="handled"
          showsVerticalScrollIndicator={false}
        >
          <View style={estilos.marca}>
            <View style={estilos.logo}>
              <Ionicons name="school" size={40} color={colores.azulTenue} />
            </View>
            <Text style={estilos.nombre}>urway</Text>
            <Text style={estilos.lema}>Tu carrera, en un solo lugar.</Text>
          </View>

          <View style={estilos.formulario}>
            {registrado === "1" ? (
              <Tarjeta style={estilos.cuentaCreada}>
                <Ionicons
                  name="checkmark-circle-outline"
                  size={20}
                  color={colores.azulClaro}
                />
                <Text style={estilos.textoCuentaCreada}>
                  Cuenta creada. Ingresá con tu correo y tu contraseña.
                </Text>
              </Tarjeta>
            ) : null}

            <View
              style={[
                estilos.grupoCampos,
                ((intento && (errorEmail || errorContrasenia)) ||
                  errorIngreso) &&
                  estilos.grupoConError,
              ]}
            >
              <View style={estilos.campo}>
                <Ionicons
                  name="mail-outline"
                  size={18}
                  color={colores.textoTenue}
                />
                <TextInput
                  value={email}
                  onChangeText={(texto) => {
                    setEmail(texto);
                    setErrorIngreso(null);
                  }}
                  placeholder="tu.nombre@uca.edu.ar"
                  placeholderTextColor={colores.textoDebil}
                  keyboardType="email-address"
                  autoCapitalize="none"
                  autoCorrect={false}
                  autoComplete="email"
                  textContentType="emailAddress"
                  returnKeyType="next"
                  style={estilos.input}
                />
              </View>

              <View style={estilos.separador} />

              <View style={estilos.campo}>
                <Ionicons
                  name="lock-closed-outline"
                  size={18}
                  color={colores.textoTenue}
                />
                <TextInput
                  value={contrasenia}
                  onChangeText={(texto) => {
                    setContrasenia(texto);
                    setErrorIngreso(null);
                  }}
                  placeholder="Contraseña"
                  placeholderTextColor={colores.textoDebil}
                  secureTextEntry={!mostrarContrasenia}
                  autoCapitalize="none"
                  autoComplete="password"
                  textContentType="password"
                  returnKeyType="go"
                  onSubmitEditing={ingresar}
                  style={estilos.input}
                />
                <Pressable
                  onPress={() => setMostrarContrasenia((actual) => !actual)}
                  hitSlop={10}
                >
                  <Ionicons
                    name={mostrarContrasenia ? "eye-off-outline" : "eye-outline"}
                    size={20}
                    color={colores.textoTenue}
                  />
                </Pressable>
              </View>
            </View>

            {intento && errorEmail ? (
              <Text style={estilos.error}>{errorEmail}</Text>
            ) : null}
            {intento && errorContrasenia ? (
              <Text style={estilos.error}>{errorContrasenia}</Text>
            ) : null}
            {errorIngreso ? (
              <Text style={estilos.error}>{errorIngreso}</Text>
            ) : null}

            <Pressable style={estilos.olvide} hitSlop={8}>
              <Text style={estilos.enlace}>¿Olvidaste tu contraseña?</Text>
            </Pressable>

            <Pressable
              onPress={ingresar}
              style={({ pressed }) => [
                estilos.boton,
                pressed && estilos.presionado,
              ]}
            >
              <Text style={estilos.textoBoton}>Ingresar</Text>
            </Pressable>
          </View>

          <View style={estilos.pie}>
            <Text style={estilos.textoPie}>¿No tenés cuenta?</Text>
            <Pressable onPress={crearCuenta} hitSlop={8}>
              <Text style={estilos.enlace}>Crear cuenta</Text>
            </Pressable>
          </View>

          <Pressable
            onPress={probarEscanerDni}
            hitSlop={8}
            style={({ pressed }) => [estilos.prueba, pressed && estilos.presionado]}
          >
            <Ionicons
              name="scan-outline"
              size={16}
              color={colores.textoTenue}
            />
            <Text style={estilos.textoPrueba}>Escanear DNI (prueba)</Text>
          </Pressable>
        </ScrollView>
      </KeyboardAvoidingView>
    </SafeAreaView>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  teclado: {
    flex: 1,
  },

  contenido: {
    flexGrow: 1,
    paddingHorizontal: espaciado.xl,
    paddingTop: espaciado.xxl * 2,
    paddingBottom: espaciado.xl,
  },

  marca: {
    alignItems: "center",
    gap: espaciado.sm,
  },

  logo: {
    width: 84,
    height: 84,
    borderRadius: radios.xl,
    alignItems: "center",
    justifyContent: "center",
    marginBottom: espaciado.sm,
    backgroundColor: colores.primarioProfundo,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
  },

  nombre: {
    fontSize: 40,
    fontWeight: "800",
    letterSpacing: -1,
    color: colores.azulTenue,
  },

  lema: {
    fontSize: 15,
    color: colores.textoTenue,
  },

  formulario: {
    marginTop: espaciado.xxl + espaciado.lg,
    gap: espaciado.lg,
  },

  grupoCampos: {
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    overflow: "hidden",
  },

  campo: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingHorizontal: espaciado.lg,
    height: 54,
  },

  separador: {
    height: StyleSheet.hairlineWidth,
    marginLeft: espaciado.lg + 18 + espaciado.md,
    backgroundColor: colores.bordeSuave,
  },

  input: {
    flex: 1,
    fontSize: 16,
    color: colores.texto,
    padding: 0,
  },

  grupoConError: {
    borderColor: colores.alerta,
  },

  error: {
    marginTop: -espaciado.sm,
    fontSize: 12,
    color: colores.alerta,
  },

  cuentaCreada: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  textoCuentaCreada: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colores.textoSuave,
  },

  olvide: {
    alignSelf: "flex-end",
  },

  enlace: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  boton: {
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    marginTop: espaciado.sm,
    borderRadius: radios.lg,
    backgroundColor: colores.primario,
  },

  presionado: {
    opacity: 0.75,
  },

  textoBoton: {
    fontSize: 17,
    fontWeight: "700",
    color: colores.blanco,
  },

  pie: {
    marginTop: "auto",
    paddingTop: espaciado.xxl,
    flexDirection: "row",
    justifyContent: "center",
    alignItems: "center",
    gap: espaciado.xs,
  },

  textoPie: {
    fontSize: 14,
    color: colores.textoTenue,
  },

  prueba: {
    alignSelf: "center",
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.xs,
    marginTop: espaciado.lg,
  },

  textoPrueba: {
    fontSize: 13,
    color: colores.textoTenue,
  },
});
