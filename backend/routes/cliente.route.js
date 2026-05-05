const express = require('express');
const router = express.Router();

const { Cliente, Institucion, Profesion } = require('../models');
const { Op, ValidationError } = require('sequelize');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

const normalizarEmail = (email) => {
    if (email === undefined || email === null || String(email).trim() === '') {
        return null;
    }

    return String(email).trim();
};

const emailValido = (email) => {
    return email === null || email.includes('@');
};

const atributosCliente = [
    'id',
    'nombre',
    'apellido',
    'telefono',
    'email',
    'institucion_id',
    'profesion_id',
    'fecha_creacion',
    'codigo_externo'
];

// GET /api/clientes
router.get(
    '/',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
    try {
        const q = req.query.q?.trim();
        const where = q
            ? {
                [Op.or]: [
                    { nombre: { [Op.iLike]: `%${q}%` } },
                    { apellido: { [Op.iLike]: `%${q}%` } },
                    { telefono: { [Op.iLike]: `%${q}%` } },
                    { codigo_externo: { [Op.iLike]: `%${q}%` } }
                ]
            }
            : undefined;

        const items = await Cliente.findAll({
            attributes: atributosCliente,
            include: [
                { model: Institucion },
                { model: Profesion }
            ],
            where,
            order: [['fecha_creacion', 'DESC']]
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
            attributes: atributosCliente,
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
        const email = normalizarEmail(req.body.email);

        if (!emailValido(email)) {
            return res.status(400).json({
                codigo: 2.9,
                message: 'El email debe incluir @'
            });
        }

        const codigo_externo = req.body.codigo_externo;

        if (codigo_externo) {
            const existente = await Cliente.findOne({
                where: { codigo_externo }
            });

            if (existente) {
                return res.status(400).json({
                    codigo: 2.3,
                    message: 'El codigo externo ya esta en uso'
                });
            }
        }

        const item = await Cliente.create({
            nombre: req.body.nombre,
            apellido: req.body.apellido,
            telefono: req.body.telefono,
            email,
            institucion_id: req.body.institucion_id,
            profesion_id: req.body.profesion_id,
            codigo_externo
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
            attributes: atributosCliente,
            where: { id: req.params.id }
        });

        if (!item) {
            return res.status(404).json({
                codigo: 2.3,
                message: 'Cliente no encontrado'
            });
        }

        const email = normalizarEmail(req.body.email);

        if (!emailValido(email)) {
            return res.status(400).json({
                codigo: 2.10,
                message: 'El email debe incluir @'
            });
        }

        item.nombre = req.body.nombre;
        item.apellido = req.body.apellido;
        item.telefono = req.body.telefono;
        item.email = email;
        item.institucion_id = req.body.institucion_id;
        item.profesion_id = req.body.profesion_id;
        item.codigo_externo = req.body.codigo_externo;

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
