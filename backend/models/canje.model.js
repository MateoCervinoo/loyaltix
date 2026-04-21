const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Canje = sequelize.define('Canje', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    cliente_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    beneficio_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
    },
    movimiento_puntos_id: {
        type: DataTypes.BIGINT,
        allowNull: false,
        unique: true,
    },
    estado: {
        type: DataTypes.STRING(20),
        allowNull: false,
        defaultValue: 'PENDIENTE',
        validate: {
            isIn: {
                args: [['PENDIENTE', 'UTILIZADO', 'CANCELADO']],
                msg: 'Estado de canje inválido',
            },
        },
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    fecha_utilizacion: {
        type: DataTypes.DATE,
        allowNull: true,
    },
    utilizado_por: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
}, {
    tableName: 'canje',
    timestamps: false,
});

module.exports = Canje;