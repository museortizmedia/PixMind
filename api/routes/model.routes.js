import express from "express";
import multer from "multer";
import { requireApiKey } from "../middlewares/requireApiKey.js";
import { consumeUsage, logCall } from "../services/token.service.js";
import { callMicroservice } from "../services/microservice.service.js";

const upload = multer();
const router = express.Router();

router.post("/:service", requireApiKey, upload.single("image"), async (req, res) => {
  const { service } = req.params;
  const file = req.file;
  if (!file) return res.status(400).json({ error: "image required" });

  // simple human check: require verified email for production
  if (!req.user.isVerified) {
    return res.status(403).json({ error: "Account not verified. Verify your email to use the services." });
  }

  // consume usage
  const consumed = await consumeUsage(req.user.id, 1);
  if (!consumed.ok) {
    return res.status(429).json({ error: "Usage limit exceeded", reason: consumed.reason });
  }

  // call microservice
  try {
    const result = await callMicroservice(service, file.buffer, file.originalname || "image.jpg");
    await logCall(req.user.id, service, true);
    return res.json({ ok: true, service, result });
  } catch (err) {
    await logCall(req.user.id, service, false);
    return res.status(502).json({ error: "Microservice error", message: err.message });
  }
});

export default router;