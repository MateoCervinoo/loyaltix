# LoyalTix Backend

Backend de sistema de fidelización de clientes.

## Tecnologías
- Node.js
- Express
- PostgreSQL
- Sequelize

## Setup

1. Clonar repo
2. Crear archivo .env basado en .env.example
3. Instalar dependencias:
   npm install
4. Levantar servidor:
   npm run dev

## Permisos
ADMIN
- Permisos para hacer todo
VENDEDOR
- Permiso para buscar, crear y modificar clientes
- Permiso para buscar instituciones y profesiones
CLIENTE
- Permiso para buscar cliente (solo el propio)
- Permiso para buscar usuario (solo el propio)
