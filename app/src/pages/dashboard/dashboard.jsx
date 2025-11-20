import React, { useState, useRef } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import CommonButton from "../../components/CommonButton";

const ejemploModelos = [
  {
    id: "vehicle-plate",
    nombre: "Detección de Placa Vehicular",
    descripcion: "Analiza una imagen para identificar el tipo de vehículo y extraer la placa",
    valorObtenido: "JSON con tipo de vehículo y placa formateada",
    entradasEsperadas: ["image: archivo (multipart/form-data)"],
    documentacion: `Ejemplo de uso:

POST /api/vehicle-plate
Headers: Authorization: Bearer <API_KEY>
Content-Type: multipart/form-data
Body: 
  - image: archivo de imagen del vehículo

Respuesta esperada:
{
  "vehicleType": "automóvil",
  "plate": "ABC-1234",
  "found": true
}`
  }
];

export default function Dashboard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
  const [openAccordion, setOpenAccordion] = useState(null);
  const apiKeyRef = useRef(null);

  const copyApiKey = () => {
    if (user?.user?.apiKey) {
      navigator.clipboard.writeText(user.user.apiKey);
      setCopied(true);
      setTimeout(() => setCopied(false), 2000);
    }
  };

  const selectApiKey = () => {
    if (apiKeyRef.current) {
      const range = document.createRange();
      range.selectNodeContents(apiKeyRef.current);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
    }
  };

  const toggleAccordion = (id) => {
    setOpenAccordion(openAccordion === id ? null : id);
  };

  if (!user) {
    return (
      <div className="min-h-screen flex items-center justify-center bg-gray-50 px-4">
        <p className="text-gray-700 text-lg">
          Debes iniciar sesión para acceder al Dashboard.
        </p>
      </div>
    );
  }

  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="px-8 py-20 max-w-6xl mx-auto text-center">
        <h1 className="text-5xl font-bold bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] !text-transparent bg-clip-text">
          Dashboard
        </h1>
        <p className="mt-6 text-lg text-gray-700">
          Bienvenido, {user.user.email}. Aquí puedes ver tu API Key y ejemplos de uso.
        </p>
      </section>

      {/* API Key Section */}
      <section className="px-8 py-10 max-w-4xl w-full mx-auto bg-white border-zinc-100 border rounded-xl shadow-lg">
        <h2 className="text-2xl font-semibold text-gray-900">Tu API Key:</h2>
        <div className="mt-4 flex flex-col md:flex-row md:items-center gap-4">
          <p
            ref={apiKeyRef}
            onClick={selectApiKey}
            className="flex-1 bg-gray-100 p-3 text-sm rounded-lg font-mono break-all cursor-pointer select-text"
            title="Haz clic para seleccionar todo"
          >
            {user.user.apiKey}
          </p>
          <CommonButton
            onClick={copyApiKey}
            variant={copied ? "contrastA" : "primary"}
            size="sm"
          >
            {copied ? "Copiado ✅" : "Copiar"}
          </CommonButton>
        </div>
      </section>

      {/* Modelos Accordion */}
      <section className="px-8 my-5 py-10 max-w-4xl w-full mx-auto bg-white border-zinc-100 border rounded-xl shadow-lg space-y-4">
        <h2 className="text-2xl font-semibold text-gray-900">Modelos Disponibles</h2>
        {ejemploModelos.map((modelo) => (
          <div key={modelo.id} className="border rounded-xl shadow-sm overflow-hidden w-full">
            <button
              onClick={() => toggleAccordion(modelo.id)}
              className="w-full text-left px-4 py-3 bg-gray-100 hover:bg-gray-200 flex justify-between items-center"
            >
              <span>{modelo.nombre} - {modelo.descripcion}</span>
              <span>{openAccordion === modelo.id ? "▲" : "▼"}</span>
            </button>
            {openAccordion === modelo.id && (
              <div className="px-4 py-3 bg-white space-y-2 text-sm">
                <p><strong>Valor obtenido:</strong> {modelo.valorObtenido}</p>
                <p><strong>Entradas esperadas:</strong> {modelo.entradasEsperadas.join(", ")}</p>
                <pre className="bg-gray-100 p-2 rounded text-xs whitespace-pre-wrap">
                  {modelo.documentacion}
                </pre>
              </div>
            )}
          </div>
        ))}
      </section>
    </div>
  );
}