import type { APIRoute } from "astro";

const SCRIPT_URL = import.meta.env.RSVP_SCRIPT_URL;

type RequestBody = {
  action?: "lookup" | "submit";
  name?: string;
  email?: string;
  attending?: "Yes" | "No";
  guestCount?: number;
  guestName?: string;
  meal?: string;
  notes?: string;
};

function json(data: unknown, status = 200) {
  return new Response(JSON.stringify(data), {
    status,
    headers: {
      "Content-Type": "application/json",
    },
  });
}

export const POST: APIRoute = async ({ request }) => {
  if (!SCRIPT_URL) {
    console.error("RSVP_SCRIPT_URL is not configured.");

    return json(
      {
        ok: false,
        error: "RSVP service is not configured.",
      },
      500
    );
  }

  let body: RequestBody;

  try {
    body = await request.json();
  } catch {
    return json(
      {
        ok: false,
        error: "Invalid request.",
      },
      400
    );
  }

  if (
    body.action !== "lookup" &&
    body.action !== "submit"
  ) {
    return json(
      {
        ok: false,
        error: "Invalid action.",
      },
      400
    );
  }

  if (!body.name?.trim()) {
    return json(
      {
        ok: false,
        error: "Name is required.",
      },
      400
    );
  }

  const params = new URLSearchParams();

  params.set("action", body.action);
  params.set("name", body.name.trim());

  if (body.action === "submit") {
    params.set("email", body.email?.trim() ?? "");
    params.set("attending", body.attending ?? "No");
    params.set(
      "guestCount",
      String(body.guestCount ?? 0)
    );
    params.set(
      "guestName",
      body.guestName?.trim() ?? ""
    );
    params.set("meal", body.meal?.trim() ?? "");
    params.set("notes", body.notes?.trim() ?? "");
  }

  try {
    const googleResponse = await fetch(SCRIPT_URL, {
    method: "POST",
    redirect: "follow",
    headers: {
        "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: params.toString(),
    });

    const responseText = await googleResponse.text();

    console.log("Google status:", googleResponse.status);
    console.log("Google final URL:", googleResponse.url);
    console.log(
    "Google content type:",
    googleResponse.headers.get("content-type")
    );
    console.log(
    "Google response:",
    responseText.slice(0, 1000)
    );

    let data: Record<string, unknown>;

    try {
        data = JSON.parse(responseText);
    } catch {
        return json(
            {
                ok: false,
                error:
                    "RSVP service returned something other than JSON.",
                debug: {
                    status: googleResponse.status,
                    contentType:
                        googleResponse.headers.get("content-type"),
                    finalUrl: googleResponse.url,
                    responsePreview:
                        responseText.slice(0, 300),
                },
            },
            502
        );
    }

    if (!googleResponse.ok || data.ok !== true) {
      return json(
        {
          ok: false,
          error:
            typeof data.error === "string"
              ? data.error
              : "RSVP service rejected the request.",
        },
        400
      );
    }

    return json(data);
  } catch (error) {
    console.error("RSVP API error:", error);

    return json(
      {
        ok: false,
        error: "Could not reach RSVP service.",
      },
      502
    );
  }
};