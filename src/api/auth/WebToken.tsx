
import bcrypt from "bcryptjs";
import jwt from "jsonwebtoken";

const JWT_SECRET = process.env.JWT_SECRET || "your-secret-key";

async function generateTokenFromPassword(
  userId: string,
  password: string
): Promise<string> {
  // Hash the password
  const passwordHash = await bcrypt.hash(password, 10);
    
  // Sign a JWT using the hash as part of the payload
  const token = jwt.sign(
    { id: userId, key: passwordHash },
    JWT_SECRET
  );

  return token;
}

async function verifyPasswordToken(
  token: string,
  plainPassword: string
): Promise<boolean> {
  try {
    const payload = jwt.verify(token, JWT_SECRET) as { id: string; key: string };

    // Check the plain password against the hash stored in the token
    const isValid = await bcrypt.compare(plainPassword, payload.key);
    return isValid;
  } catch {
    return false;
  }
}

const API_URL = import.meta.env.VITE_API_URL || "http://localhost:3000";

export async function signup(email: string, password: string) {
  /*const res = await fetch(`${API_URL}/auth/register`, {
    method: "POST",
    headers: { "Content-Type": "application/json" },
    body: JSON.stringify({ email, password }),
  });

  if (!res.ok) {
    const { error } = await res.json();
    throw new Error(error || "Signup failed");
  }

  return res.json() as Promise<{ token: string; userId: string }>;*/
}
