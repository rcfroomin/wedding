import { useState } from "react";
import type { FormEvent } from "react";

type Step =
  | "name"
  | "attendance"
  | "checking"
  | "guestCount"
  | "details"
  | "submitting"
  | "success"
  | "declined"
  | "error";

type ApiResponse = {
  ok: boolean;
  error?: string;
  found?: boolean;
  plusOneAllowed?: boolean;
};

async function apiRequest(
  body: Record<string, unknown>
): Promise<ApiResponse> {
  const response = await fetch("/api/rsvp", {
    method: "POST",
    headers: {
      "Content-Type": "application/json",
    },
    body: JSON.stringify(body),
  });

  const data = await response.json();

  if (!response.ok || !data.ok) {
    throw new Error(
      data.error ?? "Something went wrong."
    );
  }

  return data;
}

export default function RsvpForm() {
  const [step, setStep] = useState<Step>("name");

  const [name, setName] = useState("");
  const [email, setEmail] = useState("");

  const [plusOneAllowed, setPlusOneAllowed] =
    useState(false);

  const [guestCount, setGuestCount] = useState(1);
  const [guestName, setGuestName] = useState("");

  const [meal, setMeal] = useState("Chicken");
  const [notes, setNotes] = useState("");

  const [errorMessage, setErrorMessage] =
    useState("");

  async function handleAttendance(
    attending: "Yes" | "No"
  ) {
    setErrorMessage("");

    if (attending === "No") {
      try {
        setStep("submitting");

        await apiRequest({
          action: "submit",
          name,
          attending: "No",
        });

        setStep("declined");
      } catch (error) {
        console.error(error);

        setErrorMessage(
          error instanceof Error
            ? error.message
            : "Something went wrong."
        );

        setStep("error");
      }

      return;
    }

    try {
      setStep("checking");

      const result = await apiRequest({
        action: "lookup",
        name,
      });

      if (!result.found) {
        throw new Error(
          "We couldn't find that name on the guest list. Please check your spelling or contact us."
        );
      }

      const allowed =
        result.plusOneAllowed === true;

      setPlusOneAllowed(allowed);
      setGuestCount(1);

      if (allowed) {
        setStep("guestCount");
      } else {
        setStep("details");
      }
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setStep("error");
    }
  }

  async function handleSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();

    setErrorMessage("");
    setStep("submitting");

    try {
      await apiRequest({
        action: "submit",
        name,
        email,
        attending: "Yes",
        guestCount,
        guestName:
          guestCount === 2 ? guestName : "",
        meal,
        notes,
      });

      setStep("success");
    } catch (error) {
      console.error(error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong."
      );

      setStep("error");
    }
  }

  function restart() {
    setStep("name");
    setName("");
    setEmail("");
    setPlusOneAllowed(false);
    setGuestCount(1);
    setGuestName("");
    setMeal("Chicken");
    setNotes("");
    setErrorMessage("");
  }

  if (step === "success") {
    return (
      <div className="rsvp-success">
        <p className="eyebrow">THANK YOU</p>

        <h3>
          You're on the list ♡
        </h3>

        <p>
          We received your RSVP and cannot wait
          to celebrate with you.
        </p>
      </div>
    );
  }

  if (step === "declined") {
    return (
      <div className="rsvp-success">
        <p className="eyebrow">
          THANK YOU FOR LETTING US KNOW
        </p>

        <h3>
          We'll miss you ♡
        </h3>

        <p>
          We’re sorry you won’t be able to join us,
          but thank you so much for letting us know.
        </p>
      </div>
    );
  }

  if (step === "name") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">
            STEP 1 OF 3
          </p>

          <h3>
            First things first…
          </h3>

          <p>
            What name is your invitation under?
          </p>
        </div>

        <form
          className="rsvp-form"
          onSubmit={(event) => {
            event.preventDefault();

            if (!name.trim()) return;

            setStep("attendance");
          }}
        >
          <label>
            Your name

            <input
              type="text"
              value={name}
              onChange={(event) =>
                setName(event.target.value)
              }
              placeholder="First and last name"
              autoComplete="name"
              autoFocus
              required
            />
          </label>

          <button
            type="submit"
            className="button button-light"
          >
            Continue
          </button>
        </form>
      </div>
    );
  }

  if (step === "attendance") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">
            STEP 2 OF 3
          </p>

          <h3>
            Hi, {name.split(" ")[0]}.
          </h3>

          <p>
            Will you be joining us?
          </p>
        </div>

        <div className="rsvp-options">
          <button
            type="button"
            className="rsvp-option"
            onClick={() =>
              handleAttendance("Yes")
            }
          >
            <span className="rsvp-option-title">
              Joyfully accepting
            </span>

            <span className="rsvp-option-arrow">
              →
            </span>
          </button>

          <button
            type="button"
            className="rsvp-option"
            onClick={() =>
              handleAttendance("No")
            }
          >
            <span className="rsvp-option-title">
              Regretfully declining
            </span>

            <span className="rsvp-option-arrow">
              →
            </span>
          </button>
        </div>

        <button
          type="button"
          className="rsvp-back"
          onClick={() =>
            setStep("name")
          }
        >
          ← Back
        </button>
      </div>
    );
  }

  if (step === "checking") {
    return (
      <div className="rsvp-loading">
        <p className="eyebrow">
          JUST A MOMENT
        </p>

        <h3>
          Checking your invitation…
        </h3>
      </div>
    );
  }

  if (step === "guestCount") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">
            STEP 3 OF 3
          </p>

          <h3>
            Your invitation includes a plus one.
          </h3>

          <p>
            How many people will be attending?
          </p>
        </div>

        <div className="rsvp-options">
          <button
            type="button"
            className={`rsvp-option ${
              guestCount === 1
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setGuestCount(1)
            }
          >
            <span>
              Just me
            </span>

            <span>
              {guestCount === 1
                ? "✓"
                : ""}
            </span>
          </button>

          <button
            type="button"
            className={`rsvp-option ${
              guestCount === 2
                ? "selected"
                : ""
            }`}
            onClick={() =>
              setGuestCount(2)
            }
          >
            <span>
              Me + one guest
            </span>

            <span>
              {guestCount === 2
                ? "✓"
                : ""}
            </span>
          </button>
        </div>

        <button
          type="button"
          className="button button-light"
          onClick={() =>
            setStep("details")
          }
        >
          Continue
        </button>

        <button
          type="button"
          className="rsvp-back"
          onClick={() =>
            setStep("attendance")
          }
        >
          ← Back
        </button>
      </div>
    );
  }

  if (step === "details") {
    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">
            A FEW MORE DETAILS
          </p>

          <h3>
            We're so glad you're coming.
          </h3>

          {!plusOneAllowed && (
            <p>
              Your invitation is for one guest.
            </p>
          )}
        </div>

        <form
          className="rsvp-form"
          onSubmit={handleSubmit}
        >
          <label>
            Email

            <input
              type="email"
              value={email}
              onChange={(event) =>
                setEmail(event.target.value)
              }
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
                value={guestName}
                onChange={(event) =>
                  setGuestName(event.target.value)
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
              onChange={(event) =>
                setMeal(event.target.value)
              }
            >
              <option value="Chicken">
                Chicken
              </option>

              <option value="Fish">
                Fish
              </option>

              <option value="Vegetarian">
                Vegetarian
              </option>
            </select>
          </label>

          <label>
            Anything else we should know?

            <textarea
              value={notes}
              onChange={(event) =>
                setNotes(event.target.value)
              }
              rows={4}
              placeholder="Dietary restrictions, song requests, etc."
            />
          </label>

          <button
            type="submit"
            className="button button-light"
          >
            Send RSVP
          </button>
        </form>

        <button
          type="button"
          className="rsvp-back"
          onClick={() =>
            setStep(
              plusOneAllowed
                ? "guestCount"
                : "attendance"
            )
          }
        >
          ← Back
        </button>
      </div>
    );
  }

  if (
    step === "submitting" ||
    step === "error"
  ) {
    if (step === "submitting") {
      return (
        <div className="rsvp-loading">
          <p className="eyebrow">
            ONE MOMENT
          </p>

          <h3>
            Sending your RSVP…
          </h3>
        </div>
      );
    }

    return (
      <div className="rsvp-step">
        <div className="rsvp-step-header">
          <p className="eyebrow">
            SOMETHING WENT WRONG
          </p>

          <h3>
            We couldn't submit your RSVP.
          </h3>

          <p>
            {errorMessage}
          </p>
        </div>

        <button
          type="button"
          className="button button-light"
          onClick={() =>
            setStep("details")
          }
        >
          Try again
        </button>

        <button
          type="button"
          className="rsvp-back"
          onClick={restart}
        >
          Start over
        </button>
      </div>
    );
  }

  return null;
}