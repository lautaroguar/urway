import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState, type ReactNode } from "react";
import {
  Pressable,
  ScrollView,
  StyleSheet,
  Text,
  TextInput,
  View,
  type TextInputProps,
} from "react-native";

import { EscanerDni } from "@/componentes/EscanerDni";
import { OpcionesPregunta } from "@/componentes/OpcionesPregunta";
import { Tarjeta } from "@/componentes/Tarjeta";
import { carreras, facultades } from "@/datos/registro";
import { useSesion } from "@/estado/sesion";
import { colores, espaciado, radios } from "@/tema/colores";
import { leerDatosDni } from "@/utilidades/dni";
import {
  formatearFecha,
  soloDigitos,
  validarContrasenia,
  validarDni,
  validarEmail,
  validarFechaNacimiento,
  validarNombre,
} from "@/utilidades/validaciones";

type AvisoDni = { bueno: boolean; texto: string };

export default function PantallaRegistro() {
  const router = useRouter();
  const { existeCorreo, registrar } = useSesion();

  const [nombre, setNombre] = useState("");
  const [apellido, setApellido] = useState("");
  const [fechaNacimiento, setFechaNacimiento] = useState("");
  const [dni, setDni] = useState("");
  const [email, setEmail] = useState("");
  const [contrasenia, setContrasenia] = useState("");
  const [mostrarContrasenia, setMostrarContrasenia] = useState(false);
  const [facultad, setFacultad] = useState<string | null>(null);
  const [carrera, setCarrera] = useState<string | null>(null);
  const [intento, setIntento] = useState(false);
  const [escaneando, setEscaneando] = useState(false);
  const [avisoDni, setAvisoDni] = useState<AvisoDni | null>(null);
  const [guardando, setGuardando] = useState(false);
  const [errorGuardado, setErrorGuardado] = useState<string | null>(null);

  const errorNombre = validarNombre(nombre, "nombre");
  const errorApellido = validarNombre(apellido, "apellido");
  const errorFecha = validarFechaNacimiento(fechaNacimiento);
  const errorDni = validarDni(dni);
  const errorEmail =
    validarEmail(email) ??
    (existeCorreo(email)
      ? "Ya existe una cuenta con ese correo. Ingresá desde el login."
      : null);
  const errorContrasenia = validarContrasenia(contrasenia);
  const errorFacultad = facultad === null ? "Elegí una opción." : null;
  const errorCarrera = carrera === null ? "Elegí una opción." : null;
  const hayErrores = Boolean(
    errorNombre ||
      errorApellido ||
      errorFecha ||
      errorDni ||
      errorEmail ||
      errorContrasenia ||
      errorFacultad ||
      errorCarrera
  );

  const alLeerDni = (texto: string) => {
    const datos = leerDatosDni(texto);
    if (datos.nombre) setNombre(datos.nombre);
    if (datos.apellido) setApellido(datos.apellido);
    if (datos.fechaNacimiento) setFechaNacimiento(datos.fechaNacimiento);
    if (datos.dni) setDni(datos.dni);

    const leidos = Object.keys(datos).length;
    if (leidos === 0) {
      setAvisoDni({
        bueno: false,
        texto:
          "Leímos el código pero no pudimos usar sus datos. Probá de nuevo o completalos a mano.",
      });
    } else if (leidos === 4) {
      setAvisoDni({
        bueno: true,
        texto: "Leímos los 4 datos de tu DNI. Revisá que estén bien.",
      });
    } else {
      setAvisoDni({
        bueno: true,
        texto: `Leímos ${leidos} de 4 datos. Completá los que faltan y revisá los demás.`,
      });
    }
    setEscaneando(false);
  };

  const crearCuenta = async () => {
    setIntento(true);
    if (hayErrores || guardando || facultad === null || carrera === null) return;

    setGuardando(true);
    setErrorGuardado(null);
    try {
      await registrar({
        nombre: nombre.trim(),
        apellido: apellido.trim(),
        fechaNacimiento,
        dni,
        email,
        contrasenia,
        facultad,
        carrera,
      });
    } catch {
      setErrorGuardado("No se pudo guardar la cuenta. Probá de nuevo.");
      setGuardando(false);
      return;
    }

    router.dismissAll();
    router.replace({ pathname: "/login", params: { registrado: "1" } });
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
        keyboardShouldPersistTaps="handled"
        automaticallyAdjustKeyboardInsets
      >
        <Text style={estilos.titulo}>Tus datos</Text>

        {escaneando ? (
          <EscanerDni
            alLeer={alLeerDni}
            alCancelar={() => setEscaneando(false)}
          />
        ) : (
          <Pressable
            onPress={() => {
              setAvisoDni(null);
              setEscaneando(true);
            }}
            style={({ pressed }) => [
              estilos.botonEscanear,
              pressed && estilos.presionado,
            ]}
          >
            <Ionicons name="scan-outline" size={26} color={colores.azulClaro} />
            <View style={estilos.textosEscanear}>
              <Text style={estilos.tituloEscanear}>Escanear mi DNI</Text>
              <Text style={estilos.detalleEscanear}>
                Completamos tus datos con el código de barras.
              </Text>
            </View>
          </Pressable>
        )}

        {avisoDni ? (
          <Tarjeta style={estilos.aviso}>
            <Ionicons
              name={avisoDni.bueno ? "checkmark-circle-outline" : "alert-circle-outline"}
              size={20}
              color={avisoDni.bueno ? colores.azulClaro : colores.alerta}
            />
            <Text style={estilos.textoAviso}>{avisoDni.texto}</Text>
          </Tarjeta>
        ) : null}

        <Text style={estilos.o}>O completalos a mano</Text>

        <CampoTexto
          etiqueta="Nombre"
          error={errorNombre}
          mostrarError={intento}
          value={nombre}
          onChangeText={setNombre}
          placeholder="Juan Carlos"
          autoCapitalize="words"
          autoComplete="name-given"
          textContentType="givenName"
          maxLength={40}
        />

        <CampoTexto
          etiqueta="Apellido"
          error={errorApellido}
          mostrarError={intento}
          value={apellido}
          onChangeText={setApellido}
          placeholder="Pérez"
          autoCapitalize="words"
          autoComplete="name-family"
          textContentType="familyName"
          maxLength={40}
        />

        <CampoTexto
          etiqueta="Fecha de nacimiento"
          error={errorFecha}
          mostrarError={intento}
          value={fechaNacimiento}
          onChangeText={(texto) => setFechaNacimiento(formatearFecha(texto))}
          placeholder="DD/MM/AAAA"
          keyboardType="number-pad"
          maxLength={10}
        />

        <CampoTexto
          etiqueta="DNI"
          error={errorDni}
          mostrarError={intento}
          value={dni}
          onChangeText={(texto) => setDni(soloDigitos(texto, 8))}
          placeholder="12345678"
          keyboardType="number-pad"
          maxLength={8}
        />

        <Text style={estilos.titulo}>Tu cuenta</Text>

        <CampoTexto
          etiqueta="Correo electrónico"
          error={errorEmail}
          mostrarError={intento}
          value={email}
          onChangeText={setEmail}
          placeholder="tu.nombre@uca.edu.ar"
          keyboardType="email-address"
          autoCapitalize="none"
          autoCorrect={false}
          autoComplete="email"
          textContentType="emailAddress"
        />

        <CampoTexto
          etiqueta="Contraseña"
          error={errorContrasenia}
          mostrarError={intento}
          value={contrasenia}
          onChangeText={setContrasenia}
          placeholder="Mínimo 8, con letras y números"
          secureTextEntry={!mostrarContrasenia}
          autoCapitalize="none"
          autoComplete="password-new"
          textContentType="newPassword"
          maxLength={64}
          derecha={
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
          }
        />

        <Text style={estilos.titulo}>Tu carrera</Text>

        <OpcionesPregunta
          pregunta="¿A qué facultad vas?"
          opciones={facultades}
          valor={facultad}
          alElegir={setFacultad}
          error={intento ? errorFacultad : null}
        />

        <OpcionesPregunta
          pregunta="¿Qué carrera cursás?"
          opciones={carreras}
          valor={carrera}
          alElegir={setCarrera}
          error={intento ? errorCarrera : null}
        />

        <Pressable
          onPress={crearCuenta}
          disabled={guardando}
          style={({ pressed }) => [
            estilos.boton,
            (pressed || guardando) && estilos.presionado,
          ]}
        >
          <Text style={estilos.textoBoton}>
            {guardando ? "Creando cuenta…" : "Crear cuenta"}
          </Text>
        </Pressable>

        {intento && hayErrores ? (
          <Text style={estilos.errorGeneral}>
            Revisá los campos marcados antes de crear la cuenta.
          </Text>
        ) : null}

        {errorGuardado ? (
          <Text style={estilos.errorGeneral}>{errorGuardado}</Text>
        ) : null}
      </ScrollView>
    </View>
  );
}

type PropsCampo = TextInputProps & {
  etiqueta: string;
  error: string | null;
  mostrarError: boolean;
  derecha?: ReactNode;
};

function CampoTexto({
  etiqueta,
  error,
  mostrarError,
  derecha,
  ...resto
}: PropsCampo) {
  const hayError = mostrarError && error !== null;

  return (
    <View style={estilos.campo}>
      <Text style={estilos.etiquetaCampo}>{etiqueta}</Text>
      <View style={[estilos.caja, hayError && estilos.cajaConError]}>
        <TextInput
          placeholderTextColor={colores.textoDebil}
          style={estilos.input}
          {...resto}
        />
        {derecha}
      </View>
      {hayError ? <Text style={estilos.error}>{error}</Text> : null}
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
    gap: espaciado.lg,
  },

  titulo: {
    marginTop: espaciado.sm,
    fontSize: 18,
    fontWeight: "700",
    color: colores.texto,
  },

  botonEscanear: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.primarioProfundo,
    padding: espaciado.lg,
  },

  textosEscanear: {
    flex: 1,
    gap: 2,
  },

  tituloEscanear: {
    fontSize: 15,
    fontWeight: "700",
    color: colores.azulPalido,
  },

  detalleEscanear: {
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoSecundario,
  },

  aviso: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  textoAviso: {
    flex: 1,
    fontSize: 13,
    lineHeight: 19,
    color: colores.textoSuave,
  },

  o: {
    fontSize: 12,
    fontWeight: "600",
    textAlign: "center",
    color: colores.textoTenue,
  },

  campo: {
    gap: espaciado.sm,
  },

  etiquetaCampo: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    textTransform: "uppercase",
    color: colores.textoTenue,
  },

  caja: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    borderRadius: radios.md,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    paddingHorizontal: espaciado.md,
  },

  cajaConError: {
    borderColor: colores.alerta,
  },

  input: {
    flex: 1,
    paddingVertical: espaciado.md,
    paddingHorizontal: 0,
    fontSize: 15,
    color: colores.textoSuave,
  },

  error: {
    fontSize: 12,
    color: colores.alerta,
  },

  boton: {
    alignItems: "center",
    justifyContent: "center",
    height: 54,
    marginTop: espaciado.sm,
    borderRadius: radios.lg,
    backgroundColor: colores.primario,
  },

  textoBoton: {
    fontSize: 17,
    fontWeight: "700",
    color: colores.blanco,
  },

  errorGeneral: {
    fontSize: 13,
    textAlign: "center",
    color: colores.alerta,
  },

  presionado: {
    opacity: 0.7,
  },
});
