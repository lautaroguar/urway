import AsyncStorage from "@react-native-async-storage/async-storage";
import * as SecureStore from "expo-secure-store";
import { Platform } from "react-native";

const claveDe = (id: string) => `urway-clave-${id}`;

const esWeb = Platform.OS === "web";

export async function guardarClave(id: string, contrasenia: string): Promise<void> {
  if (esWeb) return AsyncStorage.setItem(claveDe(id), contrasenia);
  return SecureStore.setItemAsync(claveDe(id), contrasenia);
}

export async function leerClave(id: string): Promise<string | null> {
  if (esWeb) return AsyncStorage.getItem(claveDe(id));
  return SecureStore.getItemAsync(claveDe(id));
}
