export async function sendVerificationEmail(email, token) {
  // DEV STUB: print to console. Replace with real email provider integration.
  console.log(`Send verification to ${email}: visit ${process.env.APP_URL}/auth/verify/${token}?email=${encodeURIComponent(email)}`);
  return true;
}