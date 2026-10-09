import type { APIRoute } from "astro";
import { callAppsScript } from "../../lib/appsScript";
import {
  readGuestSessionFromCookieHeader,
} from "../../lib/auth";

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  const session = readGuestSessionFromCookieHeader(
    request.headers.get("cookie")
  );

  if (!session) {
    return json({
      ok: false,
      error: "Your session expired. Please sign in again.",
    }, 401);
  }

  let body: {
    action?: string;
    attending?: string;
    guestCount?: number;
    guestName?: string;
    email?: string;
    meal?: string;
    notes?: string;
  };

  try {
    body = await request.json();
  } catch {
    return json({
      ok: false,
      error: "Invalid RSVP request.",
    }, 400);
  }

  if (body.action !== "submit") {
    return json({
      ok: false,
      error: "Invalid RSVP action.",
    }, 400);
  }

  if (
    body.attending !== "Yes" &&
    body.attending !== "No"
  ) {
    return json({
      ok: false,
      error: "Please select whether you are attending.",
    }, 400);
  }

  try {
    const result = await callAppsScript({
      action: "submit",

      // Identity comes from the encrypted server-verified
      // session, not from a name supplied by the browser.
      phone: session.phone,
      invitationCode: session.invitationCode,

      attending: body.attending,
      guestCount: String(body.guestCount ?? 0),
      guestName: String(body.guestName ?? ""),
      email: String(body.email ?? ""),
      meal: String(body.meal ?? ""),
      notes: String(body.notes ?? ""),
    });

    if (result.ok !== true) {
      return json({
        ok: false,
        error:
          typeof result.error === "string"
            ? result.error
            : "Your RSVP could not be saved.",
      }, 400);
    }

    return json({ ok: true });
  } catch (error) {
    console.error("RSVP submission error:", error);

    return json({
      ok: false,
      error:
        "We couldn't save your RSVP right now. Please try again.",
    }, 502);
  }
};