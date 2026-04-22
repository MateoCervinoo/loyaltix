require("dotenv").config();
const { Sequelize } = require("sequelize");

const sequelize = process.env.DATABASE_URL
    ? new Sequelize(process.env.DATABASE_URL, {
        dialect: "postgres",
        protocol: "postgres",
        logging: false,
        dialectOptions: {
            ssl: {
            require: true,
            rejectUnauthorized: false,
            },
        },
        })
    : new Sequelize(
        process.env.DB_NAME,
        process.env.DB_USER,
        process.env.DB_PASSWORD,
        {
            host: process.env.DB_HOST,
            dialect: "postgres",
            port: Number(process.env.DB_PORT),
            logging: false,
        }
    );

module.exports = sequelize;