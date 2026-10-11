import type { APIRoute } from "astro";
import { callAppsScript } from "../../lib/appsScript";
import {
  readGuestSessionFromCookieHeader,
} from "../../lib/auth";

type RsvpResponse = {
  name: string;
  attending: "Yes" | "No";
  guestCount: number;
  guestName?: string;
};

type RequestBody = {
  action?: string;
  email?: string;
  notes?: string;
  responses?: RsvpResponse[];
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
      "Cache-Control": "no-store",
    },
  });
}

function normalizeName(value: string): string {
  return value
    .normalize("NFKD")
    .replace(/[\u0300-\u036f]/g, "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
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

  let body: RequestBody;

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
    !Array.isArray(body.responses) ||
    body.responses.length !== session.guests.length
  ) {
    return json({
      ok: false,
      error: "Please provide a response for every invited guest.",
    }, 400);
  }

  const guestsByName = new Map(
    session.guests.map((guest) => [
      normalizeName(guest.name),
      guest,
    ])
  );

  const seenNames = new Set<string>();

  const responses: RsvpResponse[] = [];

  for (const response of body.responses) {
    if (
      !response ||
      typeof response.name !== "string"
    ) {
      return json({
        ok: false,
        error: "Invalid guest response.",
      }, 400);
    }

    const key = normalizeName(response.name);
    const guest = guestsByName.get(key);

    if (!guest || seenNames.has(key)) {
      return json({
        ok: false,
        error: "The RSVP contains an unknown or duplicate guest.",
      }, 400);
    }

    if (
      response.attending !== "Yes" &&
      response.attending !== "No"
    ) {
      return json({
        ok: false,
        error: `Please select attendance for ${guest.name}.`,
      }, 400);
    }

    seenNames.add(key);

    const guestCount = Number(response.guestCount);
    const guestName = String(response.guestName ?? "").trim();

    if (response.attending === "Yes") {
      const maximumGuests = guest.plusOneAllowed ? 2 : 1;

      if (
        !Number.isInteger(guestCount) ||
        guestCount < 1 ||
        guestCount > maximumGuests
      ) {
        return json({
          ok: false,
          error: `${guest.name}'s invitation does not allow that many guests.`,
        }, 400);
      }

      if (guestCount === 2 && !guestName) {
        return json({
          ok: false,
          error: `Please enter the additional guest's name for ${guest.name}.`,
        }, 400);
      }
    }

    // Use the canonical guest name from the session, not
    // an arbitrary version supplied in the request.
    responses.push({
      name: guest.name,
      attending: response.attending,
      guestCount:
        response.attending === "Yes" ? guestCount : 0,
      guestName:
        response.attending === "Yes" && guestCount === 2
          ? guestName
          : "",
    });
  }

  if (seenNames.size !== session.guests.length) {
    return json({
      ok: false,
      error: "Please provide a response for every invited guest.",
    }, 400);
  }

  const email = String(body.email ?? "").trim();
  const notes = String(body.notes ?? "").trim();

  if (notes.length > 2000) {
    return json({
      ok: false,
      error: "Your notes are too long.",
    }, 400);
  }

  if (
    responses.some((response) => response.attending === "Yes") &&
    !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(email)
  ) {
    return json({
      ok: false,
      error: "Please provide a valid email address.",
    }, 400);
  }

  try {
    const result = await callAppsScript({
      action: "submit",
      phone: session.phone,
      invitationCode: session.invitationCode,
      email,
      notes,
      responses: JSON.stringify(responses),
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

    return json({
      ok: true,
      action: "submit",
    });
  } catch (error) {
    console.error("RSVP submission error:", error);

    return json({
      ok: false,
      error: "We couldn't save your RSVP right now. Please try again.",
    }, 502);
  }
};