const express = require('express');
const router = express.Router();

const Profesion = require('../models/profesion.model');
const { ValidationError } = require('sequelize');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/profesiones
router.get(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
    try {
        const items = await Profesion.findAll();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 4.1,
            message: 'Error al obtener las profesiones'
        });
    }
});

// GET /api/profesiones/:id
router.get(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
    try {
        const item = await Profesion.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                codigo: 4.2,
                message: 'Profesión no encontrada'
            });
        }

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 4.3,
            message: 'Error al obtener la profesión'
        });
    }
});

// POST /api/profesiones
router.post(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
    try {
        const item = await Profesion.create({
            nombre: req.body.nombre
        });

        res.status(201).json(item);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');

            return res.status(400).json({
                codigo: 4.4,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 4.5,
            message: 'Error interno del servidor'
        });
    }
});

// PUT /api/profesiones/:id
router.put(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
    try {
        const item = await Profesion.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                codigo: 4.6,
                message: 'Profesión no encontrada'
            });
        }

        item.nombre = req.body.nombre;

        await item.save();

        res.status(200).json(item);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');

            return res.status(400).json({
                codigo: 4.7,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 4.8,
            message: 'Error interno del servidor'
        });
    }
});

// DELETE /api/profesiones/:id
router.delete(
    '/:id',
    authMiddleware,
    roleMiddleware('ADMIN'),
    async (req, res) => {
    try {
        const filasBorradas = await Profesion.destroy({
            where: { id: req.params.id }
        });

        if (filasBorradas === 0) {
            return res.status(404).json({
                codigo: 4.9,
                message: 'Profesión no encontrada'
            });
        }

        return res.status(200).json({
            message: 'Profesión eliminada correctamente'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            codigo: 4.10,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;