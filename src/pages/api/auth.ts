import type { APIRoute } from "astro";
import { callAppsScript } from "../../lib/appsScript";
import {
  createSessionCookie,
  createSessionToken,
  clearSessionCookie,
} from "../../lib/auth";

function json(
  data: unknown,
  status = 200,
  extraHeaders: Record<string, string> = {}
) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
      ...extraHeaders,
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  let body: {
    phone?: string;
    invitationCode?: string;
  };

  try {
    body = await request.json();
  } catch {
    return json({
      ok: false,
      error: "Please enter your phone number and invitation code.",
    }, 400);
  }

  const phone = String(body.phone ?? "").trim();
  const invitationCode =
    String(body.invitationCode ?? "").trim();

  const phoneDigits = phone.replace(/\D/g, "");

  if (
    phoneDigits.length < 7 ||
    phoneDigits.length > 15 ||
    !invitationCode ||
    invitationCode.length > 100
  ) {
    return json({
      ok: false,
      error: "Please enter a valid phone number and invitation code.",
    }, 400);
  }

  try {
    const result = await callAppsScript({
      action: "authenticate",
      phone,
      invitationCode,
    });

    if (
      result.ok !== true ||
      result.authenticated !== true ||
      !result.guest ||
      typeof result.guest !== "object"
    ) {
      return json({
        ok: false,
        error:
          "We couldn't verify those details. Please check the phone number and invitation code on your invitation.",
      }, 401);
    }

    const guest = result.guest as {
      name?: string;
      plusOneAllowed?: boolean;
    };

    if (
      typeof guest.name !== "string" ||
      typeof guest.plusOneAllowed !== "boolean"
    ) {
      throw new Error("Invalid guest response.");
    }

    const token = createSessionToken({
      name: guest.name,
      phone,
      invitationCode,
      plusOneAllowed: guest.plusOneAllowed,
    });

    return json(
      {
        ok: true,
        guest: {
          name: guest.name,
          plusOneAllowed: guest.plusOneAllowed,
        },
      },
      200,
      {
        "Set-Cookie": createSessionCookie(token),
      }
    );
  } catch (error) {
    console.error("Authentication service error:", error);

    return json({
      ok: false,
      error:
        "We couldn't verify your invitation right now. Please try again.",
    }, 502);
  }
};

export const DELETE: APIRoute = async () => {
  return json(
    { ok: true },
    200,
    { "Set-Cookie": clearSessionCookie() }
  );
};