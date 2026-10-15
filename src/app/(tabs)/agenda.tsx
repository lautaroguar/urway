import { Ionicons } from "@expo/vector-icons";
import { useRouter } from "expo-router";
import { useState } from "react";
import { Pressable, StyleSheet, Text, View } from "react-native";

import { SemanaCalendario } from "@/componentes/SemanaCalendario";
import { useDatos } from "@/estado/datos";
import { colores, espaciado, radios } from "@/tema/colores";
import {
  etiquetaSemana,
  inicioDeSemana,
  sumarDias,
} from "@/utilidades/fechas";

export default function PantallaAgenda() {
  const router = useRouter();
  const { eventos } = useDatos();

  const [semana, setSemana] = useState(0);

  const inicioSemana = inicioDeSemana(sumarDias(new Date(), semana * 7));

  return (
    <View style={estilos.pantalla}>
      <View style={estilos.cabecera}>
        <Text style={estilos.titulo}>Agenda</Text>
        <Pressable
          onPress={() => router.push("/evento/nuevo")}
          hitSlop={8}
          accessibilityLabel="Crear evento"
          style={estilos.botonMas}
        >
          <Ionicons name="add" size={20} color={colores.blanco} />
        </Pressable>
      </View>

      <View style={estilos.navegador}>
        <Text style={estilos.semana}>{etiquetaSemana(inicioSemana)}</Text>

        <View style={estilos.controles}>
          <BotonFlecha
            icono="chevron-back"
            descripcion="Semana anterior"
            alTocar={() => setSemana((actual) => actual - 1)}
          />
          <Pressable
            onPress={() => setSemana(0)}
            disabled={semana === 0}
            style={({ pressed }) => [
              estilos.botonHoy,
              semana === 0 && estilos.apagado,
              pressed && estilos.presionado,
            ]}
          >
            <Text style={estilos.textoHoy}>Hoy</Text>
          </Pressable>
          <BotonFlecha
            icono="chevron-forward"
            descripcion="Semana siguiente"
            alTocar={() => setSemana((actual) => actual + 1)}
          />
        </View>
      </View>

      <SemanaCalendario
        eventos={eventos}
        inicioSemana={inicioSemana}
        alTocarEvento={(id) => router.push(`/evento/${id}`)}
      />
    </View>
  );
}

type PropsFlecha = {
  icono: "chevron-back" | "chevron-forward";
  descripcion: string;
  alTocar: () => void;
};

function BotonFlecha({ icono, descripcion, alTocar }: PropsFlecha) {
  return (
    <Pressable
      onPress={alTocar}
      hitSlop={6}
      accessibilityLabel={descripcion}
      style={({ pressed }) => [estilos.flecha, pressed && estilos.presionado]}
    >
      <Ionicons name={icono} size={18} color={colores.textoSuave} />
    </Pressable>
  );
}

const estilos = StyleSheet.create({
  pantalla: {
    flex: 1,
    backgroundColor: colores.fondo,
  },

  cabecera: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.lg,
    paddingTop: espaciado.lg,
  },

  titulo: {
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colores.texto,
  },

  botonMas: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: colores.primario,
  },

  navegador: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingHorizontal: espaciado.lg,
    paddingTop: espaciado.sm,
    paddingBottom: espaciado.md,
  },

  semana: {
    fontSize: 17,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: colores.textoSuave,
  },

  controles: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.sm,
  },

  flecha: {
    width: 32,
    height: 32,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
  },

  botonHoy: {
    height: 32,
    justifyContent: "center",
    paddingHorizontal: espaciado.md,
    borderRadius: radios.pastilla,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
  },

  textoHoy: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  apagado: {
    opacity: 0.4,
  },

  presionado: {
    opacity: 0.7,
  },
});
