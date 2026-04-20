const roleMiddleware = (...rolesPermitidos) => {
    return (req, res, next) => {
        try {
            const usuario = req.usuario;

            if (!usuario) {
                return res.status(401).json({
                    codigo: 8.1,
                    message: 'Usuario no autenticado'
                });
            }

            if (!rolesPermitidos.includes(usuario.rol)) {
                return res.status(403).json({
                    codigo: 8.2,
                    message: 'No tiene permisos para realizar esta acción'
                });
            }

            next();

        } catch (error) {
            console.error(error);
            return res.status(500).json({
                codigo: 8.3,
                message: 'Error interno del servidor'
            });
        }
    };
};

module.exports = roleMiddleware;