const express = require('express');
const router = express.Router();

const Cliente = require('../models/cliente.model');
const { ValidationError } = require('sequelize');

// GET /api/clientes
router.get('/', async function (req, res) {
    try {
        const items = await Cliente.findAll();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json(
            {
                codigo: 2.1,
                message: 'Error al obtener los clientes'
            }
        );
    }
});

// GET /api/clientes/:id
router.get('/:id', async function (req, res) {
    let items = await articulos.findOne({
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

    res.json(items);
});

// POST /api/clientes
router.post('/', async (req, res) => {
    try {
        let item = await Cliente.create({
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
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + "\n");
            res.status(400).json(
                {
                    codigo: 2.2,
                    message: messages
                });
        } else {
            throw err;
        }
    }
});

// PUT /api/clientes/:id
router.put('/:id', async (req, res) => {
    try {
        let item = await Cliente.findOne({
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
            res.status(404).json({
                codigo: 2.3,
                message: 'Cliente no encontrado'
            });
            return;
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
            //Errores de validacion
            let messages = '';
            err.errors.forEach((x) => messages += (x.path ?? 'campo') + ': ' + x.message + '\n');
            res.status(400).json({
                codigo: 2.2,
                message: messages
            });
        } else {
            //Si son errores desconocidos, los controla el middleware de errores
            throw err;
        }
    }
});

//DELETE /api/clientes/:id
router.delete('/:id', async (req, res) => {
    try {
        const filasBorradas = await Cliente.destroy({
            where: { id: req.params.id }
        });

        if (filasBorradas === 1) {
            return res.status(200).json({
                message: 'Cliente eliminado correctamente'
            });
        }

        return res.status(404).json({
            codigo: 2.4,
            message: 'Cliente no encontrado'
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