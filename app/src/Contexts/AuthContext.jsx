import React, { createContext, useContext, useState, useEffect } from "react";
import { apiClient } from "../utils/apiClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

export const AuthProvider = ({ children }) => {
  const [user, setUser] = useState(null);

  // Carga inicial desde localStorage
  useEffect(() => {
    const storedUser = localStorage.getItem("user");
    if (storedUser) setUser(JSON.parse(storedUser));
  }, []);

  // Función para refrescar la sesión y actualizar créditos
  const refreshUser = async () => {
    // Si no hay usuario o no hay token, no hacemos nada
    if (!user?.token) return;

    // Usamos apiClient con la key 'ME' (definida en tus ENDPOINTS)
    const { ok, data } = await apiClient("ME", {
      headers: {
        // Inyectamos el token actual en la cabecera
        Authorization: `Bearer ${user.token}`,
      },
      // Opcional: Si quieres loguear errores específicos de red
      onError: (err) => console.error("Error silencioso al refrescar:", err),
    });

    if (ok) {
      // 'data' ya es el cuerpo de la respuesta JSON parseado por apiClient
      // Mantenemos el token antiguo, actualizamos la info del usuario
      const updatedUser = { ...user, user: data };

      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } else {
      // Opcional: Si el token expiró (ej. error 401), podrías cerrar sesión aquí
      console.warn("No se pudo refrescar la sesión. Token podría ser inválido.");
    }
  };

  // Intervalo para refrescar la sesión cada 5 minutos (300,000 ms)
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 300000);

    return () => clearInterval(interval);
  }, [user]); // Dependencia 'user' para tener acceso al token más reciente

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = async () => {
    if (user?.token) {
      await apiClient("LOGOUT", {
        method: "POST",
        headers: {
          Authorization: `Bearer ${user.token}`,
        },
        // No necesitamos manejar el éxito/error aquí.
        // Incluso si la llamada al servidor falla, DEBEMOS cerrar la sesión local.
        onError: (err) => console.error("Error al notificar logout al servidor:", err),
      });
    }

    setUser(null);
    localStorage.removeItem("user");
    const AUTH_ROUTES = ["/login", "/register", "/dashboard"];
    const currentPath = window.location.pathname;
    const shouldRedirect = AUTH_ROUTES.some(route => currentPath.startsWith(route));

    if (shouldRedirect) {
      window.location.href = '/login';
    } else {
      window.location.reload();
    }
  }

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};