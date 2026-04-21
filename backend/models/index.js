const Cliente = require('./cliente.model');
const Usuario = require('./usuario.model');
const Institucion = require('./institucion.model');
const Profesion = require('./profesion.model');
const MovimientoPuntos = require('./movimientoPuntos.model');
const MovimientoPuntos = require('./movimientoPuntos.model');
const ConfiguracionPuntos = require('./configuracionPuntos.model');
const Beneficio = require('./beneficio.model');
const Canje = require('./canje.model');

// Relaciones
Cliente.belongsTo(Institucion, { foreignKey: 'institucion_id' });
Cliente.belongsTo(Profesion, { foreignKey: 'profesion_id' });

Usuario.belongsTo(Cliente, { foreignKey: 'cliente_id' });

MovimientoPuntos.belongsTo(Cliente, { foreignKey: 'cliente_id' });
MovimientoPuntos.belongsTo(Usuario, { foreignKey: 'creado_por' });
MovimientoPuntos.belongsTo(ConfiguracionPuntos, { foreignKey: 'configuracion_puntos_id' });
MovimientoPuntos.belongsTo(Beneficio, { foreignKey: 'beneficio_id' });

Canje.belongsTo(Cliente, { foreignKey: 'cliente_id' });
Canje.belongsTo(Beneficio, { foreignKey: 'beneficio_id' });
Canje.belongsTo(MovimientoPuntos, { foreignKey: 'movimiento_puntos_id' });
Canje.belongsTo(Usuario, { foreignKey: 'utilizado_por' });

module.exports = {
    Cliente,
    Usuario,
    Institucion,
    Profesion,
    MovimientoPuntos,
    ConfiguracionPuntos,
    Beneficio,
    Canje,
};