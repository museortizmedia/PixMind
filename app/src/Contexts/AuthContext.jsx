import React, { createContext, useContext, useState, useEffect } from "react";

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
    if (!user?.token) return;

    try {
      const response = await fetch("http://localhost:4000/auth/me", {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${user.token}`,
        },
      });

      if (!response.ok) throw new Error("No se pudo actualizar la sesión");

      const data = await response.json();

      // Solo actualizamos user.user, mantenemos token
      const updatedUser = { ...user, user: data };
      setUser(updatedUser);
      localStorage.setItem("user", JSON.stringify(updatedUser));
    } catch (err) {
      console.error("Error al actualizar sesión:", err);
    }
  };

  // Intervalo para refrescar la sesión cada 60 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      refreshUser();
    }, 60000); // 60.000 ms = 1 minuto

    return () => clearInterval(interval); // limpiar al desmontar
  }, [user]);

  const login = (userData) => {
    setUser(userData);
    localStorage.setItem("user", JSON.stringify(userData));
  };

  const logout = () => {
    setUser(null);
    localStorage.removeItem("user");
  };

  return (
    <AuthContext.Provider value={{ user, login, logout, refreshUser }}>
      {children}
    </AuthContext.Provider>
  );
};