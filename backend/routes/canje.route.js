const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const sequelize = require('../database/database');

const Canje = require('../models/canje.model');
const Beneficio = require('../models/beneficio.model');
const Cliente = require('../models/cliente.model');
const MovimientoPuntos = require('../models/movimientoPuntos.model');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');
const { enviarEmail } = require('../services/email.service');

const generarCodigoCanje = (id) => {
    return `CANJE-${String(id).padStart(4, '0')}`;
};

const obtenerSaldoCliente = async (clienteId, transaction = null) => {
    const saldo = await MovimientoPuntos.sum('cantidad', {
        where: { cliente_id: clienteId },
        transaction
    });

    return saldo || 0;
};

// POST /api/canjes
// Cliente crea un canje
router.post(
    '/',
    authMiddleware,
    roleMiddleware('CLIENTE'),
    async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { beneficio_id } = req.body;

            if (!beneficio_id) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 13.1,
                    message: 'beneficio_id es obligatorio'
                });
            }

            const cliente = await Cliente.findByPk(req.usuario.cliente_id, { transaction });

            if (!cliente) {
                await transaction.rollback();
                return res.status(404).json({
                    codigo: 13.2,
                    message: 'Cliente no encontrado'
                });
            }

            const beneficio = await Beneficio.findByPk(beneficio_id, { transaction });

            if (!beneficio) {
                await transaction.rollback();
                return res.status(404).json({
                    codigo: 13.3,
                    message: 'Beneficio no encontrado'
                });
            }

            if (!beneficio.activo) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 13.4,
                    message: 'El beneficio no está activo'
                });
            }

            if (beneficio.profesion_id && Number(beneficio.profesion_id) !== Number(cliente.profesion_id)) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 13.16,
                    message: 'El beneficio no está disponible para tu profesión'
                });
            }

            const saldoActual = await obtenerSaldoCliente(req.usuario.cliente_id, transaction);

            if (saldoActual < beneficio.puntos_requeridos) {
                await transaction.rollback();
                return res.status(400).json({
                    codigo: 13.5,
                    message: 'Saldo insuficiente para realizar el canje'
                });
            }

            const movimiento = await MovimientoPuntos.create(
                {
                    cliente_id: req.usuario.cliente_id,
                    cantidad: -beneficio.puntos_requeridos,
                    tipo: 'CANJE',
                    descripcion: `Canje pendiente de beneficio: ${beneficio.nombre}`,
                    creado_por: req.usuario.id,
                    monto_compra: null,
                    configuracion_puntos_id: null,
                    beneficio_id: beneficio.id
                },
                { transaction }
            );

            const canje = await Canje.create(
                {
                    cliente_id: req.usuario.cliente_id,
                    beneficio_id: beneficio.id,
                    movimiento_puntos_id: movimiento.id,
                    estado: 'PENDIENTE',
                    fecha_utilizacion: null,
                    utilizado_por: null
                },
                { transaction }
            );

            await transaction.commit();

            if (cliente.email) {
                try {
                    await enviarEmail(
                        cliente.email,
                        'Canje realizado',
                        `Canjeaste: ${beneficio.nombre}`
                    );
                } catch (emailError) {
                    console.error('Error al enviar email de canje realizado:', emailError);
                }
            }

            return res.status(201).json({
                message: 'Canje creado correctamente',
                canje: {
                    id: canje.id,
                    codigo: generarCodigoCanje(canje.id),
                    cliente_id: canje.cliente_id,
                    beneficio_id: canje.beneficio_id,
                    movimiento_puntos_id: canje.movimiento_puntos_id,
                    estado: canje.estado,
                    fecha_creacion: canje.fecha_creacion,
                    fecha_utilizacion: canje.fecha_utilizacion,
                    utilizado_por: canje.utilizado_por
                }
            });
        } catch (err) {
            await transaction.rollback();

            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 13.6,
                    message: messages
                });
            }

            console.error(err);
            return res.status(500).json({
                codigo: 13.7,
                message: 'Error interno del servidor'
            });
        }
    }
);

// GET /api/canjes/mis-canjes
// Cliente ve sus canjes
router.get(
    '/mis-canjes',
    authMiddleware,
    roleMiddleware('CLIENTE'),
    async (req, res) => {
        try {
            const items = await Canje.findAll({
                where: { cliente_id: req.usuario.cliente_id },
                include: [
                    {
                        model: Beneficio,
                        attributes: ['id', 'nombre', 'descripcion', 'puntos_requeridos', 'imagen_url']
                    }
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            const resultado = items.map((item) => ({
                id: item.id,
                codigo: generarCodigoCanje(item.id),
                cliente_id: item.cliente_id,
                beneficio_id: item.beneficio_id,
                movimiento_puntos_id: item.movimiento_puntos_id,
                estado: item.estado,
                fecha_creacion: item.fecha_creacion,
                fecha_utilizacion: item.fecha_utilizacion,
                utilizado_por: item.utilizado_por,
                beneficio: item.Beneficio
            }));

            return res.status(200).json(resultado);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 13.8,
                message: 'Error interno del servidor'
            });
        }
    }
);

// GET /api/canjes/pendientes
// Vendedor/Admin ve canjes pendientes
router.get(
    '/pendientes',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const items = await Canje.findAll({
                where: { estado: 'PENDIENTE' },
                include: [
                    {
                        model: Cliente,
                        attributes: ['id', 'nombre', 'apellido', 'telefono']
                    },
                    {
                        model: Beneficio,
                        attributes: ['id', 'nombre', 'descripcion', 'puntos_requeridos', 'imagen_url']
                    }
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            const resultado = items.map((item) => ({
                id: item.id,
                codigo: generarCodigoCanje(item.id),
                cliente_id: item.cliente_id,
                beneficio_id: item.beneficio_id,
                movimiento_puntos_id: item.movimiento_puntos_id,
                estado: item.estado,
                fecha_creacion: item.fecha_creacion,
                fecha_utilizacion: item.fecha_utilizacion,
                utilizado_por: item.utilizado_por,
                cliente: item.Cliente,
                beneficio: item.Beneficio
            }));

            return res.status(200).json(resultado);
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 13.9,
                message: 'Error interno del servidor'
            });
        }
    }
);

// PATCH /api/canjes/:id/utilizar
// Vendedor/Admin marca canje como utilizado
router.patch(
    '/:id/utilizar',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const item = await Canje.findByPk(req.params.id);

            if (!item) {
                return res.status(404).json({
                    codigo: 13.10,
                    message: 'Canje no encontrado'
                });
            }

            if (item.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    codigo: 13.11,
                    message: 'Solo se pueden utilizar canjes pendientes'
                });
            }

            item.estado = 'UTILIZADO';
            item.fecha_utilizacion = new Date();
            item.utilizado_por = req.usuario.id;

            await item.save();

            return res.status(200).json({
                message: 'Canje marcado como utilizado',
                canje: {
                    id: item.id,
                    codigo: generarCodigoCanje(item.id),
                    estado: item.estado,
                    fecha_utilizacion: item.fecha_utilizacion,
                    utilizado_por: item.utilizado_por
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 13.12,
                message: 'Error interno del servidor'
            });
        }
    }
);

// PATCH /api/canjes/:id/cancelar
// Solo ADMIN puede cancelar
router.patch(
    '/:id/cancelar',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const item = await Canje.findByPk(req.params.id);

            if (!item) {
                return res.status(404).json({
                    codigo: 13.13,
                    message: 'Canje no encontrado'
                });
            }

            if (item.estado !== 'PENDIENTE') {
                return res.status(400).json({
                    codigo: 13.14,
                    message: 'Solo se pueden cancelar canjes pendientes'
                });
            }

            item.estado = 'CANCELADO';
            await item.save();

            return res.status(200).json({
                message: 'Canje cancelado correctamente',
                canje: {
                    id: item.id,
                    codigo: generarCodigoCanje(item.id),
                    estado: item.estado
                }
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 13.15,
                message: 'Error interno del servidor'
            });
        }
    }
);

module.exports = router;
