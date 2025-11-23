import express from "express";
import multer from "multer";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { validateServicePayload, callMicroservice } from "../services/microservice.service.js";
import { prisma } from "../services/prisma.js";

const upload = multer();
const router = express.Router();

router.post(
  "/:service",
  requireApiKey,
  upload.fields([
    { name: "image", maxCount: 1 },
    { name: "extraImages", maxCount: 5 }
  ]),
  async (req, res) => {
    const { service } = req.params;
    const mainFile = req.files['image']?.[0];
    const extraFiles = req.files['extraImages'] || [];
    const body = req.body;
    const userId = req.user.id;

    try {
      validateServicePayload(service, mainFile, body);

      const microResp = await callMicroservice(
        service,
        mainFile,
        extraFiles,
        body
      );

      // --- ✅ LÓGICA DE DECREMENTO DE USO ---
      await prisma.user.update({
        where: { id: userId },
        data: {
          usage: {
            increment: 1, // ✅ Aumenta el contador de uso en 1
          }
        }
      });
      // --- FIN LÓGICA DE DECREMENTO DE USO ---

      const { data, contentType } = microResp;

      if (contentType.startsWith("image/")) {
        const base64Image = Buffer.from(data, "binary").toString("base64");
        return res.json({
          ok: true,
          service,
          result: base64Image,
          mimeType: contentType
        });
      }

      const jsonData = JSON.parse(Buffer.from(data, "utf-8").toString());
      return res.json({ ok: true, service, result: jsonData });

    } catch (err) {
      return res.status(400).json({
        error: "Validation or Microservice error",
        message: err.message
      });
    }
  }
);

export default router;