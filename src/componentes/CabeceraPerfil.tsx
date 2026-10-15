import { StyleSheet, Text, View } from "react-native";

import { Avatar } from "@/componentes/Avatar";
import { carrera } from "@/datos/carrera";
import { colores, espaciado, radios } from "@/tema/colores";

type Props = {
  nombre: string;
  cuatrimestre: number;
  carreraTexto?: string;
  universidadTexto?: string;
  contadores: { valor: number; rotulo: string }[];
};

export function CabeceraPerfil({
  nombre,
  cuatrimestre,
  carreraTexto = carrera.nombre,
  universidadTexto = carrera.universidad,
  contadores,
}: Props) {
  return (
    <>
      <View style={estilos.cabecera}>
        <Avatar nombre={nombre} tamanio={96} />
        <Text style={estilos.nombre}>{nombre}</Text>
        <Text style={estilos.carrera}>
          {carreraTexto} · {cuatrimestre}º cuatrimestre
        </Text>
        <Text style={estilos.universidad}>{universidadTexto}</Text>
      </View>

      <View style={estilos.contadores}>
        {contadores.map((contador, indice) => (
          <View
            key={contador.rotulo}
            style={[estilos.contador, indice > 0 && estilos.divisor]}
          >
            <Text style={estilos.valor}>{contador.valor}</Text>
            <Text style={estilos.rotulo}>{contador.rotulo}</Text>
          </View>
        ))}
      </View>
    </>
  );
}

const estilos = StyleSheet.create({
  cabecera: {
    alignItems: "center",
    gap: espaciado.xs,
    paddingTop: espaciado.sm,
    paddingBottom: espaciado.md,
  },

  nombre: {
    marginTop: espaciado.md,
    fontSize: 28,
    fontWeight: "700",
    letterSpacing: -0.6,
    textAlign: "center",
    color: colores.texto,
  },

  carrera: {
    fontSize: 14,
    color: colores.textoSecundario,
  },

  universidad: {
    fontSize: 13,
    color: colores.textoTenue,
  },

  contadores: {
    flexDirection: "row",
    overflow: "hidden",
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    paddingVertical: espaciado.md,
  },

  contador: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },

  divisor: {
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colores.bordeSuave,
  },

  valor: {
    fontSize: 22,
    fontWeight: "700",
    color: colores.texto,
  },

  rotulo: {
    fontSize: 12,
    color: colores.textoTenue,
  },
});
