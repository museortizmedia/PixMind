// docs.jsx
import React from "react";
import { SERVICE_REGISTRY } from "@shared/MICROSERVICES.js";

export default function DocsPage() { 
  return (
    <div style={{ display: "flex", height: "100vh" }}>
      
      {/* SIDEBAR */}
      <aside style={{ width: 250, borderRight: "1px solid #ddd", padding: 20 }}>
        <h3>Servicios</h3>
        <ul>
          {Object.keys(SERVICE_REGISTRY).map(s => (
            <li key={s}>
              <a href={`#${s}`}>{s}</a>
            </li>
          ))}
        </ul>
      </aside>

      {/* CONTENIDO */}
      <main style={{ flex: 1, padding: 40 }}>
        <h1>Documentación de Microservicios</h1>
        <p>Esta documentación se genera automáticamente desde <code>SERVICE_REGISTRY</code>.</p>

        {Object.entries(SERVICE_REGISTRY).map(([name, service]) => (
          <section id={name} key={name} style={{ marginBottom: 60 }}>
            <h2>{name}</h2>
            <p>{service.description}</p>

            <h4>Endpoint:</h4>
            <code>{service.endpoint}</code>

            <h4>Campos:</h4>
            <ul>
              {Object.entries(service.fields).map(([key, rule]) => (
                <li key={key}>
                  <b>{key}</b> — {rule.type} {rule.required ? "(required)" : ""}
                </li>
              ))}
            </ul>

            <h4>Ejemplo de request:</h4>
            <pre>
{`POST /api/${name}
Content-Type: multipart/form-data
image: archivo
${Object.keys(service.fields)
  .filter(f => f !== "image")
  .map(f => f + ": valor")
  .join("\n")}
`}
            </pre>
          </section>
        ))}
      </main>
    </div>
  );
}