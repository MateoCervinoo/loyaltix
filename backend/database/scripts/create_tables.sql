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
    CONSTRAINT fk_movimiento_cliente
        FOREIGN KEY (cliente_id) REFERENCES cliente(id),
    CONSTRAINT fk_movimiento_creado_por
        FOREIGN KEY (creado_por) REFERENCES usuario(id),
    CONSTRAINT chk_tipo_movimiento
        CHECK (tipo IN ('CARGA', 'CANJE', 'AJUSTE', 'BONIFICACION', 'VENCIMIENTO')),
    CONSTRAINT chk_cantidad_no_cero
        CHECK (cantidad <> 0)
);

-- =========================
-- ÍNDICES
-- =========================
CREATE INDEX idx_cliente_profesion ON cliente(profesion_id);
CREATE INDEX idx_cliente_institucion ON cliente(institucion_id);
CREATE INDEX idx_usuario_cliente ON usuario(cliente_id);
CREATE INDEX idx_movimiento_cliente ON movimiento_puntos(cliente_id);
CREATE INDEX idx_movimiento_creado_por ON movimiento_puntos(creado_por);
CREATE INDEX idx_movimiento_fecha ON movimiento_puntos(fecha);