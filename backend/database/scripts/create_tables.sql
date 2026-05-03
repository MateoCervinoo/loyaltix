-- =========================
-- TABLA: profesion
-- =========================
CREATE TABLE profesion (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL UNIQUE
);

-- =========================
-- TABLA: institucion
-- =========================
CREATE TABLE institucion (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL UNIQUE,
    direccion VARCHAR(255),
    telefono VARCHAR(30),
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP
);

-- =========================
-- TABLA: cliente
-- =========================
CREATE TABLE cliente (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(100) NOT NULL,
    apellido VARCHAR(100) NOT NULL,
    telefono VARCHAR(30) NOT NULL UNIQUE,
    institucion_id BIGINT,
    profesion_id BIGINT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_cliente_institucion
        FOREIGN KEY (institucion_id) REFERENCES institucion(id),
    CONSTRAINT fk_cliente_profesion
        FOREIGN KEY (profesion_id) REFERENCES profesion(id)
);

-- =========================
-- TABLA: usuario
-- =========================
CREATE TABLE usuario (
    id BIGSERIAL PRIMARY KEY,
    email VARCHAR(150) NOT NULL UNIQUE,
    password_hash VARCHAR(255) NOT NULL,
    rol VARCHAR(20) NOT NULL,
    cliente_id BIGINT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_usuario_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT chk_usuario_rol
        CHECK (rol IN ('ADMIN', 'VENDEDOR', 'CLIENTE'))
);

-- =========================
-- TABLA: configuracion_puntos
-- =========================
CREATE TABLE configuracion_puntos (
    id BIGSERIAL PRIMARY KEY,
    monto_base NUMERIC(12,2) NOT NULL,
    puntos_base INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT chk_configuracion_monto_base
        CHECK (monto_base > 0),
    CONSTRAINT chk_configuracion_puntos_base
        CHECK (puntos_base > 0)
);

-- =========================
-- TABLA: beneficio
-- =========================
CREATE TABLE beneficio (
    id BIGSERIAL PRIMARY KEY,
    nombre VARCHAR(150) NOT NULL,
    descripcion VARCHAR(255),
    puntos_requeridos INTEGER NOT NULL,
    activo BOOLEAN NOT NULL DEFAULT TRUE,
    imagen_url VARCHAR(500),
    profesion_id BIGINT,
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    CONSTRAINT fk_beneficio_profesion
        FOREIGN KEY (profesion_id) REFERENCES profesion(id),
    CONSTRAINT chk_beneficio_puntos
        CHECK (puntos_requeridos > 0)
);

-- =========================
-- TABLA: movimiento_puntos
-- =========================
CREATE TABLE movimiento_puntos (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    cantidad INTEGER NOT NULL,
    tipo VARCHAR(20) NOT NULL,
    descripcion VARCHAR(255),
    fecha TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    creado_por BIGINT NULL,

    -- Para cargas
    monto_compra NUMERIC(12,2) NULL,
    configuracion_puntos_id BIGINT NULL,

    -- Para canjes
    beneficio_id BIGINT NULL,

    CONSTRAINT fk_movimiento_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id),

    CONSTRAINT fk_movimiento_creado_por
        FOREIGN KEY (creado_por) REFERENCES usuario(id),

    CONSTRAINT fk_movimiento_configuracion
        FOREIGN KEY (configuracion_puntos_id) REFERENCES configuracion_puntos(id),

    CONSTRAINT fk_movimiento_beneficio
        FOREIGN KEY (beneficio_id) REFERENCES beneficio(id),

    CONSTRAINT chk_tipo_movimiento
        CHECK (tipo IN ('CARGA', 'CANJE', 'AJUSTE', 'BONIFICACION', 'VENCIMIENTO')),

    CONSTRAINT chk_cantidad_no_cero
        CHECK (cantidad <> 0),

    CONSTRAINT chk_monto_compra_positivo
        CHECK (monto_compra IS NULL OR monto_compra > 0)
);

-- =========================
-- TABLA: canje
-- =========================
CREATE TABLE canje (
    id BIGSERIAL PRIMARY KEY,
    cliente_id BIGINT NOT NULL,
    beneficio_id BIGINT NOT NULL,
    movimiento_puntos_id BIGINT NOT NULL,
    estado VARCHAR(20) NOT NULL DEFAULT 'PENDIENTE',
    fecha_creacion TIMESTAMP NOT NULL DEFAULT CURRENT_TIMESTAMP,
    fecha_utilizacion TIMESTAMP NULL,
    utilizado_por BIGINT NULL,

    CONSTRAINT fk_canje_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id),

    CONSTRAINT fk_canje_beneficio
        FOREIGN KEY (beneficio_id) REFERENCES beneficio(id),

    CONSTRAINT fk_canje_movimiento
        FOREIGN KEY (movimiento_puntos_id) REFERENCES movimiento_puntos(id),

    CONSTRAINT fk_canje_utilizado_por
        FOREIGN KEY (utilizado_por) REFERENCES usuario(id),

    CONSTRAINT chk_canje_estado
        CHECK (estado IN ('PENDIENTE', 'UTILIZADO', 'CANCELADO'))
);

-- =========================
-- ÍNDICES
-- =========================
CREATE INDEX idx_cliente_profesion ON cliente(profesion_id);
CREATE INDEX idx_cliente_institucion ON cliente(institucion_id);

CREATE INDEX idx_usuario_cliente ON usuario(cliente_id);

CREATE UNIQUE INDEX uq_usuario_cliente_unico
ON usuario (cliente_id)
WHERE rol = 'CLIENTE' AND cliente_id IS NOT NULL;

CREATE INDEX idx_movimiento_cliente ON movimiento_puntos(cliente_id);
CREATE INDEX idx_movimiento_creado_por ON movimiento_puntos(creado_por);
CREATE INDEX idx_movimiento_fecha ON movimiento_puntos(fecha);
CREATE INDEX idx_movimiento_tipo ON movimiento_puntos(tipo);
CREATE INDEX idx_movimiento_configuracion ON movimiento_puntos(configuracion_puntos_id);
CREATE INDEX idx_movimiento_beneficio ON movimiento_puntos(beneficio_id);

CREATE INDEX idx_beneficio_activo ON beneficio(activo);
CREATE INDEX idx_beneficio_profesion ON beneficio(profesion_id);
CREATE INDEX idx_configuracion_activo ON configuracion_puntos(activo);

CREATE INDEX idx_canje_cliente ON canje(cliente_id);
CREATE INDEX idx_canje_beneficio ON canje(beneficio_id);
CREATE INDEX idx_canje_estado ON canje(estado);
CREATE INDEX idx_canje_fecha_creacion ON canje(fecha_creacion);
CREATE INDEX idx_canje_movimiento ON canje(movimiento_puntos_id);
