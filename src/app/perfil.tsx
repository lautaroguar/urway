import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/componentes/Avatar";
import { CabeceraPerfil } from "@/componentes/CabeceraPerfil";
import { estudiante } from "@/datos/carrera";
import { estudiantes } from "@/datos/comunidad";
import { carreras, etiquetaDe, facultades } from "@/datos/registro";
import { useDatos } from "@/estado/datos";
import { useSesion } from "@/estado/sesion";
import { colores, espaciado, radios } from "@/tema/colores";
import { codigosEnCurso } from "@/utilidades/materias";
import { cruzarMaterias } from "@/utilidades/recomendaciones";
import { nombreCompleto } from "@/utilidades/usuario";

export default function PantallaPerfil() {
  const router = useRouter();
  const { apuntes, materias } = useDatos();
  const { usuario, esDemo, cerrarSesion } = useSesion();

  const datosDelUsuario = usuario
    ? [
        { rotulo: "Correo", valor: usuario.email },
        { rotulo: "DNI", valor: usuario.dni },
        { rotulo: "Nacimiento", valor: usuario.fechaNacimiento },
        { rotulo: "Facultad", valor: etiquetaDe(facultades, usuario.facultad) },
        { rotulo: "Carrera", valor: etiquetaDe(carreras, usuario.carrera) },
      ].filter(
        (dato): dato is { rotulo: string; valor: string } =>
          dato.valor !== undefined
      )
    : [];

  const enCurso = materias.filter((materia) => materia.estado === "cursando");
  const amigos = cruzarMaterias(
    estudiantes.filter((persona) => persona.esAmigo),
    codigosEnCurso(materias)
  );

  const alCerrarSesion = () => {
    cerrarSesion();
    router.dismissAll();
    router.replace("/login");
  };

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <CabeceraPerfil
          nombre={nombreCompleto(usuario)}
          cuatrimestre={estudiante.cuatrimestreActual}
          carreraTexto={
            usuario && !esDemo ? etiquetaDe(carreras, usuario.carrera) : undefined
          }
          universidadTexto={
            usuario && !esDemo
              ? etiquetaDe(facultades, usuario.facultad)
              : undefined
          }
          contadores={[
            { valor: amigos.length, rotulo: "Amigos" },
            { valor: enCurso.length, rotulo: "Materias" },
            { valor: apuntes.length, rotulo: "Apuntes" },
          ]}
        />

        <Text style={estilos.tituloSeccion}>Mis datos</Text>

        <View style={estilos.grupo}>
          {datosDelUsuario.map((dato, indice) => (
            <View
              key={dato.rotulo}
              style={[estilos.filaDato, indice > 0 && estilos.separador]}
            >
              <Text style={estilos.rotuloDato}>{dato.rotulo}</Text>
              <Text style={estilos.valorDato}>{dato.valor}</Text>
            </View>
          ))}
        </View>

        <Text style={estilos.tituloSeccion}>Amigos</Text>

        <View style={estilos.grupo}>
          {amigos.length === 0 ? (
            <Text style={estilos.textoVacio}>
              Todavía no agregaste a nadie. Buscá compañeros en Conectar.
            </Text>
          ) : (
            amigos.map((persona, indice) => (
              <Pressable
                key={persona.id}
                onPress={() => router.push(`/estudiante/${persona.id}`)}
                style={({ pressed }) => [
                  estilos.fila,
                  indice > 0 && estilos.separador,
                  pressed && estilos.presionado,
                ]}
              >
                <Avatar nombre={persona.nombre} tamanio={38} />
                <View style={estilos.textoFila}>
                  <Text style={estilos.tituloFila}>{persona.nombre}</Text>
                  <Text style={estilos.subtituloFila}>
                    {persona.amigos} {persona.amigos === 1 ? "amigo" : "amigos"}
                    {" · "}
                    {persona.enComun.length > 0
                      ? `${persona.enComun.length} ${
                          persona.enComun.length === 1 ? "materia" : "materias"
                        } en común`
                      : `${persona.cuatrimestre}º cuatrimestre`}
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colores.textoDebil}
                />
              </Pressable>
            ))
          )}
        </View>

        <Text style={estilos.tituloSeccion}>Materias que estoy cursando</Text>

        <View style={estilos.grupo}>
          {enCurso.map((materia, indice) => (
            <Pressable
              key={materia.id}
              onPress={() => router.push(`/materia/${materia.id}`)}
              style={({ pressed }) => [
                estilos.filaMateria,
                indice > 0 && estilos.separador,
                pressed && estilos.presionado,
              ]}
            >
              <View style={estilos.encabezadoMateria}>
                <View style={estilos.textoFila}>
                  <Text style={estilos.tituloFila}>{materia.nombre}</Text>
                  <Text style={estilos.subtituloFila}>
                    {materia.id} · {materia.creditos} créditos
                  </Text>
                </View>
                <Ionicons
                  name="chevron-forward"
                  size={18}
                  color={colores.textoDebil}
                />
              </View>
            </Pressable>
          ))}
          {enCurso.length === 0 ? (
            <Text style={estilos.textoVacio}>
              No estás cursando ninguna materia.
            </Text>
          ) : null}
        </View>

        <Pressable
          onPress={alCerrarSesion}
          style={({ pressed }) => [
            estilos.grupo,
            estilos.botonSalir,
            pressed && estilos.presionado,
          ]}
        >
          <Ionicons name="log-out-outline" size={20} color={colores.alerta} />
          <Text style={estilos.textoSalir}>Cerrar sesión</Text>
        </Pressable>
      </ScrollView>
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
    paddingHorizontal: espaciado.lg,
    paddingBottom: espaciado.xxl,
    gap: espaciado.md,
  },

  grupo: {
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    overflow: "hidden",
  },

  tituloSeccion: {
    marginTop: espaciado.md,
    fontSize: 20,
    fontWeight: "700",
    letterSpacing: -0.3,
    color: colores.texto,
  },

  fila: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  filaDato: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  rotuloDato: {
    fontSize: 13,
    color: colores.textoTenue,
  },

  valorDato: {
    flex: 1,
    fontSize: 14,
    fontWeight: "600",
    textAlign: "right",
    color: colores.texto,
  },

  separador: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.bordeSuave,
  },

  textoFila: {
    flex: 1,
  },

  tituloFila: {
    fontSize: 15,
    fontWeight: "600",
    color: colores.texto,
  },

  subtituloFila: {
    marginTop: 2,
    fontSize: 12,
    color: colores.textoTenue,
  },

  textoVacio: {
    padding: espaciado.lg,
    fontSize: 13,
    color: colores.textoDebil,
  },

  filaMateria: {
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.lg,
  },

  encabezadoMateria: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
  },

  botonSalir: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    gap: espaciado.sm,
    marginTop: espaciado.xl,
    paddingVertical: espaciado.md + 2,
  },

  presionado: {
    opacity: 0.6,
  },

  textoSalir: {
    fontSize: 16,
    fontWeight: "600",
    color: colores.alerta,
  },
});
