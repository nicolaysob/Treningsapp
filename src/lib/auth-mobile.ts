import bcrypt from "bcryptjs";
import { SignJWT, jwtVerify } from "jose";
import { prisma } from "@/lib/db";

const MOBILE_TOKEN_ISSUER = "treningsapp-mobile";
const TOKEN_TTL = "30d";

function getSecret() {
  const secret = process.env.AUTH_SECRET;
  if (!secret) throw new Error("AUTH_SECRET is not configured");
  return new TextEncoder().encode(secret);
}

export type MobileUser = {
  id: string;
  name: string | null;
  username: string | null;
  image: string | null;
};

export async function authenticateUser(
  username: string,
  password: string,
): Promise<MobileUser | null> {
  const normalized = username.trim().toLowerCase();
  if (!normalized || !password) return null;

  const user = await prisma.user.findUnique({ where: { username: normalized } });
  if (!user?.passwordHash) return null;

  const valid = await bcrypt.compare(password, user.passwordHash);
  if (!valid) return null;

  return {
    id: user.id,
    name: user.name,
    username: user.username,
    image: user.image,
  };
}

export async function signMobileToken(userId: string): Promise<string> {
  return new SignJWT({})
    .setProtectedHeader({ alg: "HS256" })
    .setSubject(userId)
    .setIssuedAt()
    .setExpirationTime(TOKEN_TTL)
    .setIssuer(MOBILE_TOKEN_ISSUER)
    .sign(getSecret());
}

export async function getUserIdFromBearer(request: Request): Promise<string | null> {
  const header = request.headers.get("authorization");
  if (!header?.startsWith("Bearer ")) return null;

  try {
    const { payload } = await jwtVerify(header.slice(7), getSecret(), {
      issuer: MOBILE_TOKEN_ISSUER,
    });
    return typeof payload.sub === "string" ? payload.sub : null;
  } catch {
    return null;
  }
}
