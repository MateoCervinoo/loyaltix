const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Usuario = sequelize.define('Usuario', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    email: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
        isEmail: {
            msg: "Debe ser un email válido",
        },
        },
    },
    password_hash: {
        type: DataTypes.STRING(255),
        allowNull: false,
    },
    rol: {
        type: DataTypes.STRING(20),
        allowNull: false,
        validate: {
        isIn: {
            args: [['ADMIN', 'VENDEDOR', 'CLIENTE']],
            msg: "Rol inválido",
        },
        },
    },
    cliente_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    }, {
    tableName: 'usuario',
    timestamps: false,
});

module.exports = Usuario;