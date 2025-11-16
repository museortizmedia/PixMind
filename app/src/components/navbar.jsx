import React from "react";

export default function Navbar() {
  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-white shadow">
      <a href="/" className="text-2xl font-bold text-blue-600">
        PixMind
      </a>

      <div className="flex gap-4">
        <a href="/login" className="text-gray-700 hover:text-blue-600">
          Login
        </a>
        <a href="/register" className="text-gray-700 hover:text-blue-600">
          Registro
        </a>
        <a
          href="/dashboard"
          className="text-gray-700 hover:text-blue-600 font-semibold"
        >
          Dashboard
        </a>
      </div>
    </nav>
  );
}