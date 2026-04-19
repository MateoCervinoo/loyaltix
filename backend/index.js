const express = require("express");
const sequelize = require("./database/database");
const clientesRoutes = require('./routes/cliente.route');
const institucionesRoutes = require('./routes/institucion.route');
const profesionesRoutes = require('./routes/profesion.route');
const usuariosRoutes = require('./routes/usuario.route');

// Crear servidor
const app = express();
app.use(express.json());

// Controlar la ruta
app.get("/", (req, res) => {
    res.send("Backend de LoyalTix");
});

// Routes
app.use('/api/clientes', clientesRoutes);
app.use('/api/instituciones', institucionesRoutes);
app.use('/api/profesiones', profesionesRoutes);
app.use('/api/usuarios', usuariosRoutes);

// Configuración general
const port = 3000;
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