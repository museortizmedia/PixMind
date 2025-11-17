import express from "express";
import dotenv from "dotenv";
import cors from "cors";
import authRoutes from "./routes/auth.routes.js";
import modelRoutes from "./routes/model.routes.js";
import { scheduleMonthlyReset } from "./utils/cronReset.js";

dotenv.config();

const app = express();
app.use(cors({ origin: true }));
app.use(express.json({ limit: "10mb" })); // imagenes en base64 si es necesario

app.use("/auth", authRoutes);
app.use("/model", modelRoutes);

app.get("/", (req, res) => res.send("PixMind API running"));

const PORT = process.env.PORT || 4000;
app.listen(PORT, () => {
  console.log(`Server running on port ${PORT}`);
  scheduleMonthlyReset(); // inicia cron job
});