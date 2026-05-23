"use client";

import { useEffect, useState } from "react";

const ADMIN_PASSWORD = "AroundCities_Admin_2026";

export default function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const [authorized, setAuthorized] = useState(false);
  const [password, setPassword] = useState("");

  useEffect(() => {
    const saved = localStorage.getItem("admin-auth");

    if (saved === "true") {
      setAuthorized(true);
    }
  }, []);

  function login() {
    if (password === ADMIN_PASSWORD) {
      localStorage.setItem("admin-auth", "true");
      setAuthorized(true);
    } else {
      alert("Wrong password");
    }
  }

  if (!authorized) {
    return (
      <main className="min-h-screen flex items-center justify-center p-6">
        <div className="border rounded-2xl p-8 w-full max-w-sm">
          <h1 className="text-2xl font-bold mb-6">
            AroundCities Admin
          </h1>

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="border rounded-lg px-4 py-2 w-full mb-4"
          />

          <button
            onClick={login}
            className="bg-black text-white px-4 py-2 rounded-lg w-full"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return <>{children}</>;
}