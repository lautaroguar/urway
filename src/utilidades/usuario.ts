import type { Usuario } from "@/datos/usuarios";

export function nombreCompleto(usuario: Usuario | null): string {
  return usuario ? `${usuario.nombre} ${usuario.apellido}` : "";
}

export function primerNombre(usuario: Usuario | null): string {
  return usuario ? usuario.nombre.trim().split(" ")[0] : "";
}
