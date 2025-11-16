import React from "react";

export default function Home() {
  return (
    <section className="px-8 py-20 text-center max-w-3xl mx-auto">
      <h1 className="text-5xl font-bold text-gray-900">
        Centro Universal de Visión por Computadora
      </h1>

      <p className="mt-6 text-lg text-gray-700">
        PixMind te permite acceder a múltiples modelos de visión por computadora
        desde un solo lugar. Regístrate, obtén tu token y comienza a usar
        nuestros microservicios.
      </p>

      <div className="mt-8 flex justify-center gap-4">
        <a
          href="/register"
          className="px-6 py-3 bg-blue-600 text-white rounded-xl shadow hover:bg-blue-700"
        >
          Comenzar
        </a>

        <a
          href="/login"
          className="px-6 py-3 bg-gray-200 rounded-xl shadow hover:bg-gray-300"
        >
          Ingresar
        </a>
      </div>
    </section>
  );
}
