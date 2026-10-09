import { useState } from "react";
import type { FormEvent } from "react";

export default function AuthGate() {
  const [phone, setPhone] = useState("");
  const [invitationCode, setInvitationCode] = useState("");
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setLoading(true);
    setError("");

    try {
      const response = await fetch("/api/auth", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          phone,
          invitationCode,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.ok !== true) {
        throw new Error(
          result.error ??
            "We couldn't verify your invitation."
        );
      }

      // The response sets the cookie. Reload to render the
      // authenticated page on the server.
      window.location.replace("/");
    } catch (error) {
      setError(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setLoading(false);
    }
  }

  return (
    <main className="auth-screen">
      <section className="auth-card">
        <p className="eyebrow">RILEY & IAN</p>

        <h1 className="auth-title">
          Your invitation awaits.
        </h1>

        <p className="auth-description">
          Enter the phone number associated with your
          invitation and the code included in your mailed
          invitation to discover our wedding website.
        </p>

        <form
          className="auth-form"
          onSubmit={handleSubmit}
        >
          <label>
            Phone number

            <input
              type="tel"
              inputMode="tel"
              autoComplete="tel"
              placeholder="Your phone number"
              value={phone}
              onChange={(event) =>
                setPhone(event.target.value)
              }
              required
            />
          </label>

          <label>
            Invitation code

            <input
              type="text"
              autoComplete="off"
              autoCapitalize="characters"
              placeholder="Code from your invitation"
              value={invitationCode}
              onChange={(event) =>
                setInvitationCode(event.target.value)
              }
              required
            />
          </label>

          {error && (
            <p className="auth-error" role="alert">
              {error}
            </p>
          )}

          <button
            type="submit"
            className="button button-dark auth-submit"
            disabled={loading}
          >
            {loading
              ? "Checking your invitation…"
              : "Discover your invitation"}
          </button>
        </form>

        <p className="auth-help">
          Having trouble? Please contact us directly.
        </p>
      </section>
    </main>
  );
}