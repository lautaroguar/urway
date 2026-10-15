import { Ionicons } from "@expo/vector-icons";
import { Link, useRouter } from "expo-router";
import { Pressable, ScrollView, StyleSheet, Text, View } from "react-native";

import { BarraProgreso } from "@/componentes/BarraProgreso";
import { CirculoProgreso } from "@/componentes/CirculoProgreso";
import { FilaEvento } from "@/componentes/FilaEvento";
import { Tarjeta } from "@/componentes/Tarjeta";
import { estudiante } from "@/datos/carrera";
import { novedades } from "@/datos/novedades";
import { useDatos } from "@/estado/datos";
import { useSesion } from "@/estado/sesion";
import {
  colores,
  espaciado,
  espacioBajoTabs,
  radios,
} from "@/tema/colores";
import {
  avanceCuatrimestre,
  type AvanceCuatrimestre,
} from "@/utilidades/cuatrimestre";
import { claveFecha } from "@/utilidades/fechas";
import {
  promedioDe,
  resumenCarrera,
} from "@/utilidades/materias";
import { primerNombre } from "@/utilidades/usuario";

export default function PantallaInicio() {
  const router = useRouter();
  const { eventos, materias } = useDatos();
  const { usuario } = useSesion();

  const hoy = claveFecha(new Date());

  const eventosDeHoy = eventos
    .filter((evento) => evento.fecha === hoy)
    .sort((a, b) => a.desde.localeCompare(b.desde));

  const fechasProximas = eventos
    .filter(
      (evento) =>
        evento.fecha >= hoy &&
        (evento.tipo === "parcial" || evento.tipo === "entrega")
    )
    .sort((a, b) =>
      `${a.fecha}${a.desde}`.localeCompare(`${b.fecha}${b.desde}`)
    )
    .slice(0, 3);

  const materiasEnCurso = materias.filter(
    (materia) => materia.estado === "cursando"
  );
  const finalesPendientes = materias.filter(
    (materia) => materia.estado === "pendienteFinal"
  );

  const resumen = resumenCarrera(materias);
  const promedio = promedioDe(materias);

  const avanceCarrera = resumen.materiasAprobadas / resumen.materiasTotales;

  const cuatrimestre = avanceCuatrimestre();

  return (
    <View style={estilos.pantalla}>
      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={estilos.hero}>
          <Text style={estilos.saludo}>Hola, {primerNombre(usuario)}</Text>
          <Text style={estilos.contexto}>
            {estudiante.cuatrimestreActual}º cuatrimestre · En curso
          </Text>
        </View>

        <View style={estilos.tiles}>
          <Tile
            valor={promedio === null ? "—" : promedio.toFixed(1)}
            rotulo="Promedio"
            icono="star-outline"
          />
          <Tile
            valor={`${resumen.creditosObtenidos}`}
            sufijo={`/${resumen.creditosTotales}`}
            rotulo="Créditos"
            icono="trending-up"
          />
          <Tile
            valor={`${resumen.finalesAprobados}`}
            rotulo="Finales"
            icono="checkmark-circle-outline"
          />
          <TileCuatrimestre avance={cuatrimestre} />
        </View>

        <Tarjeta style={estilos.tarjetaAvance}>
          <View style={estilos.filaAvance}>
            <Text style={estilos.rotuloAvance}>Avance de la carrera</Text>
            <Text style={estilos.porcentaje}>
              {Math.round(avanceCarrera * 100)}%
            </Text>
          </View>
          <BarraProgreso valor={avanceCarrera} alto={6} />
          <Text style={estilos.detalleAvance}>
            {resumen.materiasAprobadas} de {resumen.materiasTotales} materias
            aprobadas
          </Text>
        </Tarjeta>

        <Seccion titulo="Hoy" enlace="/agenda" textoEnlace="Ver agenda" />

        {eventosDeHoy.length === 0 ? (
          <Tarjeta style={estilos.tarjetaVacia}>
            <Ionicons name="sunny-outline" size={22} color={colores.textoTenue} />
            <Text style={estilos.textoVacio}>No tenés clases hoy.</Text>
          </Tarjeta>
        ) : (
          eventosDeHoy.map((evento) => (
            <FilaEvento
              key={evento.id}
              evento={evento}
              alTocar={() => router.push(`/evento/${evento.id}`)}
            />
          ))
        )}

        <Seccion
          titulo="Materias en curso"
          enlace="/plan"
          textoEnlace="Ver plan"
        />

        {materiasEnCurso.length === 0 ? (
          <Tarjeta style={estilos.tarjetaVacia}>
            <Ionicons name="book-outline" size={22} color={colores.textoTenue} />
            <Text style={estilos.textoVacio}>
              No estás cursando ninguna materia.
            </Text>
          </Tarjeta>
        ) : (
          <View style={estilos.filaMaterias}>
            {materiasEnCurso.map((materia) => (
              <Pressable
                key={materia.id}
                onPress={() => router.push(`/materia/${materia.id}`)}
                style={({ pressed }) => [
                  estilos.tarjetaMateria,
                  pressed && estilos.presionado,
                ]}
              >
                <View style={estilos.filaMateria}>
                  <Text style={estilos.codigoMateria}>{materia.id}</Text>
                  <Ionicons name="sync" size={14} color={colores.azulClaro} />
                </View>

                <Text style={estilos.nombreMateria} numberOfLines={2}>
                  {materia.nombre}
                </Text>

                <Text style={estilos.creditosMateria}>
                  {materia.creditos} créditos
                </Text>
              </Pressable>
            ))}
          </View>
        )}

        {finalesPendientes.length > 0 ? (
          <>
            <Seccion titulo="Finales pendientes" />
            <Tarjeta style={estilos.tarjetaNovedades}>
              {finalesPendientes.map((materia, indice) => (
                <Pressable
                  key={materia.id}
                  onPress={() => router.push(`/materia/${materia.id}`)}
                  style={({ pressed }) => [
                    estilos.filaNovedad,
                    indice > 0 && estilos.separador,
                    pressed && estilos.presionado,
                  ]}
                >
                  <Ionicons
                    name="hourglass-outline"
                    size={18}
                    color={colores.azulClaro}
                  />
                  <View style={estilos.textoNovedad}>
                    <Text style={estilos.tituloNovedad}>{materia.nombre}</Text>
                    <Text style={estilos.detalleNovedad}>
                      Cargá la nota cuando lo rindas
                    </Text>
                  </View>
                  <Ionicons
                    name="chevron-forward"
                    size={18}
                    color={colores.textoDebil}
                  />
                </Pressable>
              ))}
            </Tarjeta>
          </>
        ) : null}

        <Seccion titulo="Próximas fechas" />

        {fechasProximas.length === 0 ? (
          <Tarjeta style={estilos.tarjetaVacia}>
            <Ionicons
              name="checkmark-done-outline"
              size={22}
              color={colores.textoTenue}
            />
            <Text style={estilos.textoVacio}>
              No hay parciales ni entregas cargadas.
            </Text>
          </Tarjeta>
        ) : (
          fechasProximas.map((evento) => (
            <FilaEvento
              key={evento.id}
              evento={evento}
              mostrarFecha
              alTocar={() => router.push(`/evento/${evento.id}`)}
            />
          ))
        )}

        <Seccion titulo="Novedades" />

        <Tarjeta style={estilos.tarjetaNovedades}>
          {novedades.map((novedad, indice) => (
            <View
              key={novedad.id}
              style={[estilos.filaNovedad, indice > 0 && estilos.separador]}
            >
              <Ionicons
                name={
                  novedad.icono === "megafono"
                    ? "megaphone-outline"
                    : "calendar-clear-outline"
                }
                size={18}
                color={colores.azulClaro}
              />
              <View style={estilos.textoNovedad}>
                <Text style={estilos.tituloNovedad}>{novedad.titulo}</Text>
                <Text style={estilos.detalleNovedad}>{novedad.detalle}</Text>
              </View>
            </View>
          ))}
        </Tarjeta>
      </ScrollView>
    </View>
  );
}

type PropsTile = {
  valor: string;
  sufijo?: string;
  rotulo: string;
  icono: keyof typeof Ionicons.glyphMap;
};

function Tile({ valor, sufijo, rotulo, icono }: PropsTile) {
  return (
    <View style={estilos.tile}>
      <Ionicons name={icono} size={15} color={colores.textoTenue} />
      <View style={estilos.filaValor}>
        <Text style={estilos.valorTile}>{valor}</Text>
        {sufijo ? <Text style={estilos.sufijoTile}>{sufijo}</Text> : null}
      </View>
      <Text style={estilos.rotuloTile}>{rotulo}</Text>
    </View>
  );
}

function TileCuatrimestre({ avance }: { avance: AvanceCuatrimestre }) {
  return (
    <View style={[estilos.tile, estilos.tileCentrado]}>
      <CirculoProgreso valor={avance.porcentaje} tamanio={48} largo={6} grosor={2}>
        {avance.enCurso ? (
          <Text style={estilos.porcentajeTile}>
            {Math.round(avance.porcentaje * 100)}%
          </Text>
        ) : (
          <Ionicons name="moon-outline" size={16} color={colores.textoTenue} />
        )}
      </CirculoProgreso>
      <Text style={estilos.rotuloTile}>
        {avance.enCurso ? `Semana ${avance.semana}` : "Receso"}
      </Text>
    </View>
  );
}

function Seccion({
  titulo,
  enlace,
  textoEnlace,
}: {
  titulo: string;
  enlace?: "/plan" | "/agenda";
  textoEnlace?: string;
}) {
  return (
    <View style={estilos.cabeceraSeccion}>
      <Text style={estilos.tituloSeccion}>{titulo}</Text>
      {enlace && textoEnlace ? (
        <Link href={enlace} style={estilos.enlace}>
          {textoEnlace}
        </Link>
      ) : null}
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
    paddingBottom: espacioBajoTabs,
    gap: espaciado.md,
  },

  hero: {
    paddingTop: espaciado.xs,
    paddingBottom: espaciado.xs,
  },

  saludo: {
    marginTop: espaciado.xs,
    fontSize: 34,
    fontWeight: "700",
    letterSpacing: -0.8,
    color: colores.texto,
  },

  contexto: {
    marginTop: 2,
    fontSize: 14,
    color: colores.textoTenue,
  },

  tiles: {
    flexDirection: "row",
    gap: espaciado.sm,
  },

  tile: {
    flex: 1,
    minWidth: 0,
    gap: espaciado.xs,
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.bordeSuave,
    backgroundColor: colores.superficieAlta,
    paddingVertical: espaciado.md,
    paddingHorizontal: espaciado.sm + 2,
  },

  filaValor: {
    flexDirection: "row",
    alignItems: "flex-end",
    gap: 1,
  },

  valorTile: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.5,
    color: colores.texto,
  },

  sufijoTile: {
    marginBottom: 3,
    fontSize: 12,
    color: colores.textoDebil,
  },

  rotuloTile: {
    fontSize: 11,
    color: colores.textoTenue,
  },

  tarjetaAvance: {
    gap: espaciado.sm,
    padding: espaciado.md,
  },

  filaAvance: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  rotuloAvance: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.textoSuave,
  },

  porcentaje: {
    fontSize: 13,
    fontWeight: "700",
    color: colores.azulClaro,
  },

  detalleAvance: {
    fontSize: 12,
    color: colores.textoTenue,
  },

  cabeceraSeccion: {
    flexDirection: "row",
    alignItems: "flex-end",
    justifyContent: "space-between",
    marginTop: espaciado.md,
  },

  tituloSeccion: {
    fontSize: 22,
    fontWeight: "700",
    letterSpacing: -0.4,
    color: colores.texto,
  },

  enlace: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.azulClaro,
  },

  filaMaterias: {
    flexDirection: "row",
    gap: espaciado.md,
  },

  tarjetaMateria: {
    flex: 1,
    height: 138,
    justifyContent: "space-between",
    borderRadius: radios.lg,
    borderWidth: 1,
    borderColor: colores.primarioOscuro,
    backgroundColor: colores.primarioProfundo,
    padding: espaciado.md,
  },

  presionado: {
    opacity: 0.7,
  },

  filaMateria: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
  },

  codigoMateria: {
    fontSize: 11,
    fontWeight: "700",
    letterSpacing: 0.6,
    color: colores.azulTenue,
  },

  nombreMateria: {
    fontSize: 16,
    fontWeight: "600",
    letterSpacing: -0.2,
    color: colores.texto,
  },

  creditosMateria: {
    fontSize: 11,
    color: colores.textoTenue,
  },

  tileCentrado: {
    alignItems: "center",
  },

  porcentajeTile: {
    fontSize: 11,
    fontWeight: "700",
    color: colores.texto,
  },

  tarjetaVacia: {
    flexDirection: "row",
    alignItems: "center",
    gap: espaciado.md,
    padding: espaciado.md,
  },

  textoVacio: {
    fontSize: 13,
    color: colores.textoTenue,
  },

  tarjetaNovedades: {
    paddingVertical: espaciado.xs,
  },

  filaNovedad: {
    flexDirection: "row",
    gap: espaciado.md,
    paddingVertical: espaciado.md,
  },

  separador: {
    borderTopWidth: StyleSheet.hairlineWidth,
    borderTopColor: colores.bordeSuave,
  },

  textoNovedad: {
    flex: 1,
  },

  tituloNovedad: {
    fontSize: 14,
    fontWeight: "600",
    color: colores.textoSuave,
  },

  detalleNovedad: {
    marginTop: 4,
    fontSize: 12,
    lineHeight: 17,
    color: colores.textoTenue,
  },
});
