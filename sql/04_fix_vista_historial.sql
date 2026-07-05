-- ============================================================
-- PRODE MUNDIAL 254 — Fix vista_historial_predicciones
-- ============================================================
-- Problema: La vista usaba JOIN por nombres de equipo en vez de
--           partido_id. Si un usuario predecia el equipo contrario
--           incorrecto, la vista no encontraba el partido real
--           y mostraba "Pendiente" aunque los puntos estuvieran bien.
-- ============================================================

DROP VIEW IF EXISTS vista_historial_predicciones CASCADE;

CREATE VIEW vista_historial_predicciones AS
SELECT
    p.usuario_id,
    p.partido_id,
    p.equipo_a_pred,
    p.goles_a_pred,
    p.equipo_b_pred,
    p.goles_b_pred,
    p.puntos,
    pt.equipo_a  AS equipo_a_real,
    pt.equipo_b  AS equipo_b_real,
    pt.goles_a_real,
    pt.goles_b_real
FROM predicciones p
LEFT JOIN partidos pt ON p.partido_id = pt.id;
