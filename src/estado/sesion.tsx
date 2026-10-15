import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  createContext,
  useContext,
  useEffect,
  useMemo,
  useState,
  type ReactNode,
} from "react";

import { usuarioDemo, type Usuario } from "@/datos/usuarios";
import { guardarClave, leerClave } from "@/utilidades/claves";

const CLAVE_CUENTAS = "urway-cuentas";
const CLAVE_SESION = "urway-sesion";

type Sesion = { tipo: "demo" } | { tipo: "cuenta"; id: string };

export type DatosRegistro = {
  nombre: string;
  apellido: string;
  fechaNacimiento: string;
  dni: string;
  email: string;
  contrasenia: string;
  facultad: string;
  carrera: string;
};

export type ResultadoIngreso = "ok" | "contraseniaIncorrecta";

type ValorSesion = {
  usuario: Usuario | null;
  esDemo: boolean;
  existeCorreo: (email: string) => boolean;
  registrar: (datos: DatosRegistro) => Promise<void>;
  iniciarSesion: (email: string, contrasenia: string) => Promise<ResultadoIngreso>;
  cerrarSesion: () => void;
};

const ContextoSesion = createContext<ValorSesion | undefined>(undefined);

const normalizar = (email: string) => email.trim().toLowerCase();

export function ProveedorSesion({ children }: { children: ReactNode }) {
  const [cuentas, setCuentas] = useState<Usuario[]>([]);
  const [sesion, setSesion] = useState<Sesion | null>(null);
  const [listo, setListo] = useState(false);

  useEffect(() => {
    Promise.all([
      AsyncStorage.getItem(CLAVE_CUENTAS),
      AsyncStorage.getItem(CLAVE_SESION),
    ])
      .then(([cuentasGuardadas, sesionGuardada]) => {
        if (cuentasGuardadas) setCuentas(JSON.parse(cuentasGuardadas));
        if (sesionGuardada) setSesion(JSON.parse(sesionGuardada));
      })
      .catch(() => {})
      .finally(() => setListo(true));
  }, []);

  useEffect(() => {
    if (!listo) return;
    AsyncStorage.setItem(CLAVE_CUENTAS, JSON.stringify(cuentas)).catch(() => {});
  }, [cuentas, listo]);

  useEffect(() => {
    if (!listo) return;
    if (sesion) {
      AsyncStorage.setItem(CLAVE_SESION, JSON.stringify(sesion)).catch(() => {});
    } else {
      AsyncStorage.removeItem(CLAVE_SESION).catch(() => {});
    }
  }, [sesion, listo]);

  const usuario =
    sesion === null
      ? null
      : sesion.tipo === "demo"
        ? usuarioDemo
        : (cuentas.find((cuenta) => cuenta.id === sesion.id) ?? null);
  const esDemo = sesion?.tipo === "demo";

  const existeCorreo = (email: string) =>
    cuentas.some((cuenta) => cuenta.email === normalizar(email));

  const registrar = async (datos: DatosRegistro) => {
    const { contrasenia, ...perfil } = datos;
    const nueva: Usuario = {
      id: `usr-${Date.now()}`,
      ...perfil,
      email: normalizar(perfil.email),
    };
    await guardarClave(nueva.id, contrasenia);
    setCuentas((actuales) => [...actuales, nueva]);
  };

  const iniciarSesion = async (
    email: string,
    contrasenia: string
  ): Promise<ResultadoIngreso> => {
    const cuenta = cuentas.find((c) => c.email === normalizar(email));

    if (!cuenta) {
      setSesion({ tipo: "demo" });
      return "ok";
    }

    const guardada = await leerClave(cuenta.id);
    if (guardada !== contrasenia) return "contraseniaIncorrecta";
    setSesion({ tipo: "cuenta", id: cuenta.id });
    return "ok";
  };

  const cerrarSesion = () => setSesion(null);

  const valor = useMemo<ValorSesion>(
    () => ({
      usuario,
      esDemo,
      existeCorreo,
      registrar,
      iniciarSesion,
      cerrarSesion,
    }),
    [cuentas, sesion]
  );

  if (!listo) return null;

  return (
    <ContextoSesion.Provider value={valor}>{children}</ContextoSesion.Provider>
  );
}

export function useSesion(): ValorSesion {
  const valor = useContext(ContextoSesion);

  if (!valor) {
    throw new Error("useSesion tiene que usarse dentro de <ProveedorSesion>");
  }

  return valor;
}
