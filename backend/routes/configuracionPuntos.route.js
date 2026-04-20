const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const sequelize = require('../database/database');
const ConfiguracionPuntos = require('../models/configuracionPuntos.model');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/configuracion-puntos
router.get(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const items = await ConfiguracionPuntos.findAll({
                attributes: [
                    'id',
                    'monto_base',
                    'puntos_base',
                    'activo',
                    'fecha_creacion'
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            res.json(items);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                codigo: 10.1,
                message: 'Error al obtener las configuraciones de puntos'
            });
        }
    }
);

// GET /api/configuracion-puntos/activa
router.get(
    '/activa',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const item = await ConfiguracionPuntos.findOne({
                where: { activo: true },
                attributes: [
                    'id',
                    'monto_base',
                    'puntos_base',
                    'activo',
                    'fecha_creacion'
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            if (!item) {
                return res.status(404).json({
                    codigo: 10.2,
                    message: 'No hay una configuración activa'
                });
            }

            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                codigo: 10.3,
                message: 'Error al obtener la configuración activa'
            });
        }
    }
);

// GET /api/configuracion-puntos/:id
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const item = await ConfiguracionPuntos.findByPk(req.params.id, {
                attributes: [
                    'id',
                    'monto_base',
                    'puntos_base',
                    'activo',
                    'fecha_creacion'
                ]
            });

            if (!item) {
                return res.status(404).json({
                    codigo: 10.4,
                    message: 'Configuración no encontrada'
                });
            }

            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                codigo: 10.5,
                message: 'Error al obtener la configuración'
            });
        }
    }
);

// POST /api/configuracion-puntos
router.post(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const { monto_base, puntos_base, activo } = req.body;

            if (activo === true) {
                await ConfiguracionPuntos.update(
                    { activo: false },
                    { where: { activo: true }, transaction }
                );
            }

            const item = await ConfiguracionPuntos.create(
                {
                    monto_base,
                    puntos_base,
                    activo: activo ?? true
                },
                { transaction }
            );

            await transaction.commit();

            res.status(201).json(item);
        } catch (err) {
            await transaction.rollback();

            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 10.6,
                    message: messages
                });
            }

            console.error(err);
            res.status(500).json({
                codigo: 10.7,
                message: 'Error interno del servidor'
            });
        }
    }
);

// PUT /api/configuracion-puntos/:id
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const item = await ConfiguracionPuntos.findByPk(req.params.id);

            if (!item) {
                await transaction.rollback();
                return res.status(404).json({
                    codigo: 10.8,
                    message: 'Configuración no encontrada'
                });
            }

            const { monto_base, puntos_base, activo } = req.body;

            if (activo === true) {
                await ConfiguracionPuntos.update(
                    { activo: false },
                    {
                        where: {
                            activo: true
                        },
                        transaction
                    }
                );
            }

            item.monto_base = monto_base;
            item.puntos_base = puntos_base;
            item.activo = activo;

            await item.save({ transaction });
            await transaction.commit();

            res.status(200).json(item);
        } catch (err) {
            await transaction.rollback();

            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 10.9,
                    message: messages
                });
            }

            console.error(err);
            res.status(500).json({
                codigo: 10.10,
                message: 'Error interno del servidor'
            });
        }
    }
);

// PATCH /api/configuracion-puntos/:id/activar
router.patch(
    '/:id/activar',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        const transaction = await sequelize.transaction();

        try {
            const item = await ConfiguracionPuntos.findByPk(req.params.id);

            if (!item) {
                await transaction.rollback();
                return res.status(404).json({
                    codigo: 10.11,
                    message: 'Configuración no encontrada'
                });
            }

            await ConfiguracionPuntos.update(
                { activo: false },
                { where: { activo: true }, transaction }
            );

            item.activo = true;
            await item.save({ transaction });

            await transaction.commit();

            res.status(200).json({
                message: 'Configuración activada correctamente',
                configuracion: item
            });
        } catch (error) {
            await transaction.rollback();
            console.error(error);
            res.status(500).json({
                codigo: 10.12,
                message: 'Error interno del servidor'
            });
        }
    }
);

module.exports = router;