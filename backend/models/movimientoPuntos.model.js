const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const MovimientoPuntos = sequelize.define('MovimientoPuntos', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    cliente_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    cantidad: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            notZero(value) {
                if (value === 0) {
                    throw new Error('La cantidad no puede ser 0');
                }
            },
        },
    },
    tipo: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
            isIn: {
                args: [['CARGA', 'CANJE', 'AJUSTE', 'BONIFICACION', 'VENCIMIENTO']],
                msg: 'Tipo de movimiento inválido',
            },
        },
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    fecha: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    creado_por: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    monto_compra: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: true,
        validate: {
            esPositivo(value) {
                if (value !== null && Number(value) <= 0) {
                    throw new Error('El monto de compra debe ser mayor a 0');
                }
            }
        }
    },
    configuracion_puntos_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    beneficio_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    }
}, {
    tableName: 'movimiento_puntos',
    timestamps: false,
});

module.exports = MovimientoPuntos;