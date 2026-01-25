import React, { useState, useMemo } from "react";
import { SERVICE_REGISTRY } from "@shared/MICROSERVICES.js";

export default function DocsPage() {
  const [query, setQuery] = useState("");
  const [selected, setSelected] = useState(null);

  // ... (Toda tu función prettyJSON se mantiene igual) ...
  const prettyJSON = (obj) => {
    let json = JSON.stringify(obj, null, 2);
    json = json.replace(/\[/g, "§OPB§").replace(/\]/g, "§CLB§").replace(/\{/g, "§OPC§").replace(/\}/g, "§CLC§");
    json = json.replace(/"([^"]+)"\s*:/g, '<span class="text-[#51dcee]">"$1"</span>:');
    json = json.replace(/:\s*"([^"]*)"/g, ': <span class="text-[#f8b052]">"$1"</span>');
    json = json.replace(/:\s*([0-9]+(?:\.[0-9]+)?)/g, ': <span class="text-[#58ce48]">$1</span>');
    json = json.replace(/\bnull\b/g, '<span class="text-pink-400">null</span>');
    json = json.replace(/\(([^)]+)\)/g, '<span class="text-white/70">($1)</span>');
    json = json.replace(/§OPB§/g, '<span class="text-red-400">[</span>').replace(/§CLB§/g, '<span class="text-red-400">]</span>').replace(/§OPC§/g, '<span class="text-yellow-400">{</span>').replace(/§CLC§/g, '<span class="text-yellow-400">}</span>');
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
    const endpoint = service.docs?.worker ? `${import.meta.env.VITE_API_URL || ""}/model/${service.docs.worker}` : service.endpoint;
    const fieldKeys = Object.keys(service.fields);

    return (
      <div key={name} className="mb-10 p-6 rounded-2xl shadow bg-white border border-gray-200">
        <h2 className="text-2xl font-bold text-gray-700 mb-2">{name}</h2>
        <p className="text-sm text-gray-600 mb-4">{service.description}</p>

        <div className="mb-6 mt-8">
          <h3 className="text-lg font-semibold text-gray-700">Endpoint</h3>
          <code className="block bg-slate-100 border border-slate-200 px-3 py-2 rounded mt-1 text-sm text-slate-700 font-mono">
            {endpoint}
          </code>
        </div>

        {/* --- NUEVA TABLA DE HEADERS --- */}
        {service.docs?.headers && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Headers</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Key
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Value / Description
                    </th>
                    <th scope="col" className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase tracking-wider">
                      Required
                    </th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {service.docs.headers.map((h, idx) => (
                    <tr key={idx}>
                      <td className="px-4 py-3 whitespace-nowrap text-sm font-medium text-purple-600 font-mono">
                        {h.key}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500 font-mono">
                        {h.value}
                      </td>
                      <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                        {h.required ? (
                          <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                            Yes
                          </span>
                        ) : "No"}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* CAMPOS (FIELDS) */}
        {service.docs?.fields && (
          <div className="mb-6">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Body Fields (Multipart)</h3>
            <div className="overflow-hidden border border-gray-200 rounded-lg">
              <table className="min-w-full divide-y divide-gray-200">
                <thead className="bg-gray-50">
                  <tr>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Field</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Type</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Description</th>
                    <th className="px-4 py-3 text-center text-xs font-bold text-gray-500 uppercase">Required</th>
                  </tr>
                </thead>
                <tbody className="bg-white divide-y divide-gray-200">
                  {service.docs.fields.map((f, idx) => {
                    const realKey = fieldKeys[idx] || "unknown";
                    const realField = service.fields[realKey];
                    return (
                      <tr key={idx}>
                        <td className="px-4 py-3 text-sm font-medium text-blue-600 font-mono">{f.label}</td>
                        <td className="px-4 py-3 text-sm text-gray-500 font-mono">&lt;{realField?.type}&gt;</td>
                        <td className="px-4 py-3 text-sm text-gray-600">{f.desc}</td>
                        <td className="px-4 py-3 whitespace-nowrap text-sm text-gray-500">
                          {f.required ? (
                            <span className="px-2 inline-flex text-xs leading-5 font-semibold rounded-full bg-green-100 text-green-800">
                              Yes
                            </span>
                          ) : "No"}
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </div>
        )}

        {/* EJEMPLO REQUEST (Actualizado con Headers) */}
        <div className="mb-6">
          <h3 className="text-lg font-semibold text-gray-700 mb-1">Ejemplo de request</h3>
          <pre className="bg-[#1e1e1e] text-green-300 p-4 rounded-lg text-sm overflow-auto font-mono leading-relaxed shadow-inner">
            {`POST ${endpoint}
Content-Type: multipart/form-data
${service.docs?.headers?.map(h => `${h.key}: ${h.value}`).join('\n') || ''}

${service.docs?.fields
                .map((f, idx) => {
                  const realKey = fieldKeys[idx];
                  const fieldType = service.fields[realKey]?.type || "unknown";
                  return `${f.label}: <${fieldType}>`;
                })
                .join("\n")}
`}
          </pre>
        </div>

        {/* RESPUESTA ESPERADA */}
        {service.docs?.response && (
          <div className="mt-4">
            <h3 className="text-lg font-semibold text-gray-700 mb-2">Respuesta esperada</h3>
            <pre
              className="bg-[#1e1e1e] text-gray-200 p-4 rounded-lg text-sm overflow-auto font-mono shadow-inner border border-gray-700"
              dangerouslySetInnerHTML={{ __html: prettyJSON(service.docs.response) }}
            />
          </div>
        )}
      </div>
    );
  };

  return (
    <div className="w-full h-screen flex overflow-hidden bg-gray-50">
      <aside className="w-72 border-r bg-white shadow-sm p-5 flex flex-col">
        <h2 className="text-xl font-bold text-gray-700 mb-4">Servicios</h2>
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
                className={`w-full text-center px-3 py-2 rounded-lg hover:bg-blue-50 transition-colors ${selected === name ? "bg-blue-100 text-blue-700 font-medium" : "text-gray-600"
                  }`}
                onClick={() => setSelected(name)}
              >
                {name}
              </button>
            </li>
          ))}
        </ul>
      </aside>

      <main className="flex-1 overflow-auto p-10">
        <h1 className="text-3xl font-bold text-gray-800 mb-2">Documentación API</h1>
        <p className="text-gray-600 mb-8 border-b pb-4">
          Definición técnica de endpoints, headers y estructuras de datos.
        </p>

        <div className="bg-amber-50 border border-amber-200 rounded-xl p-4 mb-8 text-sm text-amber-800 flex items-center gap-3">
          <span className="text-lg">⚠️</span>
          <p>
            <strong>Modo MVP:</strong> Los microservicios de IA no están desplegados permanentemente debido a costos de infraestructura.
            Las peticiones a estos endpoints podrían no responder en tiempo real. Para una demo activa, contacta a inversión.
          </p>
        </div>
        {selected
          ? renderService(selected)
          : filtered.map(name => renderService(name))}
      </main>
    </div>
  );
}