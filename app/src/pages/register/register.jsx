import React, { useState } from "react";
import CommonButton from "../../components/CommonButton";
import { apiClient } from "../../utils/apiClient";

export default function Register() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [error, setError] = useState("");
  const [success, setSuccess] = useState("");

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setSuccess("");

    if (password !== confirmPassword) {
      setError("Las contraseñas no coinciden");
      return;
    }

    const { ok, data } = await apiClient("REGISTER", {
      method: "POST",
      body: { email, password },
      onError: (err) => setError(err.message || "Error al crear la cuenta"),
    });

    if (!ok) return;

    setSuccess("Cuenta creada correctamente. Redirigiendo al login...");
    setTimeout(() => {
      window.location.href = "/login";
    }, 2000);
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] text-transparent bg-clip-text">
          Crear cuenta
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}
          {success && <p className="text-green-500 text-sm">{success}</p>}

          <input
            type="email"
            placeholder="Correo electrónico"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DE1E1] transition"
            required
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF96DC] transition"
            required
          />

          <input
            type="password"
            placeholder="Confirmar contraseña"
            value={confirmPassword}
            onChange={(e) => setConfirmPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF96DC] transition"
            required
          />

          <CommonButton type="submit" variant="primary" size="lg" className="mt-4">
            Comenzar
          </CommonButton>

          <CommonButton
            as="a"
            href="/login"
            variant="contrastB"
            size="md"
            className="mt-2 hover:scale-100"
          >
            Ya tengo cuenta
          </CommonButton>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          Al registrarte, aceptas nuestros{" "}
          <CommonButton as="a" href="/terms" variant="link" size="sm">
            Términos y condiciones
          </CommonButton>.
        </p>
      </div>
    </div>
  );
}