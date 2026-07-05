---- Diagnóstico Pre-Fix ----
---- Ejecutar en Supabase SQL Editor para verificar estado antes del cambio

---- 1. Función de scoring ACTUAL (ver source)
SELECT proname, prosrc 
FROM pg_proc 
WHERE proname = 'calcular_puntos_prediccion';

---- 2. Triggers existentes en predicciones
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'public.predicciones'::regclass;

---- 3. Triggers existentes en partidos
SELECT tgname, tgtype, tgenabled 
FROM pg_trigger 
WHERE tgrelid = 'public.partidos'::regclass;

---- 4. Muestra: predicciones con 0 pts en Mata-Mata (para comparar después)
SELECT p.usuario_id, p.partido_id, p.equipo_a_pred, p.equipo_b_pred, 
       p.goles_a_pred, p.goles_b_pred, p.puntos,
       pt.equipo_a, pt.equipo_b, pt.goles_a_real, pt.goles_b_real, pt.fase
FROM predicciones p
JOIN partidos pt ON p.partido_id = pt.id
WHERE pt.goles_a_real IS NOT NULL
  AND p.puntos = 0
  AND p.equipo_a_pred IS NOT NULL
  AND p.equipo_b_pred IS NOT NULL
ORDER BY pt.fase, p.partido_id;

---- 5. Caso Caballo: predicciones id=14
SELECT p.*, pt.equipo_a, pt.equipo_b, pt.goles_a_real, pt.goles_b_real, pt.fase
FROM predicciones p
JOIN partidos pt ON p.partido_id = pt.id
WHERE p.usuario_id = 'efa4081b-08f9-4dab-adcc-0cd12d3eaa38'
  AND p.partido_id = 14;

---- 6. Count: cuántas predicciones podrían beneficiarse del cross-match
---- (predicciones con país acertado en OTRO match de la misma fase)
SELECT COUNT(*) AS predicciones_candidatas
FROM predicciones p
JOIN partidos pt ON p.partido_id = pt.id
JOIN partidos pt2 ON pt2.fase = pt.fase 
  AND pt2.id != pt.id 
  AND pt2.goles_a_real IS NOT NULL
WHERE pt.goles_a_real IS NOT NULL
  AND p.equipo_a_pred IS NOT NULL
  AND p.equipo_b_pred IS NOT NULL
  AND (
    (p.equipo_a_pred != pt.equipo_a AND p.equipo_b_pred != pt.equipo_b 
     AND (p.equipo_a_pred = pt2.equipo_a OR p.equipo_a_pred = pt2.equipo_b))
    OR
    (p.equipo_a_pred != pt.equipo_a AND p.equipo_b_pred != pt.equipo_b 
     AND (p.equipo_b_pred = pt2.equipo_a OR p.equipo_b_pred = pt2.equipo_b))
  );