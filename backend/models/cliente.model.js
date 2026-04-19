const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Cliente = sequelize.define('Cliente', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
        notEmpty: {
            msg: "El nombre es requerido",
        },
        },
    },
    apellido: {
        type: DataTypes.STRING(100),
        allowNull: false,
        validate: {
        notEmpty: {
            msg: "El apellido es requerido",
        },
        },
    },
    telefono: {
        type: DataTypes.STRING(30),
        allowNull: false,
        unique: true,
        validate: {
        notEmpty: {
            msg: "El teléfono es requerido",
        },
        },
    },
    institucion_id: {
        type: DataTypes.BIGINT,
    },
    profesion_id: {
        type: DataTypes.BIGINT,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    }, {
    tableName: 'cliente',
    timestamps: false,
});

module.exports = Cliente;