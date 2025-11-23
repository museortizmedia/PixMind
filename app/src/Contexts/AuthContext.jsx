import React, { createContext, useContext, useState, useEffect, useMemo, useCallback } from "react";
import { apiClient } from "../utils/apiClient";

const AuthContext = createContext();

export const useAuth = () => useContext(AuthContext);

const ADMIN_EMAIL = "museortiz+pixmind@gmail.com";
const SECRET_SALT = "mi_clave_secreta_para_firmar_datos_local";

// Funciones nativas para hashear y convertir arrays a string
const hashData = async (data) => {
    const buffer = new TextEncoder().encode(data);
    const hashBuffer = await window.crypto.subtle.digest('SHA-256', buffer);
    const hashArray = Array.from(new Uint8Array(hashBuffer));
    const hashHex = hashArray.map(b => b.toString(16).padStart(2, '0')).join('');
    return hashHex;
};

// --- Funciones de almacenamiento seguro ---

const secureSetStorage = async (userData) => {
    const jsonString = JSON.stringify(userData);
    const dataToHash = `${userData.token || ''}:${userData.user?.email || ''}:${SECRET_SALT}`;
    
    // Generación de Hash/Firma asíncrona
    const signature = await hashData(dataToHash); 

    const secureObject = JSON.stringify({
        data: jsonString,
        signature: signature
    });
    
    // Ofuscación con Base64
    const obfuscatedData = btoa(secureObject); 
    
    localStorage.setItem("user", obfuscatedData);
};

const secureGetStorage = async () => {
    const obfuscatedData = localStorage.getItem("user");
    if (!obfuscatedData) return null;

    try {
        // Desofuscar con Base64
        const secureObject = atob(obfuscatedData);
        const { data: jsonString, signature: storedSignature } = JSON.parse(secureObject);

        // Parsear datos de usuario
        const userData = JSON.parse(jsonString);

        // Recalcular el hash para verificar la integridad
        const dataToHash = `${userData.token || ''}:${userData.user?.email || ''}:${SECRET_SALT}`;
        const currentSignature = await hashData(dataToHash); 

        if (currentSignature !== storedSignature) {
            console.error("ALERTA DE SEGURIDAD: Datos de usuario manipulados en localStorage. Cerrando sesión.");
            localStorage.removeItem("user");
            return null;
        }

        return userData;

    } catch (e) {
        console.error("Error al procesar datos:", e);
        localStorage.removeItem("user");
        return null;
    }
};

// --- Componente AuthProvider ---

export const AuthProvider = ({ children }) => {
    const [user, setUser] = useState(null);

    // Carga inicial desde localStorage (Ahora es asíncrona)
    useEffect(() => {
        const loadUser = async () => {
            const storedUser = await secureGetStorage();
            if (storedUser) setUser(storedUser);
        };
        loadUser();
    }, []);

    // --- FUNCIÓN MEMOIZADA 1: REFRESH USER ---
    const refreshUser = useCallback(async () => {
        if (!user?.token) return;

        const { ok, data } = await apiClient("ME", {
            headers: {
                Authorization: `Bearer ${user.token}`,
            },
            onError: (err) => console.error("Error silencioso al refrescar:", err),
        });

        if (ok) {
            const updatedUser = { ...user, user: data };
            setUser(updatedUser);
            await secureSetStorage(updatedUser); // 👈 Guardado seguro asíncrono
        } else {
            console.warn("No se pudo refrescar la sesión. Token podría ser inválido.");
        }
    }, [user]);

    // --- FUNCIÓN MEMOIZADA 2: LOGIN ---
    const login = useCallback(async (userData) => { // 👈 Ahora es asíncrona
        setUser(userData);
        await secureSetStorage(userData); // 👈 Guardado seguro asíncrono
    }, []);

    // --- FUNCIÓN MEMOIZADA 3: LOGOUT ---
    const logout = useCallback(async () => {
        if (user?.token) {
            await apiClient("LOGOUT", {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                },
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
    }, [user]);

    // Intervalo para refrescar la sesión
    useEffect(() => {
        const interval = setInterval(() => {
            refreshUser();
        }, 300000);

        return () => clearInterval(interval);
    }, [refreshUser]);

    // --- CÁLCULO DEL ESTADO DERIVADO CON useMemo ---
    const authValues = useMemo(() => {
        const currentUserEmail = user?.user?.email;
        const isAdmin = currentUserEmail === ADMIN_EMAIL;
        
        const hasPermission = (requiredRole) => {
            if (requiredRole === 'admin') {
                return isAdmin;
            }
            return false;
        };

        return {
            user,
            isAdmin, 
            hasPermission, 
            login,       
            logout,      
            refreshUser, 
        };
    }, [user, login, logout, refreshUser]);

    return (
        <AuthContext.Provider value={authValues}>
            {children}
        </AuthContext.Provider>
    );
};