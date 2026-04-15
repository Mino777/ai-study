import { cookies } from "next/headers";

function getEnv(name: string, minLength: number): string {
  const value = process.env[name];
  if (!value || value.length < minLength) {
    throw new Error(
      `환경변수 ${name}이(가) 설정되지 않았거나 최소 길이(${minLength})를 충족하지 않습니다.`
    );
  }
  return value;
}

function getAdminPassword(): string {
  return getEnv("ADMIN_PASSWORD", 8);
}

function getAdminSecret(): string {
  return getEnv("ADMIN_SECRET", 16);
}

/** Edge-compatible constant-time string comparison using Web Crypto */
async function safeCompare(a: string, b: string): Promise<boolean> {
  if (a.length !== b.length) return false;
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode("compare-key"),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const [sigA, sigB] = await Promise.all([
    crypto.subtle.sign("HMAC", key, encoder.encode(a)),
    crypto.subtle.sign("HMAC", key, encoder.encode(b)),
  ]);
  const viewA = new Uint8Array(sigA);
  const viewB = new Uint8Array(sigB);
  let diff = 0;
  for (let i = 0; i < viewA.length; i++) {
    diff |= viewA[i] ^ viewB[i];
  }
  return diff === 0;
}

export async function verifyPassword(password: string): Promise<boolean> {
  return safeCompare(password, getAdminPassword());
}

export async function createToken(): Promise<string> {
  const timestamp = Date.now().toString();
  const encoder = new TextEncoder();
  const key = await crypto.subtle.importKey(
    "raw",
    encoder.encode(getAdminSecret()),
    { name: "HMAC", hash: "SHA-256" },
    false,
    ["sign"]
  );
  const signature = await crypto.subtle.sign(
    "HMAC",
    key,
    encoder.encode(`admin:${timestamp}`)
  );
  const sig = Array.from(new Uint8Array(signature))
    .map((b) => b.toString(16).padStart(2, "0"))
    .join("");
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
      encoder.encode(getAdminSecret()),
      { name: "HMAC", hash: "SHA-256" },
      false,
      ["sign"]
    );
    const expected = await crypto.subtle.sign(
      "HMAC",
      key,
      encoder.encode(`admin:${timestamp}`)
    );
    const expectedHex = Array.from(new Uint8Array(expected))
      .map((b) => b.toString(16).padStart(2, "0"))
      .join("");
    return safeCompare(sig, expectedHex);
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
