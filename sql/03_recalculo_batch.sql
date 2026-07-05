-- ============================================================
-- PRODE MUNDIAL 254 — Recalculo Batch
-- ============================================================
-- Después de aplicar el nuevo scoring cross-match,
-- recalculamos TODAS las predicciones de Mata-Mata con resultado real
-- y reconstruimos ranking_prode.
-- ============================================================

-- ────────────────────────────────────────────
-- PASO 1: Recalcular todas las predicciones Mata-Mata con resultado
-- ────────────────────────────────────────────

DO $$
DECLARE
    rec RECORD;
    total INTEGER := 0;
BEGIN
    FOR rec IN 
        SELECT p.*
        FROM predicciones p
        JOIN partidos pt ON p.partido_id = pt.id
        WHERE pt.goles_a_real IS NOT NULL
          AND pt.fase NOT IN ('Fecha 1', 'Fecha 2', 'Fecha 3')
          AND p.equipo_a_pred IS NOT NULL
          AND p.equipo_b_pred IS NOT NULL
    LOOP
        -- Disparar el trigger BEFORE UPDATE haciendo un dummy set
        UPDATE predicciones 
        SET goles_a_pred = rec.goles_a_pred 
        WHERE id = rec.id;
        total := total + 1;
    END LOOP;
    RAISE NOTICE 'Predicciones recalculadas: %', total;
END $$;

-- ────────────────────────────────────────────
-- PASO 2: Reconstruir ranking_prode
-- ────────────────────────────────────────────

-- ranking_prode ahora es una VIEW para que los puntajes se actualicen automáticamente
DROP TABLE IF EXISTS ranking_prode CASCADE;

CREATE VIEW ranking_prode AS
SELECT 
    p.usuario_id,
    u.nombre,
    SUM(p.puntos) AS puntos_totales,
    COUNT(*) FILTER (WHERE p.puntos >= 5) AS aciertos_plenos,
    COUNT(*) FILTER (WHERE p.puntos >= 1 AND p.puntos < 5) AS aciertos_parciales,
    MIN(p.fecha_prediccion) AS fecha_desempate
FROM predicciones p
JOIN usuarios u ON p.usuario_id = u.id
WHERE p.puntos IS NOT NULL
GROUP BY p.usuario_id, u.nombre;

-- ────────────────────────────────────────────
-- PASO 3: Verificación — casos cross-match
-- ────────────────────────────────────────────

-- 3a. Caballo: id=14 (USA vs NZ) → debería tener +1 por USA en id=10
SELECT p.*, pt.equipo_a, pt.equipo_b, pt.fase
FROM predicciones p
JOIN partidos pt ON p.partido_id = pt.id
WHERE p.usuario_id = 'efa4081b-08f9-4dab-adcc-0cd12d3eaa38'
  AND p.partido_id = 14;

-- 3b. Todas las predicciones donde se detectó cross-match (puntos > score local)
SELECT p.usuario_id, p.partido_id, p.equipo_a_pred, p.equipo_b_pred, 
       p.goles_a_pred, p.goles_b_pred, p.puntos,
       pt.equipo_a, pt.equipo_b, pt.goles_a_real, pt.goles_b_real, pt.fase
FROM predicciones p
JOIN partidos pt ON p.partido_id = pt.id
WHERE pt.goles_a_real IS NOT NULL
  AND pt.fase NOT IN ('Fecha 1', 'Fecha 2', 'Fecha 3')
  AND p.equipo_a_pred != pt.equipo_a 
  AND p.equipo_b_pred != pt.equipo_b
  AND p.puntos > 0
ORDER BY p.usuario_id, pt.fase;

-- ────────────────────────────────────────────
-- PASO 4: Ver ranking actualizado
-- ────────────────────────────────────────────

SELECT *
FROM ranking_prode
ORDER BY puntos_totales DESC, aciertos_plenos DESC, fecha_desempate ASC
LIMIT 20;