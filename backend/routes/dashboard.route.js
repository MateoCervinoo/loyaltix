const express = require('express');
const router = express.Router();

const { Cliente, Canje, Beneficio, MovimientoPuntos } = require('../models');

const authMiddleware = require('../middlewares/auth.middleware');
const roleMiddleware = require('../middlewares/role.middleware');

// GET /api/dashboard/stats
router.get(
    '/stats',
    authMiddleware,
    roleMiddleware('ADMIN', 'VENDEDOR'),
    async (req, res) => {
        try {
            const [clientes, canjes, beneficios, puntos] = await Promise.all([
                Cliente.count(),
                Canje.count(),
                Beneficio.count({ where: { activo: true } }),
                MovimientoPuntos.sum('cantidad')
            ]);

            return res.status(200).json({
                clientes,
                canjes,
                beneficios,
                puntos: puntos || 0
            });
        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 14.1,
                message: 'Error al obtener las estadisticas del dashboard'
            });
        }
    }
);

module.exports = router;
