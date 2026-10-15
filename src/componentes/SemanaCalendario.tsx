import { ScrollView, StyleSheet, Text, View } from "react-native";

import { BloqueEvento } from "@/componentes/BloqueEvento";
import type { Evento } from "@/datos/agenda";
import {
  colores,
  espaciado,
  espacioBajoTabs,
} from "@/tema/colores";
import {
  ALTO_HORA,
  distanciaDesdeArriba,
  distribuirSolapados,
  rangoHorario,
} from "@/utilidades/calendario";
import {
  claveFecha,
  etiquetaDiaCorto,
  etiquetaHora,
  sumarDias,
} from "@/utilidades/fechas";

const ANCHO_HORAS = 32;

type Props = {
  eventos: Evento[];
  inicioSemana: Date;
  alTocarEvento: (id: string) => void;
};

export function SemanaCalendario({
  eventos,
  inicioSemana,
  alTocarEvento,
}: Props) {
  const ahora = new Date();
  const hoy = claveFecha(ahora);
  const minutosAhora = ahora.getHours() * 60 + ahora.getMinutes();

  const { horaInicio, horaFin } = rangoHorario(eventos);
  const horas = Array.from(
    { length: horaFin - horaInicio },
    (_, posicion) => horaInicio + posicion
  );
  const altoGrilla = horas.length * ALTO_HORA;

  const dias = Array.from({ length: 7 }, (_, posicion) =>
    sumarDias(inicioSemana, posicion)
  );

  const desdeLunes = claveFecha(dias[0]);
  const hastaDomingo = claveFecha(dias[6]);
  const eventosDeLaSemana = eventos.filter(
    (evento) => evento.fecha >= desdeLunes && evento.fecha <= hastaDomingo
  );

  const ahoraVisible =
    minutosAhora >= horaInicio * 60 && minutosAhora < horaFin * 60;

  return (
    <View style={estilos.contenedor}>
      <View style={estilos.filaDias}>
        <View style={estilos.huecoHoras} />
        {dias.map((dia) => {
          const esHoy = claveFecha(dia) === hoy;
          return (
            <View key={claveFecha(dia)} style={estilos.celdaDia}>
              <Text style={[estilos.nombreDia, esHoy && estilos.nombreHoy]}>
                {etiquetaDiaCorto(dia)}
              </Text>
              <View style={[estilos.circuloDia, esHoy && estilos.circuloHoy]}>
                <Text style={[estilos.numeroDia, esHoy && estilos.numeroHoy]}>
                  {dia.getDate()}
                </Text>
              </View>
            </View>
          );
        })}
      </View>

      <ScrollView
        style={estilos.scroll}
        contentContainerStyle={estilos.contenido}
        showsVerticalScrollIndicator={false}
      >
        <View style={[estilos.cuerpo, { height: altoGrilla }]}>
          {horas.map((hora) => (
            <View
              key={`linea-${hora}`}
              style={[
                estilos.linea,
                { top: (hora - horaInicio) * ALTO_HORA },
              ]}
            />
          ))}

          <View style={estilos.columnaHoras}>
            {horas.map((hora) => (
              <Text
                key={`hora-${hora}`}
                style={[
                  estilos.rotuloHora,
                  { top: (hora - horaInicio) * ALTO_HORA - 6 },
                ]}
              >
                {etiquetaHora(hora)}
              </Text>
            ))}
          </View>

          {dias.map((dia) => {
            const clave = claveFecha(dia);
            const esHoy = clave === hoy;
            const delDia = distribuirSolapados(
              eventosDeLaSemana.filter((evento) => evento.fecha === clave)
            );

            return (
              <View
                key={clave}
                style={[estilos.columnaDia, esHoy && estilos.columnaHoy]}
              >
                {delDia.map(({ evento, columna, columnas }) => (
                  <BloqueEvento
                    key={evento.id}
                    evento={evento}
                    columna={columna}
                    columnas={columnas}
                    horaInicio={horaInicio}
                    alTocar={() => alTocarEvento(evento.id)}
                  />
                ))}

                {esHoy && ahoraVisible ? (
                  <View
                    style={[
                      estilos.ahora,
                      { top: distanciaDesdeArriba(minutosAhora, horaInicio) },
                    ]}
                  >
                    <View style={estilos.puntoAhora} />
                  </View>
                ) : null}
              </View>
            );
          })}
        </View>
      </ScrollView>
    </View>
  );
}

const estilos = StyleSheet.create({
  contenedor: {
    flex: 1,
    paddingHorizontal: espaciado.xs,
  },

  filaDias: {
    flexDirection: "row",
    paddingBottom: espaciado.sm,
    borderBottomWidth: StyleSheet.hairlineWidth,
    borderBottomColor: colores.bordeSuave,
  },

  huecoHoras: {
    width: ANCHO_HORAS,
  },

  celdaDia: {
    flex: 1,
    alignItems: "center",
    gap: 2,
  },

  nombreDia: {
    fontSize: 11,
    color: colores.textoTenue,
  },

  nombreHoy: {
    fontWeight: "700",
    color: colores.azulClaro,
  },

  circuloDia: {
    width: 26,
    height: 26,
    borderRadius: 13,
    alignItems: "center",
    justifyContent: "center",
  },

  circuloHoy: {
    backgroundColor: colores.primario,
  },

  numeroDia: {
    fontSize: 13,
    fontWeight: "600",
    color: colores.textoSuave,
  },

  numeroHoy: {
    color: colores.blanco,
  },

  scroll: {
    flex: 1,
  },

  contenido: {
    paddingTop: espaciado.sm,
    paddingBottom: espacioBajoTabs,
  },

  cuerpo: {
    flexDirection: "row",
  },

  linea: {
    position: "absolute",
    left: ANCHO_HORAS,
    right: 0,
    height: StyleSheet.hairlineWidth,
    backgroundColor: colores.bordeSuave,
  },

  columnaHoras: {
    width: ANCHO_HORAS,
  },

  rotuloHora: {
    position: "absolute",
    right: espaciado.xs,
    fontSize: 10,
    lineHeight: 12,
    color: colores.textoDebil,
  },

  columnaDia: {
    flex: 1,
    borderLeftWidth: StyleSheet.hairlineWidth,
    borderLeftColor: colores.bordeSuave,
  },

  columnaHoy: {
    backgroundColor: colores.resaltadoHoy,
  },

  ahora: {
    position: "absolute",
    left: 0,
    right: 0,
    height: 2,
    backgroundColor: colores.alerta,
  },

  puntoAhora: {
    position: "absolute",
    left: -4,
    top: -3,
    width: 8,
    height: 8,
    borderRadius: 4,
    backgroundColor: colores.alerta,
  },
});
