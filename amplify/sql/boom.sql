-- Script MySQL para crear las tablas necesarias para la Carga de Insumos
-- Base de datos: STGDiveco
-- Sintaxis: MySQL

-- Usar la base de datos
USE STGDiveco;

-- En MySQL no necesitamos crear schemas explícitamente
-- Las tablas se crearán directamente en la base de datos

-- ==============================================
-- Tabla para Plan de Ventas
-- ==============================================
CREATE TABLE IF NOT EXISTS plan_ventas (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL,
    batch_id VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,

    -- Campos específicos del Plan de Ventas
    ssour VARCHAR(50) DEFAULT NULL,
    vrsio VARCHAR(50) DEFAULT NULL,
    spmon VARCHAR(50) DEFAULT NULL,
    sptag VARCHAR(50) DEFAULT NULL,
    spwoc VARCHAR(50) DEFAULT NULL,
    spbup VARCHAR(50) DEFAULT NULL,
    pmnux VARCHAR(50) DEFAULT NULL,
    wenux VARCHAR(50) DEFAULT NULL,
    vsnda VARCHAR(50) DEFAULT NULL,
    periv VARCHAR(50) DEFAULT NULL,
    vwdat VARCHAR(50) DEFAULT NULL,
    basme VARCHAR(50) DEFAULT NULL,
    absat VARCHAR(50) DEFAULT NULL,
    produ VARCHAR(50) DEFAULT NULL,
    lagri VARCHAR(50) DEFAULT NULL,
    lagrz VARCHAR(50) DEFAULT NULL,
    reich VARCHAR(50) DEFAULT NULL,
    reicz VARCHAR(50) DEFAULT NULL,

    -- Campos de auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices para mejorar rendimiento
    INDEX idx_plan_ventas_document_id (document_id),
    INDEX idx_plan_ventas_batch_id (batch_id),
    INDEX idx_plan_ventas_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- Tabla para Existencias
-- ==============================================
CREATE TABLE IF NOT EXISTS existencias (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL,
    batch_id VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,

    -- Campos específicos de Existencias
    version VARCHAR(50) DEFAULT NULL,
    centro VARCHAR(50) DEFAULT NULL,
    almacen VARCHAR(50) DEFAULT NULL,
    material VARCHAR(50) DEFAULT NULL,
    periodo VARCHAR(50) DEFAULT NULL,
    mes VARCHAR(50) DEFAULT NULL,
    libre_u DECIMAL(18,2) DEFAULT 0,
    no_liberado DECIMAL(18,2) DEFAULT 0,
    bloqueado DECIMAL(18,2) DEFAULT 0,
    devolucion DECIMAL(18,2) DEFAULT 0,
    traslados DECIMAL(18,2) DEFAULT 0,
    calidad DECIMAL(18,2) DEFAULT 0,
    bloqueado_em DECIMAL(18,2) DEFAULT 0,

    -- Campos de auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices para mejorar rendimiento
    INDEX idx_existencias_document_id (document_id),
    INDEX idx_existencias_batch_id (batch_id),
    INDEX idx_existencias_centro (centro),
    INDEX idx_existencias_material (material),
    INDEX idx_existencias_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- Tabla para Cobertura
-- ==============================================
CREATE TABLE IF NOT EXISTS cobertura (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL,
    batch_id VARCHAR(100) NOT NULL,
    file_name VARCHAR(255) DEFAULT NULL,

    -- Campos específicos de Cobertura
    version VARCHAR(50) DEFAULT NULL,
    centro VARCHAR(50) DEFAULT NULL,
    periodo VARCHAR(50) DEFAULT NULL,
    mes VARCHAR(50) DEFAULT NULL,
    dias_habiles_mes_planta INT DEFAULT 0,
    dias_coberturas_mes INT DEFAULT 0,
    dias_habiles_venta INT DEFAULT 0,

    -- Campos de auditoría
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    updated_at DATETIME DEFAULT CURRENT_TIMESTAMP ON UPDATE CURRENT_TIMESTAMP,

    -- Índices para mejorar rendimiento
    INDEX idx_cobertura_document_id (document_id),
    INDEX idx_cobertura_batch_id (batch_id),
    INDEX idx_cobertura_centro (centro),
    INDEX idx_cobertura_periodo (periodo),
    INDEX idx_cobertura_created_at (created_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- Tabla de Control de Documentos (opcional)
-- Para hacer seguimiento de los documentos procesados
-- ==============================================
CREATE TABLE IF NOT EXISTS carga_insumos_control (
    id BIGINT AUTO_INCREMENT PRIMARY KEY,
    document_id VARCHAR(50) NOT NULL UNIQUE,
    document_name VARCHAR(255) DEFAULT NULL,

    -- Estadísticas por tipo
    plan_ventas_records INT DEFAULT 0,
    existencias_records INT DEFAULT 0,
    cobertura_records INT DEFAULT 0,
    total_records INT DEFAULT 0,

    -- Estado del procesamiento
    status VARCHAR(20) DEFAULT 'processing', -- processing, completed, error
    error_message TEXT DEFAULT NULL,

    -- Información de archivos
    plan_ventas_file VARCHAR(255) DEFAULT NULL,
    existencias_file VARCHAR(255) DEFAULT NULL,
    cobertura_file VARCHAR(255) DEFAULT NULL,

    -- Campos de auditoría
    started_at DATETIME DEFAULT CURRENT_TIMESTAMP,
    completed_at DATETIME DEFAULT NULL,
    created_by VARCHAR(100) DEFAULT NULL,

    -- Metadatos adicionales
    processing_time_seconds INT DEFAULT NULL,
    total_batches_processed INT DEFAULT 0,

    -- Índices
    INDEX idx_carga_insumos_control_document_id (document_id),
    INDEX idx_carga_insumos_control_status (status),
    INDEX idx_carga_insumos_control_started_at (started_at)
) ENGINE=InnoDB DEFAULT CHARSET=utf8mb4 COLLATE=utf8mb4_unicode_ci;

-- ==============================================
-- Procedimiento para insertar control de documento
-- ==============================================
DELIMITER //

DROP PROCEDURE IF EXISTS sp_InsertCargaInsumosControl //

CREATE PROCEDURE sp_InsertCargaInsumosControl(
    IN p_document_id VARCHAR(50),
    IN p_document_name VARCHAR(255),
    IN p_plan_ventas_file VARCHAR(255),
    IN p_existencias_file VARCHAR(255),
    IN p_cobertura_file VARCHAR(255),
    IN p_created_by VARCHAR(100)
)
BEGIN
    DECLARE control_id BIGINT;

    INSERT INTO carga_insumos_control (
        document_id,
        document_name,
        plan_ventas_file,
        existencias_file,
        cobertura_file,
        created_by,
        started_at
    )
    VALUES (
        p_document_id,
        p_document_name,
        p_plan_ventas_file,
        p_existencias_file,
        p_cobertura_file,
        p_created_by,
        NOW()
    );

    SET control_id = LAST_INSERT_ID();
    SELECT control_id;
END //

DELIMITER ;

-- ==============================================
-- Procedimiento para actualizar estadísticas del documento
-- ==============================================
DELIMITER //

DROP PROCEDURE IF EXISTS sp_UpdateCargaInsumosStats //

CREATE PROCEDURE sp_UpdateCargaInsumosStats(
    IN p_document_id VARCHAR(50)
)
BEGIN
    DECLARE v_plan_ventas_count INT DEFAULT 0;
    DECLARE v_existencias_count INT DEFAULT 0;
    DECLARE v_cobertura_count INT DEFAULT 0;
    DECLARE v_total_count INT DEFAULT 0;
    DECLARE v_started_at DATETIME;
    DECLARE v_processing_time INT DEFAULT 0;

    -- Obtener conteos
    SELECT COUNT(*) INTO v_plan_ventas_count FROM plan_ventas WHERE document_id = p_document_id;
    SELECT COUNT(*) INTO v_existencias_count FROM existencias WHERE document_id = p_document_id;
    SELECT COUNT(*) INTO v_cobertura_count FROM cobertura WHERE document_id = p_document_id;

    SET v_total_count = v_plan_ventas_count + v_existencias_count + v_cobertura_count;

    -- Obtener tiempo de inicio para calcular duración
    SELECT started_at INTO v_started_at FROM carga_insumos_control WHERE document_id = p_document_id;

    IF v_started_at IS NOT NULL THEN
        SET v_processing_time = TIMESTAMPDIFF(SECOND, v_started_at, NOW());
    END IF;

    -- Actualizar estadísticas
    UPDATE carga_insumos_control
    SET
        plan_ventas_records = v_plan_ventas_count,
        existencias_records = v_existencias_count,
        cobertura_records = v_cobertura_count,
        total_records = v_total_count,
        status = CASE
            WHEN v_total_count > 0 THEN 'completed'
            ELSE 'processing'
        END,
        completed_at = CASE
            WHEN v_total_count > 0 THEN NOW()
            ELSE completed_at
        END,
        processing_time_seconds = v_processing_time
    WHERE document_id = p_document_id;

    -- Retornar estadísticas actualizadas
    SELECT
        document_id,
        plan_ventas_records,
        existencias_records,
        cobertura_records,
        total_records,
        status,
        processing_time_seconds
    FROM carga_insumos_control
    WHERE document_id = p_document_id;
END //

DELIMITER ;

-- ==============================================
-- Mensajes de confirmación
-- ==============================================
SELECT '=============================================' as mensaje
UNION ALL
SELECT 'Scripts de creación de tablas completados' as mensaje
UNION ALL
SELECT 'Tablas creadas en la base de datos:' as mensaje
UNION ALL
SELECT '  - plan_ventas' as mensaje
UNION ALL
SELECT '  - existencias' as mensaje
UNION ALL
SELECT '  - cobertura' as mensaje
UNION ALL
SELECT '  - carga_insumos_control' as mensaje
UNION ALL
SELECT 'Procedimientos almacenados creados:' as mensaje
UNION ALL
SELECT '  - sp_InsertCargaInsumosControl' as mensaje
UNION ALL
SELECT '  - sp_UpdateCargaInsumosStats' as mensaje
UNION ALL
SELECT '=============================================' as mensaje;
