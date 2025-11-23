import React, { useState, useMemo } from "react";
import { SERVICE_REGISTRY } from "@shared/MICROSERVICES.js";

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

const prettyJSON = (obj) => {
  let json = JSON.stringify(obj, null, 2);

  // 🔒 Placeholders para evitar romper spans
  json = json
    .replace(/\[/g, "§OPB§")
    .replace(/\]/g, "§CLB§")
    .replace(/\{/g, "§OPC§")
    .replace(/\}/g, "§CLC§");

  // 1️⃣ Keys en azul — se procesan primero
  json = json.replace(
    /"([^"]+)"\s*:/g,
    '<span class="text-[#51dcee]">"$1"</span>:'
  );

  // 2️⃣ Strings (solo valores, NO keys)
  json = json.replace(
    /:\s*"([^"]*)"/g,
    ': <span class="text-[#f8b052]">"$1"</span>'
  );

  // 3️⃣ number (verde)
  json = json.replace(
    /:\s*([0-9]+(?:\.[0-9]+)?)/g,
    ': <span class="text-[#58ce48]">$1</span>'
  );

  // 4️⃣ null (rosa)
  json = json.replace(/\bnull\b/g, '<span class="text-pink-400">null</span>');

  // 5️⃣ explicaciones entre paréntesis
  json = json.replace(
    /\(([^)]+)\)/g,
    '<span class="text-white/70">($1)</span>'
  );

  // 6️⃣ Restaurar corchetes y llaves con color
  json = json
    .replace(/§OPB§/g, '<span class="text-red-400">[</span>')
    .replace(/§CLB§/g, '<span class="text-red-400">]</span>')
    .replace(/§OPC§/g, '<span class="text-yellow-400">{</span>')
    .replace(/§CLC§/g, '<span class="text-yellow-400">}</span>');

  return json;
};

  const filtered = useMemo(() => {
    if (!query.trim()) return Object.keys(SERVICE_REGISTRY);
    return Object.keys(SERVICE_REGISTRY).filter(key =>
      key.toLowerCase().includes(query.toLowerCase()) ||
      SERVICE_REGISTRY[key].description.toLowerCase().includes(query.toLowerCase())
    );
  }, [query]);

  const renderService = (name) => {
    const service = SERVICE_REGISTRY[name];
    const endpoint = service.docs?.worker
      ? `https://pixmind.onrender.com/model/${service.docs.worker}`
      : service.endpoint;

    const fieldKeys = Object.keys(service.fields);

    return (
      <div key={name} className="mb-10 p-6 rounded-2xl shadow bg-white border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{name}</h2>
        <p className="text-gray-600 mb-4">{service.description}</p>

        <div className="mb-4">
          <h3 className="text-lg font-semibold text-gray-700">Endpoint</h3>
          <code className="block bg-gray-100 px-3 py-2 rounded mt-1 text-sm">{endpoint}</code>
        </div>

        {/* CAMPOS */}
        {service.docs?.fields && (
          <div className="mb-4">
            <h3 className="text-lg font-semibold text-gray-700">Campos</h3>
            <ul className="mt-1 space-y-2">
              {service.docs.fields.map((f, idx) => {
                const realKey = fieldKeys[idx];          // <-- clave real por posición
                const realField = service.fields[realKey];

                return (
                  <li key={f.label} className="text-sm">
                    <b>{f.label}</b> — &lt;{realField?.type}&gt;
                    {realField?.required ? " (required)" : ""}
                    <div className="text-gray-500 text-xs ml-2">{f.desc}</div>
                  </li>
                );
              })}
            </ul>
          </div>
        )}

        {/* EJEMPLO REQUEST */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Ejemplo de request</h3>
          <pre className="bg-gray-900 text-green-300 p-4 rounded text-sm overflow-auto">{`POST ${endpoint}
Content-Type: multipart/form-data

${service.docs?.fields
              .map((f, idx) => {
                const realKey = fieldKeys[idx];
                const fieldType = service.fields[realKey]?.type || "unknown";
                return `${f.label}: <${fieldType}>`;
              })
              .join("\n")}
`}</pre>
        </div>

        {/* RESPUESTA ESPERADA */}
        {service.docs?.response && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Respuesta esperada</h3>
            <pre
              className="bg-[#242323] text-gray-200 p-4 rounded text-sm overflow-auto"
              dangerouslySetInnerHTML={{ __html: prettyJSON(service.docs.response) }}
            />
          </div>
        )}

      </div>
    );
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-gray-50">

      {/* SIDEBAR */}
      <aside className="w-72 border-r bg-white shadow-sm p-5 flex flex-col">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Servicios</h2>

        {/* Search */}
        <input
          type="text"
          className="w-full px-3 py-2 rounded-lg border border-gray-300 focus:outline-none focus:ring-2 focus:ring-blue-500 mb-4"
          placeholder="Buscar servicio..."
          value={query}
          onChange={(e) => setQuery(e.target.value)}
        />

        <ul className="flex-1 overflow-auto space-y-2">
          {filtered.map(name => (
            <li key={name}>
              <button
                className={`w-full text-left px-3 py-2 rounded-lg hover:bg-blue-100 transition ${selected === name ? "bg-blue-200" : ""
                  }`}
                onClick={() => setSelected(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      {/* MAIN CONTENT */}
      <main className="flex-1 overflow-auto p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-6">Documentación de Microservicios</h1>
        <p className="text-gray-600 mb-8">
          Esta documentación se genera automáticamente.
        </p>

        {/* If selecting item show only that */}
        {selected
          ? renderService(selected)
          : filtered.map(name => renderService(name))}
      </main>
    </div>
  );
}
