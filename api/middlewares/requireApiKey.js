import { prisma } from "../services/prisma.js";

export async function requireApiKey(req, res, next) {
    const apiKey = req.headers['x-api-key'];

    if (!apiKey) {
        return res.status(401).json({ error: "API Key required." });
    }

    // 1. Buscar el usuario y obtener sus límites de uso
    const user = await prisma.user.findUnique({
        where: { apiKey: apiKey },
        // Necesitamos el id, uso actual y límite de uso
        select: { id: true, isVerified: true, usage: true, usageLimit: true } 
    });

    if (!user) {
        return res.status(401).json({ error: "Invalid API Key." });
    }

    // 2. ✅ VERIFICACIÓN DE LÍMITE DE USO (La causa del 429)
    // Si el uso actual es igual o mayor al límite, se rechaza la solicitud
    if (user.usage >= user.usageLimit) {
        // Devolvemos 429 Too Many Requests
        return res.status(429).json({ error: "Usage limit exceeded for this API Key. Please renew your credits." });
    }
    
    // 3. Adjuntar el objeto de usuario a la solicitud
    req.user = user; 
    
    next();
}