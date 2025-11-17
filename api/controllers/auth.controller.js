import { prisma } from "../services/prisma.js";
import bcrypt from "bcrypt";
import { v4 as uuidv4 } from "uuid";
import { sendVerificationEmail } from "../services/email.service.js";
import jwt from "jsonwebtoken";

export async function register(req, res) {
  const { email, password } = req.body;
  if (!email || !password) return res.status(400).json({ error: "Missing fields" });

  const existing = await prisma.user.findUnique({ where: { email } });
  if (existing) return res.status(400).json({ error: "Email already registered" });

  const hashed = await bcrypt.hash(password, 10);
  const apiKey = uuidv4() + "-" + uuidv4();

  // generate email verification token (simple)
  const verificationToken = uuidv4();

  const user = await prisma.user.create({
    data: { email, password: hashed, apiKey, isVerified: false }
  });

  // store a simple token mapping in ApiLog or a dedicated table? For simplicity store in ApiLog-like transient store:
  // We'll use a small table-less approach: send token in email (you must implement persistence to validate later).
  // For now, store token in Service table as hack OR you can send email with token; implement persistence if you want.
  // Send verification email (you should implement email.service)
  try {
    await sendVerificationEmail(email, verificationToken);
  } catch (err) {
    console.warn("Email send failed (dev-only)", err.message);
  }

  res.json({ message: "User created", apiKey, verificationSent: true });
}

export async function login(req, res) {
  const { email, password } = req.body;
  if (!email || !password)
    return res.status(400).json({ error: "Missing fields" });

  const user = await prisma.user.findUnique({ where: { email } });
  if (!user)
    return res.status(400).json({ error: "Invalid credentials" });

  const ok = await bcrypt.compare(password, user.password);
  if (!ok)
    return res.status(400).json({ error: "Invalid credentials" });

  // 🔥 GENERAR JWT
  const token = jwt.sign(
    { id: user.id, email: user.email },
    process.env.JWT_SECRET,
    { expiresIn: "7d" }
  );

  // 🔥 RESPUESTA COMPLETA
  return res.json({
    token,
    user: {
      id: user.id,
      email: user.email,
      apiKey: user.apiKey,
      usage: user.usage,
      usageLimit: user.usageLimit,
      isVerified: user.isVerified
    }
  });
}

export async function me(req, res) {
  const user = req.user || null;
  if (!user) return res.status(401).json({ error: "Not authenticated" });
  const full = await prisma.user.findUnique({ where: { id: user.id }, select: { id: true, email: true, usage: true, usageLimit: true, apiKey: true, isVerified: true }});
  res.json(full);
}

export async function verifyEmailToken(req, res) {
  // This is a stub. Implement real token storage/verification.
  // For now accept any token and mark the user as verified if email query param provided.
  const { token } = req.params;
  const { email } = req.query;
  if (!token || !email) return res.status(400).send("Missing token or email");
  const user = await prisma.user.findUnique({ where: { email }});
  if (!user) return res.status(400).send("User not found");
  await prisma.user.update({ where: { id: user.id }, data: { isVerified: true }});
  res.send("Email verified (dev). You can now use the API.");
}

export async function resendVerification(req, res) {
  const { email } = req.body;
  if (!email) return res.status(400).json({ error: "Missing email" });
  const token = uuidv4();
  try { await sendVerificationEmail(email, token); } catch (e) {}
  res.json({ message: "Verification email resent (dev)" });
}