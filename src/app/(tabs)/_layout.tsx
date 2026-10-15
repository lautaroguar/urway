import { Tabs } from "expo-router/js-tabs";

import { BarraDeTabs } from "@/componentes/BarraDeTabs";
import { AccionesHeader, MarcaHeader } from "@/componentes/EncabezadoMarca";
import { colores } from "@/tema/colores";

export default function LayoutTabs() {
  return (
    <Tabs
      screenOptions={{
        headerTitle: "",
        headerLeft: () => <MarcaHeader />,
        headerRight: () => <AccionesHeader />,
        headerStyle: { backgroundColor: colores.fondo },
        headerShadowVisible: false,
      }}
      tabBar={(props) => <BarraDeTabs {...props} />}
    >
      <Tabs.Screen name="inicio" />
      <Tabs.Screen name="plan" />
      <Tabs.Screen name="agenda" />
      <Tabs.Screen name="conectar" />
    </Tabs>
  );
}
