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
  MUSICA_SACRAMENTAL: "musica_sacramental",
  HISTORIA_FAMILIAR_TEMPLO: "historia_familiar_templo",
  DIRECTORIO_LIDERAZGO: "directorio_liderazgo",
  ONBOARDING_LIDER: "onboarding_lider",
  HJ_ACTIVIDADES_SEMANALES: "hj_actividades_semanales",
  HJ_METAS_PERSONALES: "hj_metas_personales",
  HJ_CAMPAMENTO: "hj_campamento",
  HJ_SERVICIO_PROYECTO: "hj_servicio_proyecto",
  MJ_ACTIVIDADES_SEMANALES: "mj_actividades_semanales",
  MJ_METAS_PERSONALES: "mj_metas_personales",
  MJ_CAMPAMENTO: "mj_campamento",
  MJ_SERVICIO_PROYECTO: "mj_servicio_proyecto",
  PRIMARIA_ASISTENCIA_CLASES: "primaria_asistencia_clases",
  PRIMARIA_MAESTROS_ASIGNADOS: "primaria_maestros_asignados",
  PRIMARIA_PRESENTACION_ANUAL: "primaria_presentacion_anual",
  PRIMARIA_CUMPLEANOS: "primaria_cumpleanos",
  PRIMARIA_APOYO_CLASE: "primaria_apoyo_clase",
  SD_MAESTROS_ASIGNADOS: "sd_maestros_asignados",
  SD_OBSERVACION_CLASES: "sd_observacion_clases",
  SD_ASISTENCIA_GENERAL: "sd_asistencia_general",
  SD_CALENDARIO_LECCIONES: "sd_calendario_lecciones",
} as const;

export type ModuleId = (typeof MODULES)[keyof typeof MODULES];
