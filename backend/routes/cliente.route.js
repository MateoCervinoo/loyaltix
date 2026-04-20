const express = require('express');
const router = express.Router();

const Cliente = require('../models/cliente.model');
const { ValidationError } = require('sequelize');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/clientes
router.get(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
    try {
        const items = await Cliente.findAll({
            attributes: [
                'id',
                'nombre',
                'apellido',
                'telefono',
                'institucion_id',
                'profesion_id',
                'fecha_creacion'
            ]
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 2.1,
            message: 'Error al obtener los clientes'
        });
    }
});

// GET /api/clientes/:id
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR', 'CLIENTE'),
    async (req, res) => {
    try {
        const item = await Cliente.findOne({
            attributes: [
                'id',
                'nombre',
                'apellido',
                'telefono',
                'institucion_id',
                'profesion_id',
                'fecha_creacion'
            ],
            where: { id: req.params.id }
        });

        if (!item) {
            return res.status(404).json({
                codigo: 2.3,
                message: 'Cliente no encontrado'
            });
        }

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 2.6,
            message: 'Error al obtener el cliente'
        });
    }
});

// POST /api/clientes
router.post(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
    try {
        const item = await Cliente.create({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            telefono: req.body.telefono,
            institucion_id: req.body.institucion_id,
            profesion_id: req.body.profesion_id
        });

        res.status(201).json(item);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => {
                messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
            });

            return res.status(400).json({
                codigo: 2.2,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 2.7,
            message: 'Error interno del servidor'
        });
    }
});

// PUT /api/clientes/:id
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR', 'CLIENTE'),
    async (req, res) => {
    try {
        const item = await Cliente.findOne({
            attributes: [
                'id',
                'nombre',
                'apellido',
                'telefono',
                'institucion_id',
                'profesion_id',
                'fecha_creacion'
            ],
            where: { id: req.params.id }
        });

        if (!item) {
            return res.status(404).json({
                codigo: 2.3,
                message: 'Cliente no encontrado'
            });
        }

        item.nombre = req.body.nombre;
        item.apellido = req.body.apellido;
        item.telefono = req.body.telefono;
        item.institucion_id = req.body.institucion_id;
        item.profesion_id = req.body.profesion_id;

        await item.save();

        res.status(200).json(item);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => {
                messages += (x.path ?? 'campo') + ': ' + x.message + '\n';
            });

            return res.status(400).json({
                codigo: 2.2,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 2.8,
            message: 'Error interno del servidor'
        });
    }
});

// DELETE /api/clientes/:id
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
    try {
        const filasBorradas = await Cliente.destroy({
            where: { id: req.params.id }
        });

        if (filasBorradas === 0) {
            return res.status(404).json({
                codigo: 2.4,
                message: 'Cliente no encontrado'
            });
        }

        return res.status(200).json({
            message: 'Cliente eliminado correctamente'
        });
    } catch (error) {
        console.error(error);
        return res.status(500).json({
            codigo: 2.5,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;