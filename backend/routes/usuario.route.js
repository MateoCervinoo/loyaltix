const express = require('express');
const router = express.Router();

const usuarios = require('../models/cliente.model');
const { Op, ValidationError } = require('sequelize');

router.get('/api/usuarios', async function (req, res) {
    try {
        const items = await usuarios.findAll();
        res.json(items);
    } catch (error) {
        console.error(error);
        res.status(500).json(
            {
                codigo: 1,
                message: 'Error al obtener los usuarios'
            }
        );
    }
});

module.exports = router;