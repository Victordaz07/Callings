/**
 * Registro de moduleId para el storage cifrado E2EE. Documenta lo que se
 * va a construir a futuro (ver "Barrido Final — Llamamientos, Asignaciones
 * y Eventos") — por ahora solo EQ_MINISTRACION tiene una página real
 * (Bloque 8, prueba de concepto de punta a punta).
 */
export const MODULES = {
  EQ_MINISTRACION: "eq_ministracion",
  WML_INVESTIGADORES: "wml_investigadores",
  EVENTOS_PLANIFICADOR: "eventos_planificador",
  OBISPADO_LLAMAMIENTOS: "obispado_llamamientos",
  SOCORRO_SERVICIO: "socorro_servicio",
} as const;

export type ModuleId = (typeof MODULES)[keyof typeof MODULES];
