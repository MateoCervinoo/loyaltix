const express = require('express');
const router = express.Router();

const Institucion = require('../models/institucion.model');
const { ValidationError } = require('sequelize');

// GET /api/instituciones
router.get('/', async (req, res) => {
    try {
        const items = await Institucion.findAll();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 3.1,
            message: 'Error al obtener las instituciones'
        });
    }
});

// GET /api/instituciones/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await Institucion.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                codigo: 3.2,
                message: 'Institución no encontrada'
            });
        }

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 3.3,
            message: 'Error al obtener la institución'
        });
    }
});

// POST /api/instituciones
router.post('/', async (req, res) => {
    try {
        const item = await Institucion.create({
            nombre: req.body.nombre,
            direccion: req.body.direccion,
            telefono: req.body.telefono
        });

        res.status(201).json(item);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');

            return res.status(400).json({
                codigo: 3.4,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 3.5,
            message: 'Error interno del servidor'
        });
    }
});

// PUT /api/instituciones/:id
router.put('/:id', async (req, res) => {
    try {
        const item = await Institucion.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                codigo: 3.6,
                message: 'Institución no encontrada'
            });
        }

        item.nombre = req.body.nombre;
        item.direccion = req.body.direccion;
        item.telefono = req.body.telefono;

        await item.save();

        res.status(200).json(item);
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');

            return res.status(400).json({
                codigo: 3.7,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 3.8,
            message: 'Error interno del servidor'
        });
    }
});

// DELETE /api/instituciones/:id
router.delete('/:id', async (req, res) => {
    try {
        const filasBorradas = await Institucion.destroy({
            where: { id: req.params.id }
        });

        if (filasBorradas === 0) {
            return res.status(404).json({
                codigo: 3.9,
                message: 'Institución no encontrada'
            });
        }

        return res.status(200).json({
            message: 'Institución eliminada correctamente'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            codigo: 3.10,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;