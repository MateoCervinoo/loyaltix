const express = require('express');
const router = express.Router();

const Usuario = require('../models/usuario.model');
const { ValidationError } = require('sequelize');

// GET /api/usuarios
router.get('/', async (req, res) => {
    try {
        const items = await Usuario.findAll({
            attributes: [
                'id',
                'email',
                'rol',
                'cliente_id',
                'activo',
                'fecha_creacion'
            ]
        });

        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 5.1,
            message: 'Error al obtener los usuarios'
        });
    }
});

// GET /api/usuarios/:id
router.get('/:id', async (req, res) => {
    try {
        const item = await Usuario.findByPk(req.params.id, {
            attributes: [
                'id',
                'email',
                'rol',
                'cliente_id',
                'activo',
                'fecha_creacion'
            ]
        });

        if (!item) {
            return res.status(404).json({
                codigo: 5.2,
                message: 'Usuario no encontrado'
            });
        }

        res.json(item);
    } catch (error) {
        console.error(error);
        res.status(500).json({
            codigo: 5.3,
            message: 'Error al obtener el usuario'
        });
    }
});

// POST /api/usuarios
router.post('/', async (req, res) => {
    try {
        const item = await Usuario.create({
            email: req.body.email,
            password_hash: req.body.password_hash,
            rol: req.body.rol,
            cliente_id: req.body.cliente_id,
            activo: req.body.activo
        });

        res.status(201).json({
            id: item.id,
            email: item.email,
            rol: item.rol,
            cliente_id: item.cliente_id,
            activo: item.activo,
            fecha_creacion: item.fecha_creacion
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');

            return res.status(400).json({
                codigo: 5.4,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 5.5,
            message: 'Error interno del servidor'
        });
    }
});

// PUT /api/usuarios/:id
router.put('/:id', async (req, res) => {
    try {
        const item = await Usuario.findByPk(req.params.id);

        if (!item) {
            return res.status(404).json({
                codigo: 5.6,
                message: 'Usuario no encontrado'
            });
        }

        item.email = req.body.email;
        item.password_hash = req.body.password_hash;
        item.rol = req.body.rol;
        item.cliente_id = req.body.cliente_id;
        item.activo = req.body.activo;

        await item.save();

        res.status(200).json({
            id: item.id,
            email: item.email,
            rol: item.rol,
            cliente_id: item.cliente_id,
            activo: item.activo,
            fecha_creacion: item.fecha_creacion
        });
    } catch (err) {
        if (err instanceof ValidationError) {
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');

            return res.status(400).json({
                codigo: 5.7,
                message: messages
            });
        }

        console.error(err);
        res.status(500).json({
            codigo: 5.8,
            message: 'Error interno del servidor'
        });
    }
});

// DELETE /api/usuarios/:id
router.delete('/:id', async (req, res) => {
    try {
        const filasBorradas = await Usuario.destroy({
            where: { id: req.params.id }
        });

        if (filasBorradas === 0) {
            return res.status(404).json({
                codigo: 5.9,
                message: 'Usuario no encontrado'
            });
        }

        return res.status(200).json({
            message: 'Usuario eliminado correctamente'
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            codigo: 5.10,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;