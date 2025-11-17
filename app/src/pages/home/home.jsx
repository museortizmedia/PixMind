import React from "react";

export default function Home() {
  return (
    <div className="flex flex-col min-h-screen bg-white">

      {/* Hero Section */}
      <section className="flex flex-col-reverse md:flex-row items-center px-8 py-20 max-w-6xl mx-auto">
        <div className="md:w-1/2 text-center md:text-left">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] !text-transparent bg-clip-text">
            PixMind
          </h1>

          <p className="mt-6 text-lg text-gray-700">
            PixMind es un hub unificado de servicios de visión por computadora, diseñado para que desarrolladores y empresas integren capacidades avanzadas de procesamiento de imágenes sin necesidad de desplegar ni mantener modelos por separado.
          </p>
          <div className="mt-8 flex justify-center md:justify-start gap-4">
            <a
              href="/register"
              className="px-6 py-3 bg-[#4DE1E1] text-white rounded-xl shadow hover:bg-[#38caca] transition"
            >
              Comenzar
            </a>
            <a
              href="/login"
              className="px-6 py-3 bg-[#FF96DC] text-white rounded-xl shadow hover:bg-[#e68fc5] transition"
            >
              Ingresar
            </a>
          </div>
        </div>

        <div className="md:w-1/2 flex justify-center mb-10 md:mb-0">
          {/* Imagen temporal */}
          <div className="w-80 h-80 bg-gray-200 rounded-xl flex items-center justify-center text-gray-400">
            Imagen
          </div>
        </div>
      </section>

      {/* Features Section */}
      <section className="px-8 py-20 bg-white max-w-6xl mx-auto">
        <h2 className="text-3xl font-bold text-gray-900 text-center">
          ¿Por qué usar PixMind?
        </h2>
        <p className="mt-4 text-gray-700 text-center mx-auto">
          A través de una única API, PixMind ofrece acceso a múltiples modelos especializados —como clasificación de vehículos, segmentación, detección de objetos, mejora de calidad y más— todos desplegados como microservicios independientes y optimizados.
        </p>

        <div className="mt-12 grid md:grid-cols-2 gap-8">
          {[
            {
              number: 1,
              color: "#4DE1E1",
              title: "Centralización",
              description: "Centraliza la gestión y acceso a modelos de visión por computadora en un solo lugar.",
            },
            {
              number: 2,
              color: "#FF96DC",
              title: "Control de Consumo",
              description: "Ofrece tokens personales para gestionar y controlar el consumo de los microservicios.",
            },
            {
              number: 3,
              color: "#4DE1E1",
              title: "Interfaz Intuitiva",
              description: "Proporciona una interfaz web amigable con ejemplos, guías y documentación completa.",
            },
            {
              number: 4,
              color: "#FF96DC",
              title: "Escalabilidad",
              description: "Escala cada microservicio de forma independiente según la demanda de tus aplicaciones.",
            },
          ].map((feature) => (
            <div
              key={feature.number}
              className="p-6 border rounded-xl shadow hover:shadow-lg transition flex flex-col items-center text-center"
            >
              <div
                className="w-16 h-16 rounded-full flex items-center justify-center text-white font-bold text-lg"
                style={{ backgroundColor: feature.color }}
              >
                {feature.number}
              </div>
              <h3 className="mt-4 text-xl font-semibold text-gray-900">{feature.title}</h3>
              <p className="mt-2 text-gray-700">{feature.description}</p>
            </div>
          ))}
        </div>
      </section>

      {/* Call to Action Section */}
      <section className="relative px-8 py-20 text-white text-center">
        {/* Imagen de fondo */}
        <div
          className="absolute inset-0 bg-gray-300 bg-cover bg-center"
          style={{ backgroundImage: "url('https://via.placeholder.com/1600x600')" }}
        ></div>

        {/* Gradiente diagonal encima */}
        <div className="absolute inset-0 bg-gradient-to-br from-[#4DE1E1]/80 to-[#FF96DC]/80"></div>

        {/* Contenido */}
        <div className="relative z-10 max-w-3xl mx-auto">
          <h2 className="text-3xl md:text-4xl font-bold">
            Incorpora visión por computadora en tus proyectos
          </h2>
          <p className="mt-4">
            Con PixMind puedes añadir inteligencia visual de manera rápida, modular y eficiente, sin preocuparte por la infraestructura.
          </p>
          <a
            href="/register"
            className="mt-8 inline-block px-8 py-4 bg-white text-[#4DE1E1] rounded-xl font-semibold shadow hover:bg-gray-100 transition"
          >
            Comenzar ahora
          </a>
        </div>
      </section>

      {/* Footer */}
      <footer className="px-8 py-6 bg-white text-center text-gray-700">
        &copy; {new Date().getFullYear()} PixMind. Todos los derechos reservados.
      </footer>
    </div>
  );
}
