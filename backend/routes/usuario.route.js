const express = require('express');
const router = express.Router();

const Usuario = require('../models/usuario.model');
const { ValidationError } = require('sequelize');
const bcrypt = require('bcrypt');

const validarReglaUsuario = (rol, cliente_id) => {
    if (rol === 'CLIENTE' && (cliente_id === null || cliente_id === undefined)) {
        return 'Si el rol es CLIENTE, cliente_id es obligatorio';
    }

    if (
        (rol === 'ADMIN' || rol === 'VENDEDOR') &&
        cliente_id !== null &&
        cliente_id !== undefined
    ) {
        return 'Si el rol es ADMIN o VENDEDOR, cliente_id debe ser null';
    }

    return null;
};

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
        const { email, password, rol, cliente_id, activo } = req.body;

        const errorRegla = validarReglaUsuario(rol, cliente_id);
        if (errorRegla) {
            return res.status(400).json({
                codigo: 5.11,
                message: errorRegla
            });
        }

        const passwordHasheada = await bcrypt.hash(password, 10);

        const item = await Usuario.create({
            email: email,
            password_hash: passwordHasheada,
            rol: rol,
            cliente_id: cliente_id,
            activo: activo
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

        const { email, password, rol, cliente_id, activo } = req.body;

        const errorRegla = validarReglaUsuario(rol, cliente_id);
        if (errorRegla) {
            return res.status(400).json({
                codigo: 5.12,
                message: errorRegla
            });
        }

        item.email = email;
        item.rol = rol;
        item.cliente_id = cliente_id;
        item.activo = activo;

        if (password) {
            item.password_hash = await bcrypt.hash(password, 10);
        }

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