import {
  createCipheriv,
  createDecipheriv,
  randomBytes,
} from "node:crypto";

export const SESSION_COOKIE = "wedding_session";
const SESSION_TTL_SECONDS = 12 * 60 * 60;

export type SessionGuest = {
  name: string;
  plusOneAllowed: boolean;
};

export type GuestSession = {
  phone: string;
  invitationCode: string;
  guests: SessionGuest[];
  rehearsalDinnerInvited: boolean;
  farewellBrunchInvited: boolean;
  exp: number;
};

type NewGuestSession = Omit<GuestSession, "exp">;

function getSessionKey(): Buffer {
  const secret = import.meta.env.SESSION_SECRET;

  if (!secret || !/^[a-f0-9]{64}$/i.test(secret)) {
    throw new Error(
      "SESSION_SECRET must be a 32-byte hexadecimal value."
    );
  }

  return Buffer.from(secret, "hex");
}

export function createSessionToken(
  guest: NewGuestSession
): string {
  const payload = Buffer.from(
    JSON.stringify({
      ...guest,
      exp: Math.floor(Date.now() / 1000) + SESSION_TTL_SECONDS,
    })
  );

  const iv = randomBytes(12);

  const cipher = createCipheriv(
    "aes-256-gcm",
    getSessionKey(),
    iv
  );

  const encrypted = Buffer.concat([
    cipher.update(payload),
    cipher.final(),
  ]);

  const tag = cipher.getAuthTag();

  return [
    iv.toString("base64url"),
    tag.toString("base64url"),
    encrypted.toString("base64url"),
  ].join(".");
}

export function readGuestSession(
  token: string | undefined | null
): GuestSession | null {
  if (!token) return null;

  try {
    const parts = token.split(".");

    if (parts.length !== 3) return null;

    const [ivEncoded, tagEncoded, encryptedEncoded] = parts;

    const decipher = createDecipheriv(
      "aes-256-gcm",
      getSessionKey(),
      Buffer.from(ivEncoded, "base64url")
    );

    decipher.setAuthTag(
      Buffer.from(tagEncoded, "base64url")
    );

    const decrypted = Buffer.concat([
      decipher.update(
        Buffer.from(encryptedEncoded, "base64url")
      ),
      decipher.final(),
    ]);

    const session = JSON.parse(
      decrypted.toString("utf8")
    ) as GuestSession;

    if (
      typeof session.phone !== "string" ||
      typeof session.invitationCode !== "string" ||
      typeof session.rehearsalDinnerInvited !== "boolean" ||
      typeof session.farewellBrunchInvited !== "boolean" ||
      typeof session.exp !== "number" ||
      session.exp <= Math.floor(Date.now() / 1000) ||
      !Array.isArray(session.guests) ||
      session.guests.length < 1 ||
      session.guests.length > 20
    ) {
      return null;
    }

    const validGuests = session.guests.every(
      (guest) =>
        guest !== null &&
        typeof guest.name === "string" &&
        guest.name.trim().length > 0 &&
        typeof guest.plusOneAllowed === "boolean"
    );

    if (!validGuests) return null;

    return session;
  } catch {
    return null;
  }
}

export function readGuestSessionFromCookieHeader(
  header: string | null
): GuestSession | null {
  const cookie = header
    ?.split(";")
    .map((part) => part.trim())
    .find((part) => part.startsWith(`${SESSION_COOKIE}=`));

  if (!cookie) return null;

  return readGuestSession(
    cookie.slice(SESSION_COOKIE.length + 1)
  );
}

export function createSessionCookie(token: string): string {
  return [
    `${SESSION_COOKIE}=${token}`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    `Max-Age=${SESSION_TTL_SECONDS}`,
    ...(import.meta.env.PROD ? ["Secure"] : []),
  ].join("; ");
}

export function clearSessionCookie(): string {
  return [
    `${SESSION_COOKIE}=`,
    "Path=/",
    "HttpOnly",
    "SameSite=Lax",
    "Max-Age=0",
    ...(import.meta.env.PROD ? ["Secure"] : []),
  ].join("; ");
}