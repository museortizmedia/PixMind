import React from "react";

export default function Login() {
  return (
    <div className="max-w-md mx-auto mt-20 bg-white p-8 rounded-xl shadow">
      <h2 className="text-3xl font-semibold mb-6 text-center">Iniciar sesión</h2>

      <form className="flex flex-col gap-4">
        <input
          type="email"
          placeholder="Correo"
          className="p-3 border rounded-lg"
        />

        <input
          type="password"
          placeholder="Contraseña"
          className="p-3 border rounded-lg"
        />

        <button className="bg-blue-600 text-white py-3 rounded-xl hover:bg-blue-700">
          Entrar
        </button>
      </form>
    </div>
  );
}