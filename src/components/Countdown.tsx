import { useEffect, useState } from "react";

interface CountdownProps {
  targetDate: string;
}

interface TimeRemaining {
  days: number;
  hours: number;
  minutes: number;
  seconds: number;
}

function getTimeRemaining(targetDate: string): TimeRemaining {
  const difference = new Date(targetDate).getTime() - Date.now();

  if (difference <= 0) {
    return {
      days: 0,
      hours: 0,
      minutes: 0,
      seconds: 0,
    };
  }

  return {
    days: Math.floor(difference / (1000 * 60 * 60 * 24)),
    hours: Math.floor(
      (difference / (1000 * 60 * 60)) % 24
    ),
    minutes: Math.floor(
      (difference / (1000 * 60)) % 60
    ),
    seconds: Math.floor(
      (difference / 1000) % 60
    ),
  };
}

function pad(value: number): string {
  return value.toString().padStart(2, "0");
}

export default function Countdown({ targetDate }: CountdownProps) {
  const [time, setTime] = useState<TimeRemaining>(
    getTimeRemaining(targetDate)
  );

  useEffect(() => {
    const interval = window.setInterval(() => {
      setTime(getTimeRemaining(targetDate));
    }, 1000);

    return () => window.clearInterval(interval);
  }, [targetDate]);

  const isWeddingDay =
    time.days === 0 &&
    time.hours === 0 &&
    time.minutes === 0 &&
    time.seconds === 0;

  if (isWeddingDay) {
    return (
      <div className="countdown countdown-complete">
        <span>It's wedding day ♡</span>
      </div>
    );
  }

  const units = [
    ["days", time.days],
    ["hours", time.hours],
    ["minutes", time.minutes],
    ["seconds", time.seconds],
  ] as const;

  return (
    <div className="countdown" aria-label="Countdown to the wedding">
      {units.map(([label, value]) => (
        <div className="countdown-unit" key={label}>
          <strong>{pad(value)}</strong>
          <span>{label}</span>
        </div>
      ))}
    </div>
  );
}