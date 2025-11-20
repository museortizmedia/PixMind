import React, { useEffect, useState } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import CommonButton from "../../components/CommonButton";
import { apiClient } from "../../utils/apiClient"; // importa tu cliente
import { ENDPOINTS } from "../../utils/endpoints"; // opcional, solo si quieres usar ENDPOINTS directamente

export default function Login() {
  const { login } = useAuth();
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");
    setLoading(true);

    const { ok, data } = await apiClient("LOGIN", {
      method: "POST",
      body: { email, password },
      onError: (err) => {
        setError(err.message || "Error al iniciar sesión");
        setLoading(false);
      }
    });

    if (!ok) return;

    // Guardamos el usuario en el contexto
    login(data);

    // Redirigimos a dashboard
    window.location.href = "/dashboard";

    setLoading(false);
  };

  useEffect(() => {
    document.title = "PixMind | Login";
  }, []);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
      <div className="max-w-md w-full bg-white p-10 rounded-xl shadow-lg">
        <h2 className="text-3xl font-bold mb-6 text-center bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] text-transparent bg-clip-text">
          Iniciar sesión
        </h2>

        <form onSubmit={handleSubmit} className="flex flex-col gap-4">
          {error && <p className="text-red-500 text-sm">{error}</p>}

          <input
            type="email"
            placeholder="Correo"
            value={email}
            onChange={(e) => setEmail(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#4DE1E1] transition"
          />

          <input
            type="password"
            placeholder="Contraseña"
            value={password}
            onChange={(e) => setPassword(e.target.value)}
            className="p-3 border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-[#FF96DC] transition"
          />

          <CommonButton type="submit" variant="primary" size="lg" className="mt-4" loading={loading}>
            Entrar
          </CommonButton>

          <CommonButton
            as="a"
            href="/register"
            variant="contrastB"
            size="md"
            className="mt-2 hover:scale-100"
          >
            Registrarse
          </CommonButton>
        </form>

        <p className="mt-6 text-center text-gray-500 text-sm">
          ¿Olvidaste tu contraseña?{" "}
          <CommonButton as="a" href="/forgot" variant="link" size="sm">
            Recuperar
          </CommonButton>
        </p>
      </div>
    </div>
  );
}