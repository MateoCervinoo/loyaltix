const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const Beneficio = sequelize.define('Beneficio', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    nombre: {
        type: DataTypes.STRING(150),
        allowNull: false,
        validate: {
            notEmpty: {
                msg: 'El nombre del beneficio es requerido'
            }
        }
    },
    descripcion: {
        type: DataTypes.STRING(255),
        allowNull: true,
    },
    imagen_url: {
    type: DataTypes.STRING(500),
    allowNull: true,
    },
    puntos_requeridos: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Los puntos requeridos deben ser mayores a 0'
            }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    profesion_id: {
        type: DataTypes.BIGINT,
        allowNull: true,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'beneficio',
    timestamps: false,
});

module.exports = Beneficio;
