import React, { useState } from "react";
import { useAuth } from "../Contexts/AuthContext";

export default function Navbar() {
  const path = window.location.pathname;
  const { user, logout, refreshUser } = useAuth();
  const [loadingCredits, setLoadingCredits] = useState(false);

  const links = user
    ? [
      { name: "Dashboard", href: "/dashboard" },
      { name: "Docs", href: "/docs" },
    ]
    : [
        { name: "Login", href: "/login" },
        { name: "Registro", href: "/register" },
        { name: "Docs", href: "/docs" },
      ];

  const handleRefreshCredits = async () => {
    if (!user) return;
    setLoadingCredits(true);
    try {
      await refreshUser();
    } finally {
      setLoadingCredits(false);
    }
  };

  return (
    <nav className="flex items-center justify-between px-6 py-4 bg-[#fffffff6]">
      <a
        href="/"
        className="text-2xl font-bold bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] text-transparent bg-clip-text"
      >
        PixMind
      </a>

      <div className="flex items-center gap-6">
        <div className="flex gap-4">
          {links.map((link) => (
            <a
              key={link.href}
              href={link.href}
              className={`${
                path === link.href
                  ? "text-[#4DE1E1] font-semibold hover:font-semibold"
                  : "text-gray-700 hover:text-[#4DE1E1]"
              }`}
            >
              {link.name}
            </a>
          ))}
        </div>

        {user && (
  <div
    className="flex flex-col items-center cursor-pointer select-none relative"
    title="Actualizar créditos"
    onClick={handleRefreshCredits}
  >
    {/* Contenedor principal de créditos */}
    <div className="bg-[#4DE1E1]/20 rounded-xl px-3 py-2 w-24 text-center relative">
      <span className="font-semibold text-gray-800 text-[13px]">
        {user.user.usage} / {user.user.usageLimit}
      </span>

      {/* Barra de progreso horizontal */}
      <div className="w-full bg-gray-200 rounded-full h-2 mt-1">
        <div
          className="bg-[#4DE1E1] h-2 rounded-full transition-all duration-300"
          style={{
            width: `${(user.user.usage / user.user.usageLimit) * 100}%`,
          }}
        />
      </div>

      {/* Spinner overlay mientras carga */}
      {loadingCredits && (
        <div className="absolute inset-0 flex items-center justify-center bg-white/60 rounded-xl">
          <div className="w-5 h-5 border-2 border-t-[#4DE1E1] border-b-transparent border-l-transparent border-r-transparent rounded-full animate-spin"></div>
        </div>
      )}
    </div>
  </div>
)}

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