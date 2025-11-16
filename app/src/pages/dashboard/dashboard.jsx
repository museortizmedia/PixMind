import React from "react";

export default function Dashboard() {
  return (
    <div className="max-w-3xl mx-auto mt-16 bg-white p-10 rounded-xl shadow">
      <h2 className="text-4xl font-semibold">Tu Panel</h2>

      <p className="mt-4 text-gray-700">
        Aquí podrás ver tu token, uso de la API y ejemplos.
      </p>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Tu token:</h3>

        <p className="bg-gray-100 p-3 rounded-lg mt-2 font-mono">
          pk_live_TOKEN_DE_EJEMPLO_123
        </p>
      </div>

      <div className="mt-8">
        <h3 className="text-xl font-semibold">Ejemplo de uso:</h3>

        <pre className="bg-gray-100 p-4 rounded-lg mt-3 text-sm overflow-auto">
POST /api/vehicles/classify
Header: Authorization: Bearer TU_TOKEN
Body: imagen del vehículo
        </pre>
      </div>
    </div>
  );
}