import express from "express";
import multer from "multer";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { consumeUsage, logCall } from "../services/token.service.js";

import {
  validateServicePayload,
  callMicroservice
} from "../services/microservice.service.js";

const upload = multer();
const router = express.Router();

router.post("/:service", requireApiKey, upload.single("image"), async (req, res) => {
  const { service } = req.params;
  const file = req.file;
  const body = req.body;

  try {
    // Validaciones del servicio según el JS centralizado
    validateServicePayload(service, file, body);

    // Llamar al microservicio real
    const result = await callMicroservice(service, file.buffer, file.originalname, body);

    return res.json({
      ok: true,
      service,
      result
    });

  } catch (err) {
    return res.status(400).json({
      error: "Validation or Microservice error",
      message: err.message
    });
  }
});

export default router;