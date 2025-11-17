import { prisma } from "../services/prisma.js";

/**
 * requireApiKey – Solo para endpoints externos (IA)
 */
export async function requireApiKey(req, res, next) {
  const key = req.headers["x-api-key"];
  if (!key) return res.status(401).json({ error: "API key missing" });

  const user = await prisma.user.findUnique({
    where: { apiKey: key }
  });

  if (!user) return res.status(401).json({ error: "Invalid API key" });

  req.user = user; // para que el endpoint principal sepa quién es el dueño
  next();
}