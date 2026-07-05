-- ============================================================
-- PRODE MUNDIAL 254 — Fix Cross-Match Scoring
-- ============================================================
-- Problema: Si un usuario predice un país en el matchup equivocado
--           de la misma ronda, no recibe puntos de país.
-- Solución: Cross-match lookup: busca si el país predicho aparece
--           en OTRO partido de la misma fase ya jugado.
-- ============================================================

-- ────────────────────────────────────────────
-- PASO 1: DROP triggers existentes (backup)
-- ────────────────────────────────────────────

-- Deshabilitamos triggers existentes (no los dropeamos por seguridad)
-- Si hay un trigger en predicciones llamado calcular_puntos:
-- ALTER TABLE predicciones DISABLE TRIGGER calcular_puntos_prediccion_trigger;
-- Si no existe o tiene otro nombre, ajustamos en el SQL Editor.

-- ────────────────────────────────────────────
-- PASO 2: NUEVA función calcular_puntos_prediccion
--         (con cross-match lookup)
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION calcular_puntos_prediccion()
RETURNS TRIGGER AS $$
DECLARE
    v_equipo_a     TEXT;
    v_equipo_b     TEXT;
    v_goles_a_real INTEGER;
    v_goles_b_real INTEGER;
    v_fase         TEXT;
    v_es_mata      BOOLEAN;
    v_pts_result   INTEGER := 0;
    v_pts_pais     INTEGER := 0;
    v_pts_total    INTEGER := 0;
BEGIN
    -- 1. Obtener datos del partido real
    SELECT pt.equipo_a, pt.equipo_b, pt.goles_a_real, pt.goles_b_real, pt.fase, 
           (pt.fase NOT IN ('Fecha 1','Fecha 2','Fecha 3'))::BOOLEAN
    INTO v_equipo_a, v_equipo_b, v_goles_a_real, v_goles_b_real, v_fase, v_es_mata
    FROM partidos pt WHERE pt.id = NEW.partido_id;

    -- 2. Puntos por país (Mata-Mata) — con cross-match (siempre, con o sin resultado)
    IF v_es_mata AND NEW.equipo_a_pred IS NOT NULL AND NEW.equipo_b_pred IS NOT NULL THEN
        -- Paso A: Check local (matchup actual)
        IF NEW.equipo_a_pred = v_equipo_a THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;
        IF NEW.equipo_b_pred = v_equipo_b THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;

        -- Paso B: Cross-match lookup (siempre — con o sin resultado local)
        IF NEW.equipo_a_pred != v_equipo_a AND EXISTS (
            SELECT 1 FROM partidos p2
            WHERE p2.fase = v_fase
              AND p2.id != NEW.partido_id
              AND p2.goles_a_real IS NOT NULL
              AND (p2.equipo_a = NEW.equipo_a_pred OR p2.equipo_b = NEW.equipo_a_pred)
        ) THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;

        IF NEW.equipo_b_pred != v_equipo_b AND EXISTS (
            SELECT 1 FROM partidos p2
            WHERE p2.fase = v_fase
              AND p2.id != NEW.partido_id
              AND p2.goles_a_real IS NOT NULL
              AND (p2.equipo_a = NEW.equipo_b_pred OR p2.equipo_b = NEW.equipo_b_pred)
        ) THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;
    END IF;

    -- 3. Sin resultado real → devolver solo puntos de país
    IF v_goles_a_real IS NULL THEN
        NEW.puntos := v_pts_pais;
        RETURN NEW;
    END IF;

    -- 4. Puntos por resultado (goles) — SIN CAMBIOS
    IF NEW.goles_a_pred = v_goles_a_real AND NEW.goles_b_pred = v_goles_b_real THEN
        v_pts_result := 5;  -- Pleno
    ELSIF (NEW.goles_a_pred - NEW.goles_b_pred) = (v_goles_a_real - v_goles_b_real) THEN
        v_pts_result := 3;  -- Diferencia correcta
    ELSIF (NEW.goles_a_pred > NEW.goles_b_pred AND v_goles_a_real > v_goles_b_real)
       OR (NEW.goles_a_pred < NEW.goles_b_pred AND v_goles_a_real < v_goles_b_real)
       OR (NEW.goles_a_pred = NEW.goles_b_pred AND v_goles_a_real = v_goles_b_real) THEN
        v_pts_result := 2;  -- Ganador correcto
    ELSE
        v_pts_result := 0;
    END IF;

    -- 4. Puntos por país — SOLO para Mata-Mata (NO Fechas)
    IF v_es_mata AND NEW.equipo_a_pred IS NOT NULL AND NEW.equipo_b_pred IS NOT NULL THEN
        -- ── Paso A: Check local (matchup actual) ──
        IF NEW.equipo_a_pred = v_equipo_a THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;
        IF NEW.equipo_b_pred = v_equipo_b THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;

        -- ── Paso B: Cross-match lookup ──
        -- Solo si NO fue acertado localmente, buscar en OTROS partidos de la misma fase
        IF NEW.equipo_a_pred != v_equipo_a AND EXISTS (
            SELECT 1 FROM partidos p2
            WHERE p2.fase = v_fase
              AND p2.id != NEW.partido_id
              AND p2.goles_a_real IS NOT NULL
              AND (p2.equipo_a = NEW.equipo_a_pred OR p2.equipo_b = NEW.equipo_a_pred)
        ) THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;

        IF NEW.equipo_b_pred != v_equipo_b AND EXISTS (
            SELECT 1 FROM partidos p2
            WHERE p2.fase = v_fase
              AND p2.id != NEW.partido_id
              AND p2.goles_a_real IS NOT NULL
              AND (p2.equipo_a = NEW.equipo_b_pred OR p2.equipo_b = NEW.equipo_b_pred)
        ) THEN
            v_pts_pais := v_pts_pais + 1;
        END IF;
    END IF;

    -- 5. Total
    v_pts_total := v_pts_result + v_pts_pais;
    IF v_pts_total > 10 THEN v_pts_total := 10; END IF; -- sanity cap
    NEW.puntos := v_pts_total;

    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

-- ────────────────────────────────────────────
-- PASO 3: TRIGGER en predicciones (BEFORE INSERT/UPDATE)
--         (mismo trigger existente, pero con la nueva función)
-- ────────────────────────────────────────────

DROP TRIGGER IF EXISTS trg_calcular_puntos ON predicciones;

CREATE TRIGGER trg_calcular_puntos
BEFORE INSERT OR UPDATE OF equipo_a_pred, equipo_b_pred, goles_a_pred, goles_b_pred, ganador_penales_pred
ON predicciones
FOR EACH ROW
EXECUTE FUNCTION calcular_puntos_prediccion();

-- ────────────────────────────────────────────
-- PASO 4: TRIGGER en partidos (NUEVO)
--         Cuando se setea un resultado, recalcula TODAS las predicciones
--         de esa ronda aplicando la nueva lógica cross-match
-- ────────────────────────────────────────────

CREATE OR REPLACE FUNCTION recalcular_predicciones_tras_resultado()
RETURNS TRIGGER AS $$
DECLARE
    rec RECORD;
BEGIN
    -- Solo si se acaba de setear un resultado (antes era NULL)
    IF NEW.goles_a_real IS NOT NULL AND (OLD.goles_a_real IS NULL OR OLD.goles_a_real IS NULL) THEN
        -- Forzar re-evaluación de TODAS las predicciones de esta fase
        -- Hacemos un dummy UPDATE que dispare el BEFORE trigger
        FOR rec IN 
            SELECT * FROM predicciones 
            WHERE partido_id IN (
                SELECT id FROM partidos WHERE fase = NEW.fase
            )
            AND equipo_a_pred IS NOT NULL
        LOOP
            UPDATE predicciones 
            SET goles_a_pred = rec.goles_a_pred  -- dummy: mismo valor, pero dispara el trigger
            WHERE id = rec.id;
        END LOOP;
    END IF;
    RETURN NEW;
END;
$$ LANGUAGE plpgsql;

DROP TRIGGER IF EXISTS trg_recalcular_ronda ON partidos;

CREATE TRIGGER trg_recalcular_ronda
AFTER UPDATE OF goles_a_real ON partidos
FOR EACH ROW
EXECUTE FUNCTION recalcular_predicciones_tras_resultado();