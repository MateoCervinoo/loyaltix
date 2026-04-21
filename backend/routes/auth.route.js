const express = require('express');
const router = express.Router();

const jwt = require('jsonwebtoken');
const bcrypt = require('bcrypt');

const { Usuario, Cliente } = require('../models');

// POST /api/auth/login
router.post('/login', async (req, res) => {
    try {
        const { email, password } = req.body;

        // Validación básica
        if (!email || !password) {
            return res.status(400).json({
                codigo: 6.1,
                message: 'Email y password son obligatorios'
            });
        }

        // Buscar usuario
        const usuario = await Usuario.findOne({
        where: { email },
        include: [
            {
            model: Cliente,
            attributes: ['nombre', 'apellido'],
            },
        ],
        });

        if (!usuario) {
            return res.status(404).json({
                codigo: 6.2,
                message: 'Usuario no encontrado'
            });
        }

        // Verificar si está activo
        if (!usuario.activo) {
            return res.status(403).json({
                codigo: 6.3,
                message: 'Usuario inactivo'
            });
        }

        // Comparar password con hash
        const passwordValida = await bcrypt.compare(password, usuario.password_hash);

        if (!passwordValida) {
            return res.status(401).json({
                codigo: 6.4,
                message: 'Credenciales inválidas'
            });
        }

        // Generar token
        const token = jwt.sign(
            {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                cliente_id: usuario.cliente_id
            },
            process.env.JWT_SECRET,
            {
                expiresIn: process.env.JWT_EXPIRES_IN || '2h'
            }
        );

        // Respuesta
        return res.status(200).json({
            message: 'Login correcto',
            token: token,
            usuario: {
                id: usuario.id,
                email: usuario.email,
                rol: usuario.rol,
                cliente_id: usuario.cliente_id,
                activo: usuario.activo,
                nombre: usuario.Cliente?.nombre || null,
                apellido: usuario.Cliente?.apellido || null,
            }
        });

    } catch (error) {
        console.error(error);
        return res.status(500).json({
            codigo: 6.5,
            message: 'Error interno del servidor'
        });
    }
});

module.exports = router;