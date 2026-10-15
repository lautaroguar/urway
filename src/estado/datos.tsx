import {
  createContext,
  useContext,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { eventosIniciales, type Evento } from "@/datos/agenda";
import {
  materiasIniciales,
  type EstadoMateria,
  type Materia,
} from "@/datos/carrera";
import { solicitudesEnviadasIniciales } from "@/datos/comunidad";
import {
  validarCambioDeEstado,
  validarCorreccionDeNota,
} from "@/utilidades/materias";

export type Apunte = {
  id: string;
  materiaId: string;
  titulo: string;
  uri: string;
};

type ValorContexto = {
  eventos: Evento[];
  agregarEvento: (borrador: Omit<Evento, "id">) => void;
  eliminarEvento: (id: string) => void;

  solicitudesEnviadas: string[];
  alternarSolicitud: (estudianteId: string) => void;

  apuntes: Apunte[];
  agregarApunte: (materiaId: string, uri: string) => void;
  eliminarApunte: (id: string) => void;

  materias: Materia[];
  cambiarEstadoMateria: (
    id: string,
    nuevoEstado: EstadoMateria,
    notaFinal?: number
  ) => void;
  corregirNotaFinal: (id: string, notaFinal: number) => void;
};

const ContextoDatos = createContext<ValorContexto | null>(null);

export function ProveedorDatos({ children }: { children: ReactNode }) {
  const [eventos, setEventos] = useState<Evento[]>(eventosIniciales);

  const [solicitudesEnviadas, setSolicitudesEnviadas] = useState<string[]>(solicitudesEnviadasIniciales);

  const [apuntes, setApuntes] = useState<Apunte[]>([]);

  const [materias, setMaterias] = useState<Materia[]>(materiasIniciales);

  const agregarEvento = (borrador: Omit<Evento, "id">) => {
    const nuevo: Evento = { id: `ev-${Date.now()}`, ...borrador };
    setEventos((actuales) => [...actuales, nuevo]);
  };

  const eliminarEvento = (id: string) => {
    setEventos((actuales) => actuales.filter((evento) => evento.id !== id));
  };

  const alternarSolicitud = (estudianteId: string) => {
    setSolicitudesEnviadas((actuales) =>
      actuales.includes(estudianteId)
        ? actuales.filter((id) => id !== estudianteId)
        : [...actuales, estudianteId]
    );
  };

  const agregarApunte = (materiaId: string, uri: string) => {
    const hoy = new Date();
    const nuevo: Apunte = {
      id: `ap-${Date.now()}`,
      materiaId,
      titulo: `Apunte del ${hoy.getDate()}/${hoy.getMonth() + 1}`,
      uri,
    };
    setApuntes((actuales) => [nuevo, ...actuales]);
  };

  const eliminarApunte = (id: string) => {
    setApuntes((actuales) => actuales.filter((apunte) => apunte.id !== id));
  };

  const cambiarEstadoMateria = (
    id: string,
    nuevoEstado: EstadoMateria,
    notaFinal?: number
  ) => {
    setMaterias((actuales) =>
      actuales.map((materia) => {
        if (materia.id !== id) return materia;
        if (nuevoEstado === materia.estado) return materia;
        if (validarCambioDeEstado(materia.estado, nuevoEstado, notaFinal) !== null) {
          return materia;
        }
        return {
          ...materia,
          estado: nuevoEstado,
          notaFinal: nuevoEstado === "aprobada" ? notaFinal : undefined,
        };
      })
    );
  };

  const corregirNotaFinal = (id: string, notaFinal: number) => {
    setMaterias((actuales) =>
      actuales.map((materia) => {
        if (materia.id !== id) return materia;
        if (validarCorreccionDeNota(materia.estado, notaFinal) !== null) {
          return materia;
        }
        return { ...materia, notaFinal };
      })
    );
  };

  const valor = useMemo<ValorContexto>(
    () => ({
      eventos,
      agregarEvento,
      eliminarEvento,
      solicitudesEnviadas,
      alternarSolicitud,
      apuntes,
      agregarApunte,
      eliminarApunte,
      materias,
      cambiarEstadoMateria,
      corregirNotaFinal,
    }),
    [eventos, solicitudesEnviadas, apuntes, materias]
  );

  return (
    <ContextoDatos.Provider value={valor}>
      {children}
    </ContextoDatos.Provider>
  );
}

export function useDatos(): ValorContexto {
  const valor = useContext(ContextoDatos);

  if (!valor) {
    throw new Error("useDatos tiene que usarse dentro de <ProveedorDatos>");
  }

  return valor;
}
