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
      <main className="min-h-screen bg-black text-white flex items-center justify-center p-6">
        <div className="border border-zinc-800 bg-zinc-950 rounded-3xl p-8 w-full max-w-sm">
          <h1 className="text-3xl font-bold mb-6">
            AroundCities Admin
          </h1>

          <input
            type="password"
            placeholder="Admin Password"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="bg-zinc-900 border border-zinc-700 rounded-2xl px-4 py-3 w-full mb-4 text-white"
          />

          <button
            onClick={login}
            className="bg-white text-black px-4 py-3 rounded-2xl w-full font-semibold"
          >
            Login
          </button>
        </div>
      </main>
    );
  }

  return (
    <main className="min-h-screen bg-black text-white">
      {children}
    </main>
  );
}