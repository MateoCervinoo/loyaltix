const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Profesion = sequelize.define('Profesion', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(100),
        allowNull: false,
        unique: true,
        validate: {
        notEmpty: {
            msg: "El nombre de la profesión es requerido",
        },
        },
    },
    }, {
    tableName: 'profesion',
    timestamps: false,
});

module.exports = Profesion;