import React, { useState } from "react";
import CommonButton from "../../components/CommonButton";
import { SERVICE_REGISTRY } from "../../../../shared/MICROSERVICES";
import { useAuth } from "../../Contexts/AuthContext";

export default function EndpointTester() {
    const { user } = useAuth();
    const serviceKeys = Object.keys(SERVICE_REGISTRY);
    const [selectedService, setSelectedService] = useState(serviceKeys[0]);
    // --- Inicializar fieldValues con valores por defecto ---
    const initialFieldValues = serviceKeys.reduce((acc, key) => {
        acc[key] = {};
        if (key === "pixmindNoParking") {
            acc[key].zona = JSON.stringify([300, 580, 1550, 1050]);
        }
        return acc;
    }, {});
    const [fieldValues, setFieldValues] = useState(initialFieldValues);
    const [customPreviews, setCustomPreviews] = useState({});
    const [loading, setLoading] = useState(false);
    const [result, setResult] = useState(null);

    const service = SERVICE_REGISTRY[selectedService];
    const HIDDEN_FIELDS = ["confidence", "threshold", "debug", "score"];



    const updateField = (field, value) => {
        setFieldValues(prev => ({
            ...prev,
            [selectedService]: {
                ...prev[selectedService],
                [field]: value
            }
        }));
    };

    // --- Map microservicio -> API ---
    const getFieldMap = (serviceKey) => {
        const srv = SERVICE_REGISTRY[serviceKey];
        const map = {};

        if (srv.docs?.fields) {
            srv.docs.fields.forEach(f => {
                const microField = Object.keys(srv.fields)
                    .find(k => k.toLowerCase() === f.label.toLowerCase() || k.toLowerCase() === k);
                if (microField) map[microField] = f.label;
            });
        } else {
            if (srv.fields.imagen) map.imagen = "image";
            if (srv.fields.contenido) map.contenido = "image";
        }

        return map;
    };

    // --- Render input con preview ---
    const renderFieldInput = (fieldName, fieldData) => {
        const value = fieldValues[selectedService]?.[fieldName] || "";
        const isFile = fieldData.type === "file";

        // Imagen por defecto según campo
        let defaultPreview = `/samples/modelos/${selectedService}.jpg`;
        if (selectedService === "pixmindArt" && fieldName === "estilo") {
            defaultPreview = `/samples/modelos/${selectedService}_estilo.jpg`;
        }

        return (
            <>
                {isFile && (
                    <div className="my-2">
                        <img
                            src={customPreviews[fieldName] || defaultPreview}
                            alt={fieldName}
                            className="rounded-lg border max-h-64"
                        />
                    </div>
                )}
                <input
                    type={isFile ? "file" : fieldData.type}
                    value={isFile ? undefined : value}
                    onChange={(e) => {
                        const newValue = isFile ? e.target.files[0] : e.target.value;
                        updateField(fieldName, newValue);
                        if (newValue && isFile) {
                            setCustomPreviews(prev => ({ ...prev, [fieldName]: URL.createObjectURL(newValue) }));
                        }
                    }}
                    className="w-full bg-gray-100 p-2 rounded-lg"
                />
            </>
        );
    };

    // --- Construir FormData ---
const buildFormData = async () => {
    const fieldMap = getFieldMap(selectedService);
    let formData = new FormData();

    // Campos por defecto (imagen principal + otros campos genéricos)
    for (const [key, field] of Object.entries(service.fields)) {
        if (HIDDEN_FIELDS.includes(key)) continue;

        const apiKey = fieldMap[key] || key;
        const value = fieldValues[selectedService]?.[key];

        if (field.type === "file") {
            let file = value;

            // Si no hay archivo cargado, usar imagen por defecto
            if (!file) {
                let url = `/samples/modelos/${selectedService}.jpg`;

                // Caso especial: pixmindArt -> estilo tiene imagen distinta
                if (selectedService === "pixmindArt" && key === "estilo") {
                    url = `/samples/modelos/${selectedService}_estilo.jpg`;
                }

                const res = await fetch(url);
                file = await res.blob();
            }

            formData.append(apiKey, file, `${apiKey}.jpg`);
        } else {
            if (value !== undefined) formData.append(apiKey, value);
        }
    }

    // Casos especiales
    if (selectedService === "pixmindNoParking") {
        const newFormData = new FormData();
        for (const [key, value] of formData.entries()) {
            if (value && value.size && value.type) {
                newFormData.append("image", value, "image.jpg");
            } else {
                newFormData.append(key, value);
            }
        }
        formData = newFormData;
    } else if (selectedService === "pixmindArt") {
        const newFormData = new FormData();
        for (const [key, value] of formData.entries()) {
            if (key === "extraImages") {
                newFormData.append("image", value);
            } else if (key === "estilo") {
                newFormData.append("extraImages", value);
            } else {
                newFormData.append(key, value);
            }
        }
        formData = newFormData;
    }

    return formData;
};


    // --- Ejecutar servicio ---
    const runService = async () => {
        setLoading(true);
        setResult(null);

        try {
            const formData = await buildFormData();
            const service = SERVICE_REGISTRY[selectedService];
            const baseURL = window.location.hostname === "localhost"
                ? "http://localhost:4000/model"
                : "https://pixmind.onrender.com/model";

            const res = await fetch(`${baseURL}/${service.docs?.worker || selectedService}`, {
                method: "POST",
                headers: {
                    Authorization: `Bearer ${user.token}`,
                    "x-api-key": user.user.apiKey,
                },
                body: formData
            });

            const contentType = res.headers.get("content-type");

            if (contentType?.includes("image")) {
                // Respuesta binaria directa
                const blob = await res.blob();
                const url = URL.createObjectURL(blob);
                setResult({ type: "image", value: url });
            } else {
                const json = await res.json();

                // Caso: JSON con base64 de imagen
                if (json.result && typeof json.result === "string" && json.mimeType) {
                    const imageUrl = `data:${json.mimeType};base64,${json.result}`;
                    setResult({ type: "image", value: imageUrl });
                    return;
                }

                // Caso: JSON que contiene objeto con base64
                let imageUrl = null;
                let base64Key = null;
                if (json.result && typeof json.result === "object") {
                    base64Key = Object.keys(json.result).find(k => k.toLowerCase().includes("base64"));
                    if (base64Key && typeof json.result[base64Key] === "string") {
                        imageUrl = `data:image/jpeg;base64,${json.result[base64Key]}`;
                    }
                }

                if (imageUrl) {
                    setResult({ type: "image+json", imageKey: base64Key, imageValue: imageUrl, jsonValue: json.result });
                } else {
                    setResult({ type: "json", value: json });
                }
            }
        } catch (err) {
            setResult({ type: "error", value: err.message });
        }

        setLoading(false);
    };

    return (
        <div className="mt-10 max-w-6xl mx-auto">
            {/* HEADER */}
            <div className="flex justify-between items-center mb-10">
                <h2 className="text-3xl font-bold">Probador de Endpoints</h2>
                <select
                    value={selectedService}
                    onChange={(e) => {
                        const newService = e.target.value;
                        setSelectedService(newService);
                        setResult(null);
                        setCustomPreviews({});
                    }}
                    className="border bg-white shadow p-2 rounded-lg text-lg"
                >
                    {serviceKeys.map((key) => (
                        <option key={key} value={key}>{key}</option>
                    ))}
                </select>
            </div>

            {/* WORK PANEL */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
                {/* LEFT: Inputs */}
                <div className="p-6 bg-white shadow rounded-xl space-y-6 border">
                    <h3 className="text-xl font-semibold">Entrada</h3>
                    {Object.entries(service.fields)
                        .filter(([fName]) => !HIDDEN_FIELDS.includes(fName))
                        .map(([fName, fData]) => (
                            <div key={fName} className="mb-4">
                                <label className="font-medium">{fName}{fData.required && "*"}</label>
                                {renderFieldInput(fName, fData)}
                            </div>
                        ))}
                </div>

                {/* RIGHT: Response */}
                <div className="p-6 bg-white shadow rounded-xl border">
                    <h3 className="text-xl font-semibold mb-4">Resultado</h3>
                    {!result && (
                        <div className="text-gray-500 mt-10 text-center">
                            <p>No has ejecutado ninguna prueba todavía.</p>
                        </div>
                    )}
                    {result && (
                        <div className="mt-4 p-4 bg-gray-100 rounded-lg">
                            {result.type === "image" && (
                                <img src={result.value} alt="resultado" className="rounded-lg border" />
                            )}
                            {result.type === "image+json" && (
                                <>
                                    <img src={result.imageValue} alt="resultado" className="rounded-lg border mb-4" />
                                    <pre className="text-xs whitespace-pre-wrap">
                                        {JSON.stringify({ ...result.jsonValue, [result.imageKey]: "base64 image" }, null, 2)}
                                    </pre>
                                </>
                            )}
                            {result.type === "json" && (
                                <pre className="text-xs whitespace-pre-wrap">
                                    {JSON.stringify(result.value, null, 2)}
                                </pre>
                            )}
                            {result.type === "error" && (
                                <p className="text-red-500">{result.value}</p>
                            )}
                        </div>
                    )}
                </div>
            </div>

            {/* CENTER BUTTON */}
            <div className="flex justify-center my-10">
                <CommonButton onClick={runService} variant="primary" size="lg">
                    {loading ? "Procesando..." : "Probar"}
                </CommonButton>
            </div>
        </div>
    );
}
