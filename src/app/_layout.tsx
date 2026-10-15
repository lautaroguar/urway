import { Stack } from "expo-router";
import { StatusBar } from "expo-status-bar";

import { ProveedorDatos } from "@/estado/datos";
import { ProveedorSesion } from "@/estado/sesion";
import { colores } from "@/tema/colores";

export default function LayoutRaiz() {
  return (
    <ProveedorSesion>
      <ProveedorDatos>
        <StatusBar style="light" />
        <Stack
          screenOptions={{
            headerStyle: { backgroundColor: colores.fondo },
            headerTintColor: colores.azulClaro,
            headerTitleStyle: { color: colores.texto },
            headerShadowVisible: false,
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: colores.fondo },
          }}
        >

          <Stack.Screen name="index" options={{ headerShown: false }} />
          <Stack.Screen
            name="login"
            options={{ headerShown: false, animation: "fade" }}
          />
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          <Stack.Screen name="materia/[id]" options={{ title: "Materia" }} />
          <Stack.Screen name="evento/[id]" options={{ title: "Evento" }} />
          <Stack.Screen name="evento/nuevo" options={{ title: "Nuevo evento" }} />
          <Stack.Screen name="estudiante/[id]" options={{ title: "Perfil" }} />
          <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
          <Stack.Screen
            name="notificaciones"
            options={{ title: "Notificaciones" }}
          />
          <Stack.Screen name="registro" options={{ title: "Crear cuenta" }} />
          <Stack.Screen name="apunte/camara" options={{ title: "Foto del apunte" }} />
          <Stack.Screen name="escanear-dni" options={{ title: "Escanear DNI" }} />
        </Stack>
      </ProveedorDatos>
    </ProveedorSesion>
  );
}
