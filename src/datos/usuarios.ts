export type Usuario = {
  id: string;
  nombre: string;
  apellido: string;
  email: string;
  facultad: string;
  carrera: string;
  dni?: string;
  fechaNacimiento?: string;
};

export const usuarioDemo: Usuario = {
  id: "demo",
  nombre: "Franco",
  apellido: "Díaz",
  email: "franco.diaz@uca.edu.ar",
  facultad: "uca",
  carrera: "informatica",
};
