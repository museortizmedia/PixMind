import React from "react";

export default function Navbar() {
  const path = window.location.pathname; // ruta actual

  const links = [
    { name: "Login", href: "/login" },
    { name: "Registro", href: "/register" },
    { name: "Dashboard", href: "/dashboard" },
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
    </nav>
  );
}