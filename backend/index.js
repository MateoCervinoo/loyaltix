require('dotenv').config();

const express = require("express");
const cors = require('cors');
const sequelize = require("./database/database");
require('./models');

const clientesRoutes = require('./routes/cliente.route');
const institucionesRoutes = require('./routes/institucion.route');
const profesionesRoutes = require('./routes/profesion.route');
const usuariosRoutes = require('./routes/usuario.route');
const authRoutes = require('./routes/auth.route');
const puntosRoutes = require('./routes/puntos.route');
const configuracionPuntosRoutes = require('./routes/configuracionPuntos.route');
const beneficioRoutes = require('./routes/beneficio.route');
const canjeRoutes = require('./routes/canje.route');
const dashboardRoutes = require('./routes/dashboard.route');

// Crear servidor
const app = express();
app.use(express.json({ limit: '10mb' }));

app.use(cors({
    origin: process.env.FRONTEND_URL || 'http://localhost:5173'
}));

// Controlar la ruta
app.get("/", (req, res) => {
    res.send("Backend de LoyalTix");
});

// Routes
app.use('/api/clientes', clientesRoutes);
app.use('/api/instituciones', institucionesRoutes);
app.use('/api/profesiones', profesionesRoutes);
app.use('/api/usuarios', usuariosRoutes);
app.use('/api/auth', authRoutes);
app.use('/api/puntos', puntosRoutes);
app.use('/api/configuracion-puntos', configuracionPuntosRoutes);
app.use('/api/beneficios', beneficioRoutes);
app.use('/api/canjes', canjeRoutes);
app.use('/api/dashboard', dashboardRoutes);

// Configuración general
const port = process.env.PORT || 3000;
app.locals.fechaInicio = new Date();

// Iniciar servidor solo si conecta a la base
const startServer = async () => {
    try {
        await sequelize.authenticate();
        console.log("Conexión exitosa a PostgreSQL");

        app.listen(port, () => {
            console.log(`Sitio escuchando en el puerto ${port}`);
        });
    } catch (error) {
        console.error("Error de conexión:", error);
    }
};

startServer();
