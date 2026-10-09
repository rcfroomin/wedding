import { useState } from "react";
import type { FormEvent } from "react";

type Step =
  | "attendance"
  | "guestCount"
  | "details"
  | "submitting"
  | "success"
  | "declined"
  | "error";

type Props = {
  guestName: string;
  plusOneAllowed: boolean;
};

type ApiResponse = {
  ok: boolean;
  error?: string;
};

async function submitRequest(
  payload: Record<string, unknown>
): Promise<void> {
  const response = await fetch("/api/rsvp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(payload),
  });

  const data = (await response.json()) as ApiResponse;

  if (!response.ok || data.ok !== true) {
    throw new Error(
      data.error ?? "Your RSVP could not be saved."
    );
  }
}

export default function RsvpForm({
  guestName,
  plusOneAllowed,
}: Props) {
  const firstName =
    guestName.trim().split(/\s+/)[0] || guestName;

  const [step, setStep] = useState<Step>("attendance");
  const [guestCount, setGuestCount] = useState(1);
  const [guestNameInput, setGuestNameInput] = useState("");
  const [email, setEmail] = useState("");
  const [meal, setMeal] = useState("Chicken");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] = useState("");
  const [errorReturnTo, setErrorReturnTo] =
    useState<Step>("attendance");

  function showError(error: unknown, returnTo: Step) {
    setErrorMessage(
      error instanceof Error
        ? error.message
        : "Something went wrong. Please try again."
    );

    setErrorReturnTo(returnTo);
    setStep("error");
  }

  async function decline() {
    setErrorMessage("");
    setStep("submitting");

    try {
      await submitRequest({
        action: "submit",
        attending: "No",
        guestCount: 0,
        guestName: "",
        email: "",
        meal: "",
        notes: "",
      });

      setStep("declined");
    } catch (error) {
      showError(error, "attendance");
    }
  }

  function acceptInvitation() {
    setGuestCount(1);

    if (plusOneAllowed) {
      setStep("guestCount");
    } else {
      setStep("details");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setStep("submitting");

    try {
      await submitRequest({
        action: "submit",
        attending: "Yes",
        guestCount,
        guestName:
          guestCount === 2 ? guestNameInput : "",
        email,
        meal,
        notes,
      });

      setStep("success");
    } catch (error) {
      showError(
        error,
        plusOneAllowed ? "details" : "details"
      );
    }
  }

  if (step === "success") {
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

  if (step === "declined") {
    return (
      <div className="rsvp-success">
        <p className="eyebrow">THANK YOU FOR LETTING US KNOW</p>
        <h3>We'll miss you ♡</h3>
        <p>
          We're sorry you won't be able to join us,
          but thank you so much for letting us know.
        </p>
      </div>
    );
  }

  if (step === "submitting") {
    return (
      <div className="rsvp-loading">
        <p className="eyebrow">ONE MOMENT</p>
        <h3>Sending your RSVP…</h3>
      </div>
    );
  }

  if (step === "error") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">SOMETHING WENT WRONG</p>
          <h3>We couldn't submit your RSVP.</h3>
          <p>{errorMessage}</p>
        </div>

        <button
          type="button"
          className="button button-light"
          onClick={() => setStep(errorReturnTo)}
        >
          Try again
        </button>
      </div>
    );
  }

  if (step === "attendance") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">YOUR INVITATION</p>
          <h3>Hi, {firstName}.</h3>
          <p>Will you be joining us?</p>
        </div>

        <div className="rsvp-options">
          <button
            type="button"
            className="rsvp-option"
            onClick={acceptInvitation}
          >
            <span className="rsvp-option-title">
              Joyfully accepting
            </span>
            <span className="rsvp-option-arrow">→</span>
          </button>

          <button
            type="button"
            className="rsvp-option"
            onClick={decline}
          >
            <span className="rsvp-option-title">
              Regretfully declining
            </span>
            <span className="rsvp-option-arrow">→</span>
          </button>
        </div>
      </div>
    );
  }

  if (step === "guestCount") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">YOUR INVITATION</p>
          <h3>Your invitation includes a plus one.</h3>
          <p>How many people will be attending?</p>
        </div>

        <div className="rsvp-options">
          <button
            type="button"
            className={`rsvp-option ${
              guestCount === 1 ? "selected" : ""
            }`}
            onClick={() => setGuestCount(1)}
          >
            <span className="rsvp-option-title">Just me</span>
            <span>{guestCount === 1 ? "✓" : ""}</span>
          </button>

          <button
            type="button"
            className={`rsvp-option ${
              guestCount === 2 ? "selected" : ""
            }`}
            onClick={() => setGuestCount(2)}
          >
            <span className="rsvp-option-title">
              Me + one guest
            </span>
            <span>{guestCount === 2 ? "✓" : ""}</span>
          </button>
        </div>

        <button
          type="button"
          className="button button-light"
          onClick={() => setStep("details")}
        >
          Continue
        </button>

        <button
          type="button"
          className="rsvp-back"
          onClick={() => setStep("attendance")}
        >
          ← Back
        </button>
      </div>
    );
  }

  return (
    <div className="rsvp-step">
      <div className="rsvp-step-header">
        <p className="eyebrow">A FEW MORE DETAILS</p>
        <h3>We're so glad you're coming.</h3>

        {!plusOneAllowed && (
          <p>Your invitation is for one guest.</p>
        )}
      </div>

      <form className="rsvp-form" onSubmit={handleSubmit}>
        <label>
          Email
          <input
            type="email"
            value={email}
            onChange={(event) => setEmail(event.target.value)}
            placeholder="you@example.com"
            autoComplete="email"
            required
          />
        </label>

        {guestCount === 2 && (
          <label>
            Your guest's name
            <input
              type="text"
              value={guestNameInput}
              onChange={(event) =>
                setGuestNameInput(event.target.value)
              }
              placeholder="First and last name"
              required
            />
          </label>
        )}

        <label>
          Meal preference
          <select
            value={meal}
            onChange={(event) => setMeal(event.target.value)}
          >
            <option value="Chicken">Chicken</option>
            <option value="Fish">Fish</option>
            <option value="Vegetarian">Vegetarian</option>
          </select>
        </label>

        <label>
          Anything else we should know?
          <textarea
            rows={4}
            maxLength={2000}
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            placeholder="Dietary restrictions, song requests, etc."
          />
        </label>

        <button type="submit" className="button button-light">
          Send RSVP
        </button>
      </form>

      <button
        type="button"
        className="rsvp-back"
        onClick={() =>
          setStep(plusOneAllowed ? "guestCount" : "attendance")
        }
      >
        ← Back
      </button>
    </div>
  );
}