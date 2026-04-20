const Cliente = require('./cliente.model');
const Usuario = require('./usuario.model');
const Institucion = require('./institucion.model');
const Profesion = require('./profesion.model');
const MovimientoPuntos = require('./movimientoPuntos.model');
const MovimientoPuntos = require('./movimientoPuntos.model');
const ConfiguracionPuntos = require('./configuracionPuntos.model');
const Beneficio = require('./beneficio.model');

// Relaciones
Cliente.belongsTo(Institucion, { foreignKey: 'institucion_id' });
Cliente.belongsTo(Profesion, { foreignKey: 'profesion_id' });

Usuario.belongsTo(Cliente, { foreignKey: 'cliente_id' });

MovimientoPuntos.belongsTo(Cliente, { foreignKey: 'cliente_id' });
MovimientoPuntos.belongsTo(Usuario, { foreignKey: 'creado_por' });
MovimientoPuntos.belongsTo(ConfiguracionPuntos, { foreignKey: 'configuracion_puntos_id' });
MovimientoPuntos.belongsTo(Beneficio, { foreignKey: 'beneficio_id' });

module.exports = {
    Cliente,
    Usuario,
    Institucion,
    Profesion,
    MovimientoPuntos,
    ConfiguracionPuntos,
    Beneficio,
};