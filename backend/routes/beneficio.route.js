const express = require('express');
const router = express.Router();

const { ValidationError } = require('sequelize');
const Beneficio = require('../models/beneficio.model');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/beneficios
router.get(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR', 'CLIENTE'),
    async (req, res) => {
        try {
            let whereCondition = {};

            // CLIENTE solo ve activos
            if (req.usuario.rol === 'CLIENTE') {
                whereCondition.activo = true;
            }

            const items = await Beneficio.findAll({
                where: whereCondition,
                attributes: [
                    'id',
                    'nombre',
                    'descripcion',
                    'imagen_url',
                    'puntos_requeridos',
                    'activo',
                    'fecha_creacion'
                ],
                order: [['fecha_creacion', 'DESC']]
            });

            res.json(items);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                codigo: 12.1,
                message: 'Error al obtener los beneficios'
            });
        }
    }
);

// GET /api/beneficios/:id
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR', 'CLIENTE'),
    async (req, res) => {
        try {
            let whereCondition = { id: req.params.id };

            // CLIENTE solo puede ver activos
            if (req.usuario.rol === 'CLIENTE') {
                whereCondition.activo = true;
            }

            const item = await Beneficio.findOne({
                where: whereCondition,
                attributes: [
                    'id',
                    'nombre',
                    'descripcion',
                    'imagen_url',
                    'puntos_requeridos',
                    'activo',
                    'fecha_creacion'
                ]
            });

            if (!item) {
                return res.status(404).json({
                    codigo: 12.2,
                    message: 'Beneficio no encontrado'
                });
            }

            res.json(item);
        } catch (error) {
            console.error(error);
            res.status(500).json({
                codigo: 12.3,
                message: 'Error al obtener el beneficio'
            });
        }
    }
);

// POST /api/beneficios
router.post(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const item = await Beneficio.create({
                nombre: req.body.nombre,
                descripcion: req.body.descripcion,
                imagen_url: req.body.imagen_url,
                puntos_requeridos: req.body.puntos_requeridos,
                activo: req.body.activo
            });

            res.status(201).json(item);
        } catch (err) {
            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 12.4,
                    message: messages
                });
            }

            console.error(err);
            res.status(500).json({
                codigo: 12.5,
                message: 'Error interno del servidor'
            });
        }
    }
);

// PUT /api/beneficios/:id
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const item = await Beneficio.findByPk(req.params.id);

            if (!item) {
                return res.status(404).json({
                    codigo: 12.6,
                    message: 'Beneficio no encontrado'
                });
            }

            item.nombre = req.body.nombre;
            item.descripcion = req.body.descripcion;
            item.imagen_url = req.body.imagen_url;
            item.puntos_requeridos = req.body.puntos_requeridos;
            item.activo = req.body.activo;

            await item.save();

            res.status(200).json(item);
        } catch (err) {
            if (err instanceof ValidationError) {
                let messages = '';
                err.errors.forEach((x) => {
                    messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
                });

                return res.status(400).json({
                    codigo: 12.7,
                    message: messages
                });
            }

            console.error(err);
            res.status(500).json({
                codigo: 12.8,
                message: 'Error interno del servidor'
            });
        }
    }
);

// PATCH /api/beneficios/:id/toggle-activo
router.patch(
    '/:id/toggle-activo',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
        try {
            const item = await Beneficio.findByPk(req.params.id);

            if (!item) {
                return res.status(404).json({
                    codigo: 12.9,
                    message: 'Beneficio no encontrado'
                });
            }

            item.activo = !item.activo;
            await item.save();

            res.status(200).json({
                message: 'Estado del beneficio actualizado correctamente',
                beneficio: item
            });
        } catch (error) {
            console.error(error);
            res.status(500).json({
                codigo: 12.10,
                message: 'Error interno del servidor'
            });
        }
    }
);

module.exports = router;