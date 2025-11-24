// -------------------------
//  REGISTRO VEHICULAR FIXED
// -------------------------
import React, { useState, useMemo } from 'react';

// --- 1. CONFIGURACIÓN DE COLORES Y ENDPOINT ---

const COLORES_BASE = [
    { nombre: 'Negro', hex: '#000000' },
    { nombre: 'Blanco', hex: '#FFFFFF' },
    { nombre: 'Gris', hex: '#808080' },
    { nombre: 'Plata', hex: '#C0C0C0' },
    { nombre: 'Rojo', hex: '#FF0000' },
    { nombre: 'Azul', hex: '#0000FF' },
    { nombre: 'Verde', hex: '#008000' },
    { nombre: 'Amarillo', hex: '#FFFF00' },
    { nombre: 'Marrón', hex: '#A52A2A' },
    { nombre: 'Naranja', hex: '#FFA500' },
    { nombre: 'Púrpura', hex: '#800080' },
];

const VEHICLE_TYPE_MAP = {
    car: 'Carro',
    truck: 'Camión',
    bus: 'Bus',
    motorcycle: 'Moto',
    bicycle: 'Bicicleta',
    default: 'Otro Vehículo',
};

const PIXMIND_ENDPOINT = "https://pixmind.onrender.com/model/pixmindVehicle";

// --- FUNCIONES AUXILIARES ---

const calcularColorCercano = (hexWorker) => {
    const hexToRgb = (hex) => {
        let h = hex.replace('#', '');
        if (h.length !== 6) return { r: 0, g: 0, b: 0 };
        const n = parseInt(h, 16);
        return { r: (n >> 16) & 255, g: (n >> 8) & 255, b: n & 255 };
    };

    const wk = hexToRgb(hexWorker);
    let mejor = COLORES_BASE[0];
    let distMin = Infinity;

    for (const c of COLORES_BASE) {
        const b = hexToRgb(c.hex);
        const dist = Math.sqrt(
            (wk.r - b.r) ** 2 +
            (wk.g - b.g) ** 2 +
            (wk.b - b.b) ** 2
        );

        if (dist < distMin) {
            distMin = dist;
            mejor = c;
        }
    }
    return mejor.nombre;
};

const normalizarPlacaColombiana = (textoPlaca) => {
    if (!textoPlaca) return null;
    let p = textoPlaca.toUpperCase().replace(/[^A-Z0-9]/g, '');
    const regex = /^[A-Z]{3}[0-9]{3}$/;

    if (p.length === 6 && regex.test(p)) return p;

    if (p.length >= 6 && p.length <= 8) {
        let p1 = p.slice(-6);
        if (regex.test(p1)) return p1;
        let p2 = p.slice(0, 6);
        if (regex.test(p2)) return p2;
    }
    return null;
};

// --- COMPONENTE PRINCIPAL ---

const RegistroVehicular = ({ userApiKey }) => {

    const [archivoImagen, setArchivoImagen] = useState(null);
    const [cargando, setCargando] = useState(false);
    const [error, setError] = useState(null);

    // resultado = data.result del servidor
    const [resultado, setResultado] = useState(null);

    const [formularioDatos, setFormularioDatos] = useState({
        placa: '',
        tipo: 'Carro',
        color: 'Negro',
    });

    // Primer vehículo detectado
    const primerVehiculoDetectado = useMemo(() => {
        if (!resultado || !resultado.detalles || resultado.detalles.length === 0) return null;
        return resultado.detalles[0];
    }, [resultado]);

    // Datos crudos para sección “Esto hemos visto”
    const obtenerDatosVistos = useMemo(() => {
        if (!primerVehiculoDetectado) return null;

        return {
            placaCruda: primerVehiculoDetectado.placa?.texto || 'No detectada',
            tipoCrudo: primerVehiculoDetectado.tipo || 'default',
            colorHexCrudo: primerVehiculoDetectado.color_hex || '#808080',
            confianzaVehiculo:
                ((primerVehiculoDetectado.confianza_vehiculo ||
                    primerVehiculoDetectado.confianza ||
                    0) * 100).toFixed(1) + '%',

            confianzaPlaca:
                primerVehiculoDetectado.placa?.confianza
                    ? (primerVehiculoDetectado.placa.confianza * 100).toFixed(1) + '%'
                    : 'N/A',
        };
    }, [primerVehiculoDetectado]);

    // --- MANEJAR CAMBIO DE ARCHIVO ---
    const manejarCambioArchivo = (e) => {
        const file = e.target.files?.[0] || null;
        setArchivoImagen(file);
        setError(null);
        setResultado(null);
        setFormularioDatos({
            placa: '',
            tipo: 'Carro',
            color: 'Negro',
        });
    };

    // --- PROCESO AUTOMÁTICO ---
    const manejarRegistroAutomatico = async (e) => {
        e.preventDefault();

        if (!archivoImagen) return setError("Por favor, sube una imagen.");
        if (!userApiKey) return setError("Falta tu API KEY.");

        setCargando(true);
        setError(null);

        let data = null;
        let lastError = null;

        for (let i = 0; i < 3; i++) {
            try {
                const fd = new FormData();
                fd.append("image", archivoImagen);

                const res = await fetch(PIXMIND_ENDPOINT, {
                    method: "POST",
                    headers: {
                        "x-api-key": userApiKey
                    },
                    body: fd
                });

                if (!res.ok) {
                    throw new Error(`Error del servidor: ${res.status}`);
                }

                const jd = await res.json();
                data = jd;
                break;

            } catch (err) {
                lastError = err;
                await new Promise(r => setTimeout(r, (i + 1) * 1000));
            }
        }

        if (!data) {
            setCargando(false);
            return setError(lastError?.message || "Error desconocido");
        }

        // === FIX: Estructura uniforme ===
        const result = data.result || data;
        setResultado(result);

        const totalVehiculos = result.total_vehiculos ?? data.total_vehiculos ?? 0;

        if (totalVehiculos === 0) {
            setError("Imagen procesada, pero no se detectaron vehículos.");
            setCargando(false);
            return;
        }

        const v = result.detalles[0];

        // Placa
        const placaRaw = v.placa?.texto || "";
        const placaNorm = normalizarPlacaColombiana(placaRaw);

        // Tipo
        const tipo = VEHICLE_TYPE_MAP[(v.tipo || "").toLowerCase()] || VEHICLE_TYPE_MAP.default;

        // Color
        const color = calcularColorCercano(v.color_hex || '#808080');

        setFormularioDatos({
            placa: placaNorm || (placaRaw || "Placa Inválida"),
            tipo,
            color,
        });

        setCargando(false);
    };

    // --- RENDER ---

    return (
        <div className="min-h-full bg-gray-50 p-6">
            
            <div className="max-w-4xl mx-auto bg-white shadow-xl rounded-lg p-6 grid grid-cols-1 lg:grid-cols-2 gap-8">

                {/* ------------------------------ */}
                {/* --------- COLUMNA IZQ -------- */}
                {/* ------------------------------ */}

                <section>
                    <h2 className="text-xl font-bold mb-4">Paso 1: Análisis Automático</h2>

                    <form onSubmit={manejarRegistroAutomatico} className="space-y-4">
                        <input type="file" accept="image/*" onChange={manejarCambioArchivo} required />

                        <button
                            type="submit"
                            disabled={!archivoImagen || cargando}
                            className="w-full bg-yellow-400 hover:bg-yellow-500 py-2 rounded-md font-semibold"
                        >
                            {cargando ? "Analizando..." : "🚗 Analizar y Rellenar"}
                        </button>
                    </form>

                    {error && <div className="p-3 bg-red-100 border border-red-400 text-red-700 rounded-md mt-4">{error}</div>}

                    {resultado && !error && (
                        <div className="mt-4 p-3 bg-green-100 border border-green-400 rounded-md">
                            ✔ Vehículos detectados: <b>{resultado.total_vehiculos}</b>
                        </div>
                    )}

                    {/* --- ESTO HEMOS VISTO --- */}
                    {obtenerDatosVistos && (
                        <div className="mt-6 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                            <h3 className="font-bold text-blue-800 mb-2">🔍 Esto hemos visto (Datos crudos)</h3>

                            <p><b>Tipo:</b> {obtenerDatosVistos.tipoCrudo} ({obtenerDatosVistos.confianzaVehiculo})</p>

                            <p className="flex items-center">
                                <b>Color:</b>
                                <span
                                    className="w-4 h-4 rounded-full mx-2 border"
                                    style={{ backgroundColor: obtenerDatosVistos.colorHexCrudo }}
                                ></span>
                                {obtenerDatosVistos.colorHexCrudo}
                            </p>

                            <p><b>Placa OCR:</b> {obtenerDatosVistos.placaCruda} ({obtenerDatosVistos.confianzaPlaca})</p>
                        </div>
                    )}

                    {/* --- DEPURACIÓN (movida debajo de Esto Hemos Visto) --- */}
                    {(resultado || formularioDatos.placa) && (
                        <div className="mt-6 p-4 bg-gray-900 text-white rounded-lg">

                            <h3 className="text-lg font-bold text-yellow-400 mb-3">🛠 Debugging</h3>

                            <p>Formulario:</p>
                            <pre className="bg-gray-800 p-2 rounded-md">{JSON.stringify(formularioDatos, null, 2)}</pre>

                            <p className="mt-3">Primer vehículo:</p>
                            <pre className="bg-gray-800 p-2 rounded-md">{JSON.stringify(primerVehiculoDetectado, null, 2)}</pre>

                            <p className="mt-3">Datos Vistos:</p>
                            <pre className="bg-gray-800 p-2 rounded-md">{JSON.stringify(obtenerDatosVistos, null, 2)}</pre>

                            <p className="mt-3 text-yellow-300">Respuesta cruda:</p>
                            <pre className="bg-gray-800 p-2 rounded-md">{JSON.stringify(resultado, null, 2)}</pre>
                        </div>
                    )}

                </section>

                {/* ------------------------------ */}
                {/* --------- COLUMNA DER -------- */}
                {/* ------------------------------ */}

                <section>
                    <h2 className="text-xl font-bold mb-4">Paso 2: Datos Finales</h2>

                    {/* Placa */}
                    <label>Placa</label>
                    <input
                        type="text"
                        value={formularioDatos.placa}
                        onChange={(e) => setFormularioDatos({ ...formularioDatos, placa: e.target.value })}
                        className="w-full border p-2 mb-4 rounded"
                    />

                    {/* Tipo */}
                    <label>Tipo</label>
                    <input type="text" value={formularioDatos.tipo} readOnly className="w-full border p-2 mb-4 rounded bg-gray-100" />

                    {/* Color */}
                    <label>Color</label>
                    <select
                        value={formularioDatos.color}
                        onChange={(e) => setFormularioDatos({ ...formularioDatos, color: e.target.value })}
                        className="w-full border p-2 mb-4 rounded"
                    >
                        {COLORES_BASE.map(c => (
                            <option key={c.hex}>{c.nombre}</option>
                        ))}
                    </select>

                    <button
                        className="w-full mt-4 bg-green-500 hover:bg-green-600 text-white py-2 rounded-md"
                        disabled={!formularioDatos.placa || formularioDatos.placa.includes("Inválida")}
                    >
                        💾 Registrar Vehículo
                    </button>
                </section>

            </div>

            {/* Imagen final analizada */}
            {resultado?.imagen_analizada_base64 && (
                <div className="max-w-4xl mx-auto mt-6">
                    <img
                        className="rounded-lg shadow-lg"
                        src={`data:${resultado.mimeType};base64,${resultado.imagen_analizada_base64}`}
                        alt="Procesada"
                    />
                </div>
            )}

        </div>
    );
};

export default RegistroVehicular;