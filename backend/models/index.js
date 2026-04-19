const Cliente = require('./cliente.model');
const Usuario = require('./usuario.model');
const Institucion = require('./institucion.model');
const Profesion = require('./profesion.model');
const MovimientoPuntos = require('./movimientoPuntos.model');

// Relaciones

Cliente.belongsTo(Institucion, { foreignKey: 'institucion_id' });
Cliente.belongsTo(Profesion, { foreignKey: 'profesion_id' });

Usuario.belongsTo(Cliente, { foreignKey: 'cliente_id' });

MovimientoPuntos.belongsTo(Cliente, { foreignKey: 'cliente_id' });
MovimientoPuntos.belongsTo(Usuario, { foreignKey: 'creado_por' });

module.exports = {
    Cliente,
    Usuario,
    Institucion,
    Profesion,
    MovimientoPuntos,
};