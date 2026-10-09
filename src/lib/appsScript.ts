type AppsScriptResponse = Record<string, unknown>;

export async function callAppsScript(
  params: Record<string, string>
): Promise<AppsScriptResponse> {
  const scriptUrl = import.meta.env.RSVP_SCRIPT_URL;
  const apiSecret = import.meta.env.RSVP_API_SHARED_SECRET;

  if (!scriptUrl || !apiSecret) {
    throw new Error("RSVP service is not configured.");
  }

  const form = new URLSearchParams({
    ...params,
    apiSecret,
  });

  const response = await fetch(scriptUrl, {
    method: "POST",
    redirect: "follow",
    cache: "no-store",
    headers: {
      "Content-Type":
        "application/x-www-form-urlencoded;charset=UTF-8",
    },
    body: form.toString(),
  });

  const responseText = await response.text();

  let data: AppsScriptResponse;

  try {
    data = JSON.parse(responseText) as AppsScriptResponse;
  } catch {
    throw new Error(
      `RSVP service returned an invalid response (${response.status}).`
    );
  }

  if (!response.ok) {
    throw new Error(
      `RSVP service returned HTTP ${response.status}.`
    );
  }

  return data;
}