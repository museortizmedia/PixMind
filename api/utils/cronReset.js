import cron from "node-cron";
import { prisma } from "../services/prisma.js";

export function scheduleMonthlyReset() {
  // Runs on the 1st day of each month at 00:05
  cron.schedule("5 0 1 * *", async () => {
    console.log("Resetting monthly usage counters...");
    await prisma.user.updateMany({ data: { usage: 0 }});
    console.log("Reset done.");
  }, { timezone: "UTC" });
}