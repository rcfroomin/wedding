import { useState } from "react";

export default function LogoutButton() {
  const [loading, setLoading] = useState(false);

  async function logout() {
    setLoading(true);

    try {
      const response = await fetch("/api/auth", {
        method: "DELETE",
      });

      if (!response.ok) {
        throw new Error("Logout failed.");
      }

      window.location.replace("/");
    } catch {
      setLoading(false);
      window.alert("Couldn't log out. Please try again.");
    }
  }

  return (
    <button
      type="button"
      className="logout-button"
      onClick={logout}
      disabled={loading}
    >
      {loading ? "Signing out…" : "Sign out"}
    </button>
  );
}