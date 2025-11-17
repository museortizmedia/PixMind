import { prisma } from "./prisma.js";

export async function consumeUsage(userId, amount = 1) {
  // atomically increment and check limit
  const user = await prisma.user.findUnique({ where: { id: userId }});
  if (!user) return { ok: false, reason: "user_not_found" };
  if (user.usage + amount > user.usageLimit) return { ok: false, reason: "limit_exceeded" };

  await prisma.user.update({
    where: { id: userId },
    data: { usage: { increment: amount } }
  });

  return { ok: true };
}

export async function logCall(userId, serviceName, success = true) {
  await prisma.apiLog.create({
    data: { userId, service: serviceName, success }
  });
}