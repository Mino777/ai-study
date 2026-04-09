import { cookies } from "next/headers";

const ADMIN_PASSWORD = process.env.ADMIN_PASSWORD || "";
const ADMIN_SECRET = process.env.ADMIN_SECRET || "dev-secret-change-me";

export function verifyPassword(password: string): boolean {
  return password === ADMIN_PASSWORD;
}

export async function createToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(ADMIN_SECRET),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`admin:${timestamp}`)
  );
  const sig = Buffer.from(signature).toString("hex");
  return `${timestamp}.${sig}`;
}

export async function verifyToken(token: string): Promise<boolean> {
  try {
    const [timestamp, sig] = token.split(".");
    if (!timestamp || !sig) return false;

    // 7일 만료
    const age = Date.now() - parseInt(timestamp);
    if (age > 7 * 24 * 60 * 60 * 1000) return false;

    const encoder = new TextEncoder();
    const key = await crypto.subtle.importKey(
      "raw",
      encoder.encode(ADMIN_SECRET),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expected = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`admin:${timestamp}`)
    );
    const expectedHex = Buffer.from(expected).toString("hex");
    return sig === expectedHex;
  } catch {
    return false;
  }
}

export async function isAuthenticated(): Promise<boolean> {
  const cookieStore = await cookies();
  const token = cookieStore.get("admin-token")?.value;
  if (!token) return false;
  return verifyToken(token);
}
