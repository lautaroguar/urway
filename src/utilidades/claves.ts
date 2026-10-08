/**
 * ============================================================================
 * utilidades/claves.ts — Guarda y lee las CONTRASEÑAS de las cuentas
 * ============================================================================
 *
 * QUÉ ES:
 *   Dos funciones para guardar y leer la contraseña de una cuenta, separada del
 *   resto de los datos del usuario.
 *
 * POR QUÉ NO VA EN ASYNCSTORAGE COMO LO DEMÁS:
 *   La teoría lo dice: para un dato sensible (un token de sesión, una
 *   contraseña) "no uses AsyncStorage: va `expo-secure-store`, que lo guarda
 *   cifrado". AsyncStorage guarda texto plano. SecureStore usa el Keychain de
 *   iOS y el Keystore de Android.
 *
 * LA EXCEPCIÓN: LA WEB
 *   `expo-secure-store` no existe en la web, y la app se abre ahí solo para
 *   desarrollar. En la web la contraseña va a AsyncStorage (el `localStorage` del
 *   navegador), SIN cifrar. Es aceptable para probar; no para una app real.
 *
 * LÍMITE DE ESTA DEMO:
 *   Una app real no guarda contraseñas en el teléfono: las valida un servidor
 *   (que las guarda con hash). Acá no hay servidor, así que la comparación
 *   se hace contra lo guardado en el dispositivo.
 *
 * TEORÍA:
 *   [ALM]  AsyncStorage (`setItem`, `getItem`) y la advertencia de la teoría
 *          sobre datos sensibles. (ALM = "Almacenamiento Local".)
 *   [JS 14] `async/await`: leer y guardar en disco son operaciones que tardan.
 */
import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

// Las claves de SecureStore solo pueden tener letras, números, ".", "-" y "_".
// Los ids de usuario ("usr-1759860000000") cumplen eso.
const claveDe = (id: string) => `urway-clave-${id}`;

// En la web no hay SecureStore (ver arriba).
const esWeb = Platform.OS === "web";

/** Guarda la contraseña de la cuenta `id`. */
export async function guardarClave(id: string, contrasenia: string): Promise<void> {
  if (esWeb) return AsyncStorage.setItem(claveDe(id), contrasenia);
  return SecureStore.setItemAsync(claveDe(id), contrasenia);
}

/** Lee la contraseña guardada de la cuenta `id`, o `null` si no hay ninguna. */
export async function leerClave(id: string): Promise<string | null> {
  if (esWeb) return AsyncStorage.getItem(claveDe(id));
  return SecureStore.getItemAsync(claveDe(id));
}
