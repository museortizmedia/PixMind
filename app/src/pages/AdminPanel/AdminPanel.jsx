import React, { useState, useEffect, useCallback, useMemo } from "react";
import CommonButton from "../../components/CommonButton";
import { apiClient } from "../../utils/apiClient";
import { useAuth } from "../../Contexts/AuthContext";
import { ENDPOINTS } from "../../utils/endpoints";

const ADMIN_TABLE_CONFIG = {
    // Campos que NO queremos mostrar en la tabla (ej. sensibles o redundantes)
    OMIT_FIELDS: ["apiKey", "createdAt"],

    // Si una clave no está aquí, usará el tipo por defecto (TEXTO)
    FIELD_TYPES: {
        email: { type: "text", editable: false },
        usage: { type: "number" },
        usageLimit: { type: "number" },
        isVerified: { type: "boolean" },
    }
};

export default function AdminPanel() {
    const { user, isAdmin } = useAuth(); // Usamos useAuth para obtener el token del admin
    const [users, setUsers] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);
    // Guarda los cambios pendientes: { [userId]: { fieldName: newValue, ... } }
    const [pendingChanges, setPendingChanges] = useState({});


    // --- FUNCIÓN PARA OBTENER DATOS ---
    const fetchUsers = useCallback(async () => {
        if (!isAdmin) return;

        setLoading(true);
        setError(null);

        try {
            const { ok, data } = await apiClient("ADMIN_USERS", {
                method: "GET",
                headers: { Authorization: `Bearer ${user.token}` },

                onError: (err) => console.error("Error al adquirir los usuarios del servidor:", err),
            });

            if (ok) {
                setUsers(data);
            } else {
                setError("Error al cargar usuarios: " + (data.error || "Desconocido"));
            }
        } catch (err) {
            setError("Error de red al cargar usuarios.");
        } finally {
            setLoading(false);
        }
    }, [isAdmin]);

    useEffect(() => {
        document.title = "PixMind | Administración";
        fetchUsers();
    }, [fetchUsers]);

    // --- MANEJO DE CAMBIOS LOCALES ---
    const handleFieldChange = (userId, fieldName, value) => {
        // 1. Obtener el valor original del usuario
        const originalUser = users.find(u => u.id === userId);
        if (!originalUser) return;

        let originalValue = originalUser[fieldName];
        let finalValue = value;
        const type = ADMIN_TABLE_CONFIG.FIELD_TYPES[fieldName]?.type;

        // 2. Normalizar el valor
        if (type === "number") {
            // Conversión estricta a número para comparación
            finalValue = parseInt(value, 10);
            originalValue = parseInt(originalValue, 10);
            if (isNaN(finalValue)) return;
        } else if (type === "boolean") {
            finalValue = value; // El valor ya es booleano del checkbox
        } else {
            // Para texto, asegurar que la comparación sea con cadenas
            finalValue = String(value);
            originalValue = String(originalValue);
        }

        // 3. Determinar si el cambio revierte al valor original
        // Utilizamos `===` que funciona bien para números, booleanos y cadenas normalizadas.
        const isRevertingToOriginal = finalValue === originalValue;

        setPendingChanges(prev => {
            // Copia de los cambios pendientes actuales para este usuario
            const userChanges = { ...(prev[userId] || {}) };

            if (isRevertingToOriginal) {
                // Si revierte al original, eliminamos el campo de los cambios pendientes
                delete userChanges[fieldName];
            } else {
                // Si hay un cambio real, lo registramos
                userChanges[fieldName] = finalValue;
            }

            // 4. Limpiar si no quedan cambios
            if (Object.keys(userChanges).length === 0) {
                // Si el objeto de cambios del usuario está vacío, lo eliminamos de `pendingChanges`
                const { [userId]: removed, ...rest } = prev;
                return rest;
            }

            // Devolver el estado actualizado
            return {
                ...prev,
                [userId]: userChanges,
            };
        });
    };

    // --- FUNCIÓN PARA GUARDAR (PUT) ---
    const handleSave = async (userId) => {
        const changes = pendingChanges[userId];
        if (!changes || Object.keys(changes).length === 0) return;

        setLoading(true);

        try {
            const { ok, data } = await apiClient("ADMIN_USERS", {
                pathSuffix: userId,
                method: "PUT",
                headers: { Authorization: `Bearer ${user.token}` },
                body: changes,
            });

            if (ok) {
                // Actualizar la tabla con la respuesta del servidor y limpiar cambios
                setUsers(prev => prev.map(u => u.id === userId ? { ...u, ...data } : u));
                setPendingChanges(prev => {
                    const { [userId]: removed, ...rest } = prev;
                    return rest;
                });
            } else {
                alert(`Error al guardar: ${data.error || "Desconocido"}`);
            }
        } catch (err) {
            alert("Error de red al guardar.");
        } finally {
            setLoading(false);
        }
    };

    // --- FUNCIÓN PARA BORRAR (DELETE) ---
    const handleDelete = async (userId) => {
        if (!window.confirm("¿Estás seguro de que quieres eliminar a este usuario? Esta acción es irreversible.")) {
            return;
        }

        setLoading(true);

        try {
            const { ok, data } = await apiClient("ADMIN_USERS", {
                pathSuffix: userId,
                method: "DELETE",
                headers: { Authorization: `Bearer ${user.user.token}` },
            });

            if (ok) {
                // Quitar el usuario de la lista
                setUsers(prev => prev.filter(u => u.id !== userId));
            } else {
                alert(`Error al borrar: ${data.error || "Desconocido"}`);
            }
        } catch (err) {
            alert("Error de red al borrar.");
        } finally {
            setLoading(false);
        }
    };

    // --- CÁLCULO DE ENCABEZADOS DE COLUMNA ---
    const tableHeaders = useMemo(() => {
        if (users.length === 0) return [];
        // Filtra los campos a omitir y usa las claves como encabezados
        return Object.keys(users[0]).filter(key => !ADMIN_TABLE_CONFIG.OMIT_FIELDS.includes(key));
    }, [users]);

    // --- COMPONENTE RENDERIZADOR DE INPUT ---
    const RenderInput = ({ user, fieldName }) => {
        const config = ADMIN_TABLE_CONFIG.FIELD_TYPES[fieldName];
        const isEditable = config === undefined || config.editable !== false;

        // El valor actual puede ser el cambio pendiente o el original del usuario
        const currentValue = pendingChanges[user.id] && pendingChanges[user.id][fieldName] !== undefined
            ? pendingChanges[user.id][fieldName]
            : user[fieldName];

        if (!isEditable) {
            // Renderiza como texto estático si no es editable
            return <div className="text-sm font-medium text-gray-900">{String(user[fieldName])}</div>;
        }

        switch (config?.type) {
            case "number":
                return (
                    <input
                        type="number"
                        className="w-20 px-1 py-0.5 border rounded text-sm text-center"
                        value={currentValue}
                        onChange={(e) => handleFieldChange(user.id, fieldName, e.target.value)}
                        disabled={loading}
                    />
                );
            case "boolean":
                return (
                    <input
                        type="checkbox"
                        className="form-checkbox h-4 w-4 text-pink-600 rounded"
                        checked={!!currentValue} // Asegura que el valor sea un booleano para el checked
                        onChange={(e) => handleFieldChange(user.id, fieldName, e.target.checked)}
                        disabled={loading}
                    />
                );
            case "text":
            default:
                return (
                    <input
                        type="text"
                        className="w-full px-1 py-0.5 border rounded text-sm"
                        value={currentValue}
                        onChange={(e) => handleFieldChange(user.id, fieldName, e.target.value)}
                        disabled={loading}
                    />
                );
        }
    };

    // --- RENDERIZADO PRINCIPAL ---
    if (!isAdmin) {
        return <div className="text-center p-20 text-red-600">Acceso denegado.</div>;
    }

    if (loading && users.length === 0) {
        return <div className="text-center p-20 text-blue-600">Cargando usuarios...</div>;
    }

    if (error) {
        return <div className="text-center p-20 text-red-600">Error: {error}</div>;
    }


    return (
        <div className="p-10 min-h-screen bg-gray-50">
            <h1 className="text-3xl font-bold text-gray-800 mb-8">
                Panel de Administración de Usuarios 🛠️
            </h1>

            <div className="shadow overflow-hidden border-b border-gray-200 sm:rounded-lg bg-white">
                <table className="min-w-full divide-y divide-gray-200">
                    <thead className="bg-gray-50">
                        <tr>
                            {tableHeaders.map(key => (
                                <th
                                    key={key}
                                    className="px-6 py-3 text-left text-xs font-medium text-gray-500 uppercase tracking-wider"
                                >
                                    {key.replace(/([A-Z])/g, ' $1').toUpperCase()} {/* Formatea camelCase a Título */}
                                </th>
                            ))}
                            <th className="px-6 py-3 text-center text-xs font-medium text-gray-500 uppercase tracking-wider">
                                Acciones
                            </th>
                        </tr>
                    </thead>
                    <tbody className="bg-white divide-y divide-gray-200">
                        {users.map((user) => {
                            // Verifica si hay cambios pendientes para este usuario
                            const isDirty = pendingChanges[user.id] && Object.keys(pendingChanges[user.id]).length > 0;

                            return (
                                <tr key={user.id} className={isDirty ? "bg-yellow-50/50" : ""}>
                                    {tableHeaders.map(key => (
                                        <td key={`${user.id}-${key}`} className="px-6 py-4 whitespace-nowrap">
                                            <RenderInput user={user} fieldName={key} />
                                        </td>
                                    ))}
                                    <td className="px-6 py-4 whitespace-nowrap text-center text-sm font-medium">
                                        {/* Contenedor Flexbox para alinear horizontalmente */}
                                        <div className="flex justify-center items-center">
                                            {/* Botón de Guardar (Solo si hay cambios pendientes) */}
                                            {isDirty && (
                                                <CommonButton
                                                    onClick={() => handleSave(user.id)}
                                                    variant="primary"
                                                    className="mr-2 px-3 py-1 text-xs"
                                                    disabled={loading}
                                                >
                                                    Guardar
                                                </CommonButton>
                                            )}
                                            {/* Botón de Borrar */}
                                            <CommonButton
                                                onClick={() => handleDelete(user.id)}
                                                variant="secondary"
                                                className="px-3 py-1 text-xs"
                                                disabled={loading}
                                            >
                                                Borrar
                                            </CommonButton>
                                        </div>
                                    </td>
                                </tr>
                            );
                        })}
                    </tbody>
                </table>
            </div>

            {loading && (
                <div className="mt-4 text-center text-sm text-gray-500">
                    Procesando operación...
                </div>
            )}

            {users.length === 0 && !loading && (
                <div className="mt-8 p-10 text-center text-gray-600 border border-dashed rounded-lg">
                    No se encontraron usuarios.
                </div>
            )}
        </div>
    );
}