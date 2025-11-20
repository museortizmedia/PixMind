import React from "react";
import { useAuth } from "../Contexts/AuthContext";

export default function Navbar() {
  const path = window.location.pathname; // ruta actual
  const { user, logout } = useAuth();

  const links = user
    ? [{ name: "Dashboard", href: "/dashboard" }]
    : [
      { name: "Login", href: "/login" },
      { name: "Registro", href: "/register" },
    ];

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#fffffff6]">
      <a
        href="/"
        className={`text-2xl font-bold bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] text-transparent bg-clip-text`}
      >
        PixMind
      </a>

      <div className="flex gap-4">
        {links.map((link) => (
          <a
            key={link.href}
            href={link.href}
            className={`${path === link.href
                ? "text-[#4DE1E1] font-semibold hover:font-semibold"
                : "text-gray-700 hover:text-[#4DE1E1]"
              }`}
          >
            {link.name}
          </a>
        ))}

        {/* Mostramos botón de logout si hay usuario */}
        {user && (
          <button
            onClick={() => {
              logout();
              window.location.href = "/";
            }}
            className="text-gray-700 hover:text-[#FF96DC] font-medium ml-4"
          >
            Salir
          </button>
        )}

      </div>
    </nav>
  );
}