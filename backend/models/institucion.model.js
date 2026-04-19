const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Institucion = sequelize.define('Institucion', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        unique: true,
        validate: {
        notEmpty: {
            msg: "El nombre de la institución es requerido",
        },
        },
    },
    direccion: {
        type: DataTypes.STRING(255),
    },
    telefono: {
        type: DataTypes.STRING(30),
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    },
    }, {
    tableName: 'institucion',
    timestamps: false,
});

module.exports = Institucion;