// src/routes/admin.route.js
import express from "express";
//import { requireAdmin } from "../middlewares/requireAdmin.js"; // <-- Importa el nuevo middleware
import { deleteUser, getAllUsers, updateUserUsage } from "../controllers/admin.controller.js";

const router = express.Router();

// Todos los endpoints de administración requieren ser admin
//router.use(requireAdmin); 

// Obtener lista completa de usuarios
router.get("/users", getAllUsers);

// Editar el uso o límite de un usuario específico
router.put("/users/:id", updateUserUsage);

// Eliminar un usuario
router.delete("/users/:id", deleteUser);

export default router;