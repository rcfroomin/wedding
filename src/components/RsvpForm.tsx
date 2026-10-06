import { useState } from "react";
import type { FormEvent } from "react";

type Status = "idle" | "submitting" | "success" | "error";

const RSVP_ENDPOINT = import.meta.env.PUBLIC_RSVP_ENDPOINT;

export default function RsvpForm() {
  const [status, setStatus] = useState<Status>("idle");

  async function handleSubmit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();

    if (!RSVP_ENDPOINT) {
      console.error("PUBLIC_RSVP_ENDPOINT is not configured.");
      setStatus("error");
      return;
    }

    const form = event.currentTarget;
    const formData = new FormData(form);

    // Honeypot: bots may fill this, humans won't see it.
    if (formData.get("website")) {
      return;
    }

    setStatus("submitting");

    try {
      const body = new URLSearchParams();

      formData.forEach((value, key) => {
        body.append(key, String(value));
      });

      await fetch(RSVP_ENDPOINT, {
        method: "POST",
        mode: "no-cors",
        headers: {
          "Content-Type":
            "application/x-www-form-urlencoded;charset=UTF-8",
        },
        body,
      });

      /*
       * Because this uses no-cors, the browser gives us an opaque response.
       * We therefore can't inspect Google's response body here.
       *
       * The request being accepted is enough for this simple setup,
       * and the Apps Script endpoint handles the actual write.
       */
      form.reset();
      setStatus("success");
    } catch (error) {
      console.error(error);
      setStatus("error");
    }
  }

  if (status === "success") {
    return (
      <div className="rsvp-success">
        <p className="eyebrow">THANK YOU</p>
        <h3>You're on the list ♡</h3>
        <p>
          We received your RSVP and cannot wait to celebrate with you.
        </p>
      </div>
    );
  }

  return (
    <form className="rsvp-form" onSubmit={handleSubmit}>
      {/* Honeypot field */}
      <div className="honeypot" aria-hidden="true">
        <label>
          Website
          <input
            type="text"
            name="website"
            tabIndex={-1}
            autoComplete="off"
          />
        </label>
      </div>

      <div className="form-row">
        <label>
          Name
          <input
            name="name"
            type="text"
            placeholder="Your name"
            required
          />
        </label>

        <label>
          Email
          <input
            name="email"
            type="email"
            placeholder="you@example.com"
            required
          />
        </label>
      </div>

      <label>
        Will you be joining us?
        <select name="attending" required defaultValue="">
          <option value="" disabled>
            Please select
          </option>
          <option value="Yes">Joyfully accepting</option>
          <option value="No">Regretfully declining</option>
        </select>
      </label>

      <label>
        Number attending
        <select name="guestCount" required defaultValue="1">
          <option value="0">0</option>
          <option value="1">1</option>
          <option value="2">2</option>
          <option value="3">3</option>
          <option value="4">4</option>
        </select>
      </label>

      <label>
        Meal preference
        <select name="meal" defaultValue="Chicken">
          <option value="Chicken">Chicken</option>
          <option value="Fish">Fish</option>
          <option value="Vegetarian">Vegetarian</option>
        </select>
      </label>

      <label>
        Anything else we should know?
        <textarea
          name="notes"
          rows={4}
          placeholder="Dietary restrictions, song requests, etc."
        />
      </label>

      <button
        type="submit"
        className="button button-light"
        disabled={status === "submitting"}
      >
        {status === "submitting" ? "Sending…" : "Send RSVP"}
      </button>

      {status === "error" && (
        <p className="form-error">
          Something went wrong. Please try again or contact us directly.
        </p>
      )}
    </form>
  );
}