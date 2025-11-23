// src/controllers/admin.controller.js

import { prisma } from "../services/prisma.js";

// --- GET /admin/users ---
export async function getAllUsers(req, res) {
    const users = await prisma.user.findMany({
        select: {
            id: true,
            email: true,
            apiKey: true,
            usage: true,
            usageLimit: true,
            createdAt: true,
            isVerified: true,
        },
        orderBy: { createdAt: 'desc' }
    });
    res.json(users);
}

// --- PUT /admin/users/:id ---
export async function updateUserUsage(req, res) {
    const { id } = req.params;
    // ✅ AÑADIDO: Incluimos isVerified para poder editarlo
    const { usage, usageLimit, isVerified } = req.body; 

    // Verificación de datos mínimos para la actualización
    if (usage === undefined && usageLimit === undefined && isVerified === undefined) {
        return res.status(400).json({ error: "Missing fields to update (usage, usageLimit, or isVerified)." });
    }

    try {
        const updatedUser = await prisma.user.update({
            where: { id: id },
            data: {
                // ✅ Lógica para actualizar campos solo si están presentes en el body
                ...(usage !== undefined && { usage: parseInt(usage) }),
                ...(usageLimit !== undefined && { usageLimit: parseInt(usageLimit) }),
                
                // ✅ Conversión a booleano (asegura que 'true'/'false' del JSON funcione)
                ...(isVerified !== undefined && { isVerified: isVerified === true || isVerified === 'true' }),
            },
            select: { id: true, email: true, usage: true, usageLimit: true, apiKey: true, isVerified: true }
        });
        res.json(updatedUser);
    } catch (error) {
        // En caso de que el ID no exista
        if (error.code === 'P2025') {
             return res.status(404).json({ error: "User not found." });
        }
        console.error("Error updating user:", error);
        res.status(500).json({ error: "Could not update user." });
    }
}

// --- DELETE /admin/users/:id ---
export async function deleteUser(req, res) {
    const { id } = req.params;
    
    try {
        // ⚠️ IMPORTANTE: Si el usuario tiene ApiLog's asociados, 
        // debes configurar la relación en Prisma con `onDelete: Cascade` 
        // para que se eliminen automáticamente, o eliminarlos manualmente aquí.
        // ASUMIMOS que la relación `User -> ApiLog` está configurada correctamente para la eliminación en cascada.
        
        const deletedUser = await prisma.user.delete({
            where: { id: id }
        });
        
        // No devolvemos datos sensibles
        res.status(200).json({ message: `User ${deletedUser.email} deleted successfully.` });
        
    } catch (error) {
        if (error.code === 'P2025') {
            return res.status(404).json({ error: "User not found." });
        }
        console.error("Error deleting user:", error);
        res.status(500).json({ error: "Could not delete user." });
    }
}