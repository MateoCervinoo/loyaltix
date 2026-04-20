const jwt = require('jsonwebtoken');

const authMiddleware = (req, res, next) => {
    try {
        const authHeader = req.headers['authorization'];

        // Verificar si viene el token
        if (!authHeader) {
            return res.status(401).json({
                codigo: 7.1,
                message: 'Token requerido'
            });
        }

        // Formato: "Bearer TOKEN"
        const token = authHeader.split(' ')[1];

        if (!token) {
            return res.status(401).json({
                codigo: 7.2,
                message: 'Token inválido'
            });
        }

        // Verificar token
        const decoded = jwt.verify(token, process.env.JWT_SECRET);

        // Guardar usuario en request
        req.usuario = decoded;

        next();

    } catch (error) {
        console.error(error);
        return res.status(401).json({
            codigo: 7.3,
            message: 'Token inválido o expirado'
        });
    }
};

module.exports = authMiddleware;