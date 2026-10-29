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

    if (result.ok !== true) {
      throw new Error("Google authentication failed.");
    }

    if (
      result.authenticated !== true ||
      !Array.isArray(result.guests)
    ) {
      return json({
        ok: false,
        error:
          "We couldn't verify those details. Please check your phone number and invitation code.",
      }, 401);
    }

    const guests = result.guests.map((value: unknown) => {
      if (
        value === null ||
        typeof value !== "object"
      ) {
        throw new Error("Invalid guest information.");
      }

      const guest = value as Record<string, unknown>;

      if (
        typeof guest.name !== "string" ||
        typeof guest.plusOneAllowed !== "boolean"
      ) {
        throw new Error("Invalid guest information.");
      }

      return {
        name: guest.name,
        plusOneAllowed: guest.plusOneAllowed,
      };
    });

    if (guests.length < 1 || guests.length > 20) {
      throw new Error("Invalid invitation group size.");
    }


    if (typeof result.rehearsalDinnerInvited !== "boolean") {
      throw new Error(
        "Authentication response is missing the rehearsal dinner invitation status."
      );
    }

    const token = createSessionToken({
      phone,
      invitationCode,
      guests,
      rehearsalDinnerInvited: result.rehearsalDinnerInvited,
    });

    return json(
      {
        ok: true,
        guests,
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