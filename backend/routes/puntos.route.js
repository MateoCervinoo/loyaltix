const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const sequelize = require('../database/database');

const MovimientoPuntos = require('../models/movimientoPuntos.model');
const ConfiguracionPuntos = require('../models/configuracionPuntos.model');
const Beneficio = require('../models/beneficio.model');
const Cliente = require('../models/cliente.model');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { enviarEmail } = require('../services/email.service');
const {
    parseExcelRows,
    validateBulkRow,
    validateBulkRows,
    saveBulkRows
} = require('../services/puntosBulkUpload.service');

const calcularPuntos = (montoCompra, montoBase, puntosBase) => {
    return Math.floor((Number(montoCompra) * Number(puntosBase)) / Number(montoBase));
};

const obtenerSaldoCliente = async (clienteId, transaction = null) => {
    const saldo = await MovimientoPuntos.sum('cantidad', {
        where: { cliente_id: clienteId },
        transaction
    });

    return saldo || 0;
};

// POST /api/puntos/bulk-preview
router.post(
    '/bulk-preview',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const rows = parseExcelRows(req.body.fileBase64);
            const preview = await validateBulkRows(rows);

            return res.status(200).json(preview);
        } catch (error) {
            console.error(error);
            return res.status(error.status || 500).json({
                error: error.message || 'Error interno del servidor'
            });
        }
    }
);

// POST /api/puntos/bulk-revalidate-row
router.post(
    '/bulk-revalidate-row',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const row = await validateBulkRow(req.body);

            return res.status(200).json(row);
        } catch (error) {
            console.error(error);
            return res.status(error.status || 500).json({
                error: error.message || 'Error interno del servidor'
            });
        }
    }
);

// POST /api/puntos/bulk-confirm
router.post(
    '/bulk-confirm',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const rows = Array.isArray(req.body.rows) ? req.body.rows : [];
            const result = await saveBulkRows({
                rows,
                usuarioId: req.usuario.id,
                transaction
            });

            await transaction.commit();

            return res.status(201).json({
                message: `${result.movimientosCreados} movimientos acreditados`,
                ...result
            });
        } catch (error) {
            await transaction.rollback();

            console.error(error);
            return res.status(error.status || 500).json({
                error: error.message || 'Error interno del servidor',
                validation: error.validation
            });
        }
    }
);

// GET /api/puntos/cliente/:id/saldo
router.get(
    '/cliente/:id/saldo',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const cliente = await Cliente.findByPk(req.params.id);

            if (!cliente) {
                return res.status(404).json({
                    codigo: 11.1,
                    message: 'Cliente no encontrado'
                });
            }

            const saldo = await obtenerSaldoCliente(req.params.id);

            return res.status(200).json({
                cliente_id: Number(req.params.id),
                saldo: saldo
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 11.2,
                message: 'Error interno del servidor'
            });
        }
    }
);

// GET /api/puntos/cliente/:id/historial
router.get(
    '/cliente/:id/historial',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const cliente = await Cliente.findByPk(req.params.id);

            if (!cliente) {
                return res.status(404).json({
                    codigo: 11.3,
                    message: 'Cliente no encontrado'
                });
            }

            const items = await MovimientoPuntos.findAll({
                where: { cliente_id: req.params.id },
                order: [['fecha', 'DESC']]
            });

            return res.status(200).json(items);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 11.4,
                message: 'Error interno del servidor'
            });
        }
    }
);

// GET /api/puntos/mis-puntos
router.get(
    '/mis-puntos',
    authMiddleware,
    roleMiddleware('CLIENTE'),
    async (req, res) => {
        try {
            const saldo = await obtenerSaldoCliente(req.usuario.cliente_id);

            return res.status(200).json({
                cliente_id: req.usuario.cliente_id,
                saldo: saldo
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 11.5,
                message: 'Error interno del servidor'
            });
        }
    }
);

// GET /api/puntos/mi-historial
router.get(
    '/mi-historial',
    authMiddleware,
    roleMiddleware('CLIENTE'),
    async (req, res) => {
        try {
            const items = await MovimientoPuntos.findAll({
                where: { cliente_id: req.usuario.cliente_id },
                order: [['fecha', 'DESC']]
            });

            return res.status(200).json(items);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 11.6,
                message: 'Error interno del servidor'
            });
        }
    }
);

// POST /api/puntos/cargar
router.post(
    '/cargar',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const { cliente_id, monto_compra, descripcion } = req.body;

            if (!cliente_id || !monto_compra) {
                return res.status(400).json({
                    codigo: 11.7,
                    message: 'cliente_id y monto_compra son obligatorios'
                });
            }

            const cliente = await Cliente.findByPk(cliente_id);

            if (!cliente) {
                return res.status(404).json({
                    codigo: 11.8,
                    message: 'Cliente no encontrado'
                });
            }

            const configuracion = await ConfiguracionPuntos.findOne({
                where: { activo: true },
                order: [['fecha_creacion', 'DESC']]
            });

            if (!configuracion) {
                return res.status(400).json({
                    codigo: 11.9,
                    message: 'No existe una configuración de puntos activa'
                });
            }

            const puntosCalculados = calcularPuntos(
                monto_compra,
                configuracion.monto_base,
                configuracion.puntos_base
            );

            if (puntosCalculados <= 0) {
                return res.status(400).json({
                    codigo: 11.10,
                    message: 'El monto ingresado no genera puntos'
                });
            }

            const item = await MovimientoPuntos.create({
                cliente_id: cliente_id,
                cantidad: puntosCalculados,
                tipo: 'CARGA',
                descripcion: descripcion || 'Carga de puntos por compra',
                creado_por: req.usuario.id,
                monto_compra: monto_compra,
                configuracion_puntos_id: configuracion.id,
                beneficio_id: null
            });

            if (cliente.email) {
                try {
                    await enviarEmail(
                        cliente.email,
                        'Puntos acreditados',
                        `Se te acreditaron ${puntosCalculados} puntos`
                    );
                } catch (emailError) {
                    console.error('Error al enviar email de puntos acreditados:', emailError);
                }
            }

            return res.status(201).json(item);
        } catch (err) {
            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 11.11,
                    message: messages
                });
            }

            console.error(err);
            return res.status(500).json({
                codigo: 11.12,
                message: 'Error interno del servidor'
            });
        }
    }
);

// POST /api/puntos/ajustar
router.post(
    '/ajustar',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const { cliente_id, cantidad, descripcion } = req.body;

            if (!cliente_id || !cantidad) {
                return res.status(400).json({
                    codigo: 11.13,
                    message: 'cliente_id y cantidad son obligatorios'
                });
            }

            if (Number(cantidad) === 0) {
                return res.status(400).json({
                    codigo: 11.14,
                    message: 'La cantidad no puede ser 0'
                });
            }

            const cliente = await Cliente.findByPk(cliente_id);

            if (!cliente) {
                return res.status(404).json({
                    codigo: 11.15,
                    message: 'Cliente no encontrado'
                });
            }

            const item = await MovimientoPuntos.create({
                cliente_id: cliente_id,
                cantidad: Number(cantidad),
                tipo: 'AJUSTE',
                descripcion: descripcion || 'Ajuste manual de puntos',
                creado_por: req.usuario.id,
                monto_compra: null,
                configuracion_puntos_id: null,
                beneficio_id: null
            });

            return res.status(201).json(item);
        } catch (err) {
            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 11.16,
                    message: messages
                });
            }

            console.error(err);
            return res.status(500).json({
                codigo: 11.17,
                message: 'Error interno del servidor'
            });
        }
    }
);

// POST /api/puntos/canjear
router.post(
    '/canjear',
    authMiddleware,
    roleMiddleware('CLIENTE'),
    async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { beneficio_id, descripcion } = req.body;

            if (!beneficio_id) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 11.18,
                    message: 'beneficio_id es obligatorio'
                });
            }

            const beneficio = await Beneficio.findByPk(beneficio_id, { transaction });

            if (!beneficio) {
                await transaction.rollback();
                return res.status(404).json({
                    codigo: 11.19,
                    message: 'Beneficio no encontrado'
                });
            }

            if (!beneficio.activo) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 11.20,
                    message: 'El beneficio no está activo'
                });
            }

            const saldoActual = await obtenerSaldoCliente(req.usuario.cliente_id, transaction);

            if (saldoActual < beneficio.puntos_requeridos) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 11.21,
                    message: 'Saldo insuficiente para realizar el canje'
                });
            }

            const item = await MovimientoPuntos.create(
                {
                    cliente_id: req.usuario.cliente_id,
                    cantidad: -beneficio.puntos_requeridos,
                    tipo: 'CANJE',
                    descripcion: descripcion || `Canje de beneficio: ${beneficio.nombre}`,
                    creado_por: req.usuario.id,
                    monto_compra: null,
                    configuracion_puntos_id: null,
                    beneficio_id: beneficio.id
                },
                { transaction }
            );

            await transaction.commit();

            return res.status(201).json({
                message: 'Canje realizado correctamente',
                movimiento: item
            });
        } catch (err) {
            await transaction.rollback();

            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 11.22,
                    message: messages
                });
            }

            console.error(err);
            return res.status(500).json({
                codigo: 11.23,
                message: 'Error interno del servidor'
            });
        }
    }
);

module.exports = router;
