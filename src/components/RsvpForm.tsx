import { useState } from "react";
import type { FormEvent } from "react";

type InvitedGuest = {
  name: string;
  plusOneAllowed: boolean;
};

type Attendance = "Yes" | "No" | null;

type GuestResponse = {
  name: string;
  attending: Attendance;
  guestCount: number;
  guestName: string;
  meal: string;
};

type Step =
  | "attendance"
  | "details"
  | "submitting"
  | "success"
  | "declined"
  | "error";

type Props = {
  guests: InvitedGuest[];
};

function joinNames(names: string[]): string {
  if (names.length <= 1) return names[0] ?? "";

  if (names.length === 2) {
    return `${names[0]} & ${names[1]}`;
  }

  return `${names.slice(0, -1).join(", ")}, & ${names[names.length - 1]}`;
}

function firstName(fullName: string): string {
  return fullName.trim().split(/\s+/)[0] ?? fullName;
}

export default function RsvpForm({ guests }: Props) {
  const firstNames = joinNames(
    guests.map((guest) => firstName(guest.name))
  );

  const [step, setStep] = useState<Step>("attendance");

  const [responses, setResponses] = useState<GuestResponse[]>(
    guests.map((guest) => ({
      name: guest.name,
      attending: null,
      guestCount: 1,
      guestName: "",
      meal: "Chicken",
    }))
  );

  const [email, setEmail] = useState("");
  const [notes, setNotes] = useState("");
  const [errorMessage, setErrorMessage] = useState("");
  const [errorReturnTo, setErrorReturnTo] =
    useState<"attendance" | "details">("attendance");

  const allAnswered =
    responses.length === guests.length &&
    responses.every(
      (response) =>
        response.attending === "Yes" ||
        response.attending === "No"
    );

  const anyoneAttending = responses.some(
    (response) => response.attending === "Yes"
  );

  const attendingGuests = responses.filter(
    (response) => response.attending === "Yes"
  );

  function updateGuest(
    name: string,
    patch: Partial<GuestResponse>
  ) {
    setResponses((current) =>
      current.map((response) =>
        response.name === name
          ? { ...response, ...patch }
          : response
      )
    );
  }

  function chooseAttendance(
    name: string,
    attending: "Yes" | "No"
  ) {
    updateGuest(name, {
      attending,
      guestCount: attending === "Yes" ? 1 : 0,
      guestName: "",
      meal: "Chicken",
    });
  }

  async function saveResponses() {
    const unanswered = responses.filter(
      (response) =>
        response.attending !== "Yes" &&
        response.attending !== "No"
    );

    if (unanswered.length > 0) {
      setErrorMessage(
        `Please select an attendance response for: ${
          unanswered.map((guest) => guest.name).join(", ")
        }.`
      );

      setErrorReturnTo("attendance");
      setStep("error");
      return;
    }

    setErrorMessage("");
    setStep("submitting");

    try {
      const submittedResponses = responses.map((response) => ({
        name: response.name,
        attending: response.attending as "Yes" | "No",
        guestCount:
          response.attending === "Yes"
            ? response.guestCount
            : 0,
        guestName:
          response.attending === "Yes" &&
          response.guestCount === 2
            ? response.guestName.trim()
            : "",
        meal:
          response.attending === "Yes"
            ? response.meal
            : "",
      }));

      const response = await fetch("/api/rsvp", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({
          action: "submit",
          email,
          notes,
          responses: submittedResponses,
        }),
      });

      const result = await response.json();

      if (!response.ok || result.ok !== true) {
        throw new Error(
          result.error ?? "Your RSVP could not be saved."
        );
      }

      setStep(anyoneAttending ? "success" : "declined");
    } catch (error) {
      console.error("RSVP submission failed:", error);

      setErrorMessage(
        error instanceof Error
          ? error.message
          : "Something went wrong. Please try again."
      );

      setErrorReturnTo(anyoneAttending ? "details" : "attendance");
      setStep("error");
    }
  }

  function continueFromAttendance() {
    if (!allAnswered) return;

    if (anyoneAttending) {
      setStep("details");
    } else {
      void saveResponses();
    }
  }

  function handleDetailsSubmit(
    event: FormEvent<HTMLFormElement>
  ) {
    event.preventDefault();
    void saveResponses();
  }

  if (step === "success") {
    return (
      <div className="rsvp-success">
        <p className="eyebrow">THANK YOU</p>
        <h3>You're on the list ♡</h3>
        <p>
          We received your responses and cannot wait
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
        <h3>Sending your responses…</h3>
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

          <h3>
            Hi, {firstNames}.
          </h3>

          <p>
            {guests.length > 1
              ? "Please let us know whether each of you can join us."
              : "Will you be joining us?"}
          </p>
        </div>

        <div className="rsvp-household-list">
          {responses.map((response) => (
            <article
              className="rsvp-person-card"
              key={response.name}
            >
              <h4 className="rsvp-person-name">
                {response.name}
              </h4>

              <div
                className="rsvp-choice-row"
                aria-label={`Attendance for ${response.name}`}
              >
                <button
                  type="button"
                  className={`rsvp-choice ${
                    response.attending === "Yes"
                      ? "selected"
                      : ""
                  }`}
                  aria-pressed={response.attending === "Yes"}
                  onClick={() =>
                    chooseAttendance(response.name, "Yes")
                  }
                >
                  Joyfully accepting
                </button>

                <button
                  type="button"
                  className={`rsvp-choice ${
                    response.attending === "No"
                      ? "selected"
                      : ""
                  }`}
                  aria-pressed={response.attending === "No"}
                  onClick={() =>
                    chooseAttendance(response.name, "No")
                  }
                >
                  Regretfully declining
                </button>
              </div>
            </article>
          ))}
        </div>

        <button
          type="button"
          className="button button-light"
          disabled={!allAnswered}
          onClick={continueFromAttendance}
        >
          {anyoneAttending
            ? "Continue to details"
            : "Confirm responses"}
        </button>

        {!allAnswered && (
          <p className="rsvp-helper">
            Please select an answer for everyone on your invitation.
          </p>
        )}
      </div>
    );
  }

  return (
    <div className="rsvp-step">
      <div className="rsvp-step-header">
        <p className="eyebrow">A FEW MORE DETAILS</p>

        <h3>
          We're so glad you're coming.
        </h3>

        <p>
          Please provide the details for everyone attending.
        </p>
      </div>

      <form
        className="rsvp-form"
        onSubmit={handleDetailsSubmit}
      >
        <label>
          Contact email

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

        {attendingGuests.map((response) => {
          const guest = guests.find(
            (item) => item.name === response.name
          );

          if (!guest) return null;

          return (
            <section
              className="rsvp-person-details"
              key={response.name}
            >
              <h4>{response.name}</h4>

              {guest.plusOneAllowed && (
                <label>
                  How many people are attending with{" "}
                  {firstName(guest.name)}?

                  <select
                    value={response.guestCount}
                    onChange={(event) => {
                      const count = Number(event.target.value);

                      updateGuest(response.name, {
                        guestCount: count,
                        guestName:
                          count === 1
                            ? ""
                            : response.guestName,
                      });
                    }}
                  >
                    <option value={1}>
                      Just {firstName(guest.name)}
                    </option>

                    <option value={2}>
                      {firstName(guest.name)} + one guest
                    </option>
                  </select>
                </label>
              )}

              {response.guestCount === 2 && (
                <label>
                  Additional guest's name

                  <input
                    type="text"
                    value={response.guestName}
                    onChange={(event) =>
                      updateGuest(response.name, {
                        guestName: event.target.value,
                      })
                    }
                    placeholder="First and last name"
                    required
                  />
                </label>
              )}

              <label>
                Meal preference

                <select
                  value={response.meal}
                  onChange={(event) =>
                    updateGuest(response.name, {
                      meal: event.target.value,
                    })
                  }
                >
                  <option value="Chicken">Chicken</option>
                  <option value="Fish">Fish</option>
                  <option value="Vegetarian">Vegetarian</option>
                </select>
              </label>
            </section>
          );
        })}

        <label>
          Anything else we should know?

          <textarea
            value={notes}
            onChange={(event) => setNotes(event.target.value)}
            rows={4}
            maxLength={2000}
            placeholder="Dietary restrictions, song requests, etc."
          />
        </label>

        <button
          type="submit"
          className="button button-light"
        >
          Submit our responses
        </button>
      </form>

      <button
        type="button"
        className="rsvp-back"
        onClick={() => setStep("attendance")}
      >
        ← Back to attendance
      </button>
    </div>
  );
}