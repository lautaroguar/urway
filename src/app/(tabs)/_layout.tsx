/**
 * ============================================================================
 * app/(tabs)/_layout.tsx — El navegador de pestañas (Bottom Tabs)
 * ============================================================================
 *
 * QUÉ ES:
 *   El contenedor de las 4 pestañas: Inicio · Plan · Agenda · Conectar. Cada
 *   pestaña es un ARCHIVO de esta carpeta (`inicio.tsx`, `plan.tsx`,
 *   `agenda.tsx`, `conectar.tsx`).
 *
 * POR QUÉ LA CARPETA SE LLAMA `(tabs)` (con paréntesis):
 *   Los paréntesis definen un "grupo": sirven para agrupar archivos sin agregar
 *   nada a la URL. La pestaña de Inicio es `/inicio`, no `/(tabs)/inicio`.
 *
 * QUÉ HACE:
 *   1. Declara los cuatro `Tabs.Screen`, uno por archivo.
 *   2. Reemplaza la barra de abajo por la propia (`BarraDeTabs`) mediante la
 *      prop `tabBar`.
 *   3. Declara el header UNA sola vez: el logo a la izquierda (`MarcaHeader`) y
 *      la campana + avatar a la derecha (`AccionesHeader`).
 *
 * TEORÍA:
 *   [NAV] Bottom Tab Navigator: "las rutas se montan lazy, al enfocarse".
 *   [NAV] Barra personalizada: la teoría usa `tabBarComponent`; en expo-router
 *         la prop se llama `tabBar` y recibe una función que devuelve el
 *         componente.
 *   [NAV] Opciones del header (`headerLeft`, `headerRight`, `headerStyle`,
 *         `headerTitle`) declaradas en `screenOptions` para todas las pestañas.
 *   [JS 7] `{...props}`: SPREAD de las props (pasa todas las props que el
 *          navegador entrega a `BarraDeTabs`).
 *
 * NOTA DE VERSIÓN:
 *   En Expo SDK 57, `Tabs` se importa de `"expo-router/js-tabs"`; importarlo de
 *   `"expo-router"` está deprecado.
 */
import { Tabs } from "expo-router/js-tabs";

import { BarraDeTabs } from "@/componentes/BarraDeTabs";
import { AccionesHeader, MarcaHeader } from "@/componentes/EncabezadoMarca";
import { colores } from "@/tema/colores";

/**
 * `expo-router/js-tabs` en vez de `expo-router`: desde el SDK 57 importar
 * `Tabs` desde la raíz del paquete está deprecado.
 *
 * Cada pestaña es un archivo de esta carpeta (`inicio.tsx`, `plan.tsx`,
 * `agenda.tsx` y `conectar.tsx`). El header es el de las Tabs y se declara una
 * sola vez: el logo a la izquierda y la campana y el avatar a la derecha.
 */
export default function LayoutTabs() {
  return (
    <Tabs
      // Opciones comunes a las cuatro pestañas.
      screenOptions={{
        headerTitle: "", // sin título: en su lugar va el logo
        // `headerLeft`/`headerRight` reciben una FUNCIÓN que devuelve el
        // componente a dibujar en cada extremo del header.
        headerLeft: () => <MarcaHeader />,
        headerRight: () => <AccionesHeader />,
        headerStyle: { backgroundColor: colores.fondo },
        headerShadowVisible: false, // sin línea debajo del header
      }}
      // Reemplaza la barra de abajo por la propia. El navegador entrega `props`
      // (con `state`, `navigation`...) y se las reenvía todas a `BarraDeTabs`
      // con el spread `{...props}`.
      tabBar={(props) => <BarraDeTabs {...props} />}
    >
      {/* Una pestaña por archivo. El `name` es el nombre del archivo sin la
          extensión y tiene que coincidir con la lista `TABS` de `BarraDeTabs`. */}
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="conectar" />
    </Tabs>
  );
}
