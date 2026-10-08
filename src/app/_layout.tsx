/**
 * ============================================================================
 * app/_layout.tsx — El Stack raíz: el "esqueleto" de toda la navegación
 * ============================================================================
 *
 * QUÉ ES:
 *   Es el PRIMER archivo que ejecuta la app. En expo-router, un archivo
 *   `_layout.tsx` es un "contenedor" que envuelve a las pantallas de su
 *   carpeta. Este es el de la carpeta `app/` (la raíz), así que envuelve a
 *   TODAS las pantallas.
 *
 * QUÉ HACE, EN TRES PUNTOS:
 *   1. Monta los dos proveedores de Context, así todas las pantallas pueden
 *      usar `useSesion()` (quién inició sesión, guardado en el teléfono) y
 *      `useDatos()` (eventos, solicitudes y apuntes).
 *   2. Crea el Stack: un navegador donde cada pantalla se APILA sobre la
 *      anterior y se vuelve con el botón "atrás" o con el gesto.
 *   3. Configura el aspecto del header nativo UNA sola vez para todas.
 *
 * MAPA DE PANTALLAS (nombre de la pantalla = ruta del archivo dentro de app/):
 *
 *      Stack raíz
 *      ├── index            → bienvenida animada (primera pantalla; sin header)
 *      ├── login            → ingreso (sin header; aparece con un fundido)
 *      ├── (tabs)           → las 4 pestañas (dibujan su propio header)
 *      ├── materia/[id]     → detalle de materia
 *      ├── evento/[id]      → detalle de un evento
 *      ├── evento/nuevo     → formulario para crear un evento
 *      ├── estudiante/[id]  → perfil de otro estudiante
 *      ├── perfil           → mi perfil
 *      ├── notificaciones   → historial de avisos
 *      ├── registro         → crear cuenta (se apila sobre el login)
 *      ├── apunte/camara    → cámara para sacarle una foto a un apunte
 *      └── escanear-dni     → PRUEBA: lectura del código de barras del DNI
 *
 * TEORÍA:
 *   [NAV]  "Stack + Tabs": el Stack raíz contiene al navegador de tabs como una
 *          pantalla más. Las pantallas de detalle van en el Stack (no en las
 *          tabs) para que se abran a pantalla completa y con botón de volver.
 *          `Stack` de expo-router = `createNativeStackNavigator` de la teoría.
 *   [NAV]  `screenOptions`: opciones que se aplican a todas las pantallas;
 *          `options` de cada `Stack.Screen`: solo para esa pantalla.
 *   [JS 29] El Context se monta en el nivel más alto para que lo lean todas.
 *   [CTX]   Dos Context separados, no uno gigante: la sesión casi no cambia y los
 *           datos sí. `ProveedorSesion` va afuera y no dibuja nada hasta leer el
 *           disco (AsyncStorage), así la bienvenida ya sabe si hay sesión.
 *
 * NOTA DE VERSIÓN:
 *   En la teoría aparece `headerBackTitleVisible: false`. En Expo SDK 57 esa
 *   opción se reemplazó por `headerBackButtonDisplayMode: "minimal"`.
 */

// `Stack`: el navegador de tipo pila.
import { Stack } from "expo-router";
// `StatusBar`: la barra de estado del teléfono (hora, batería, señal).
import { StatusBar } from "expo-status-bar";

import { ProveedorDatos } from "@/estado/datos";
import { ProveedorSesion } from "@/estado/sesion";
import { colores } from "@/tema/colores";

/**
 * Stack raíz: es la estructura de la clase de navegadores, un Stack con las
 * Tabs adentro. Sobre él viven, además de las tabs, las pantallas que se
 * apilan a pantalla completa: bienvenida, login, detalles, formulario, perfiles
 * y notificaciones.
 *
 * El header es el nativo del Stack y se configura una sola vez acá: fondo
 * negro, íconos azules y el título de cada pantalla. La bienvenida (`index`,
 * la primera pantalla de la app), el login y el grupo `(tabs)`, que dibuja su
 * propio header, lo apagan.
 */
// `export default`: expo-router toma el export por defecto del archivo como el
// componente de la pantalla/contenedor.
export default function LayoutRaiz() {
  return (
    // Los proveedores del Context envuelven a TODO: así cualquier pantalla puede
    // llamar a `useSesion()` y `useDatos()`. Se anidan; el orden solo importa si
    // uno necesita leer al otro (acá no).
    <ProveedorSesion>
      <ProveedorDatos>
        {/* Texto claro en la barra de estado porque el fondo es negro. */}
        <StatusBar style="light" />
        <Stack
          // OPCIONES COMUNES a todas las pantallas del Stack. Las llaves dobles
          // son: una para "acá va JavaScript" y otra para el objeto.
          screenOptions={{
            headerStyle: { backgroundColor: colores.fondo }, // fondo del header
            headerTintColor: colores.azulClaro, // color de la flecha "volver"
            headerTitleStyle: { color: colores.texto }, // color del título
            headerShadowVisible: false, // sin línea/sombra debajo del header
            // Solo la flecha, sin el texto del título anterior al lado
            // (en la teoría: `headerBackTitleVisible: false`).
            headerBackButtonDisplayMode: "minimal",
            contentStyle: { backgroundColor: colores.fondo }, // fondo detrás de cada pantalla
          }}
        >
          {/* Cada `Stack.Screen` declara una pantalla. El `name` es la ruta del
              archivo dentro de `app/`, sin la extensión. */}

          {/* `index.tsx` = la bienvenida animada. Sin header (es pantalla completa
              y se va sola). */}
          <Stack.Screen name="index" options={{ headerShown: false }} />
          {/* `login.tsx` = el ingreso. Sin header (tiene su propia marca grande).
              `animation: "fade"` hace que aparezca con un fundido: así la
              bienvenida se funde en el login en vez de empujarlo desde un
              costado. */}
          <Stack.Screen
            name="login"
            options={{ headerShown: false, animation: "fade" }}
          />
          {/* `(tabs)` = la carpeta con las 4 pestañas. Sin header del Stack
              porque el de las pestañas lo dibuja el navegador de tabs. */}
          <Stack.Screen name="(tabs)" options={{ headerShown: false }} />
          {/* Las demás muestran el header del Stack, con este título. Los
              corchetes `[id]` indican una ruta DINÁMICA: el valor cambia
              (`/materia/MAT-201`, `/materia/CS-302`...). */}
          <Stack.Screen name="materia/[id]" options={{ title: "Materia" }} />
          <Stack.Screen name="evento/[id]" options={{ title: "Evento" }} />
          <Stack.Screen name="evento/nuevo" options={{ title: "Nuevo evento" }} />
          <Stack.Screen name="estudiante/[id]" options={{ title: "Perfil" }} />
          <Stack.Screen name="perfil" options={{ title: "Perfil" }} />
          <Stack.Screen
            name="notificaciones"
            options={{ title: "Notificaciones" }}
          />
          {/* El registro se abre desde "Crear cuenta" del login y se apila
              encima de él (con flecha para volver). */}
          <Stack.Screen name="registro" options={{ title: "Crear cuenta" }} />
          {/* La cámara de apuntes se abre desde "Sacar foto" de una materia. */}
          <Stack.Screen name="apunte/camara" options={{ title: "Foto del apunte" }} />
          {/* Pantalla de prueba del escáner de DNI (se abre desde el login). */}
          <Stack.Screen name="escanear-dni" options={{ title: "Escanear DNI" }} />
        </Stack>
      </ProveedorDatos>
    </ProveedorSesion>
  );
}
