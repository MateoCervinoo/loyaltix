const { DataTypes } = require('sequelize');
const sequelize = require('../database/database');

const ConfiguracionPuntos = sequelize.define('ConfiguracionPuntos', {
    id: {
        type: DataTypes.BIGINT,
        primaryKey: true,
        autoIncrement: true,
    },
    monto_base: {
        type: DataTypes.DECIMAL(12, 2),
        allowNull: false,
        validate: {
            min: {
                args: [0.01],
                msg: 'El monto base debe ser mayor a 0'
            }
        }
    },
    puntos_base: {
        type: DataTypes.INTEGER,
        allowNull: false,
        validate: {
            min: {
                args: [1],
                msg: 'Los puntos base deben ser mayores a 0'
            }
        }
    },
    activo: {
        type: DataTypes.BOOLEAN,
        defaultValue: true,
    },
    fecha_creacion: {
        type: DataTypes.DATE,
        defaultValue: DataTypes.NOW,
    }
}, {
    tableName: 'configuracion_puntos',
    timestamps: false,
});

module.exports = ConfiguracionPuntos;