import React from "react";
import CommonButton from "./CommonButton";

export default function ProjectStatus() {
    return (
        <section id="roadmap" className="bg-gradient-to-r from-[#4DE1E1]/10 to-[#FF96DC]/10 border-y border-[#4DE1E1]/20 py-16 px-8">
            <div className="max-w-4xl mx-auto text-center">
                <div className="inline-block px-4 py-1 rounded-full bg-amber-100 text-amber-700 text-sm font-bold mb-6 tracking-wide uppercase shadow-sm">
                    Estado del Proyecto: MVP
                </div>

                <h2 className="text-3xl md:text-5xl font-bold text-gray-900 mb-8 leading-tight">
                    Un Hub de Visión IA <br className="hidden md:block" />
                    <span className="bg-gradient-to-r from-[#4DE1E1] to-[#FF96DC] text-transparent bg-clip-text">
                        en plena evolución
                    </span>
                </h2>

                <div className="text-lg text-gray-700 leading-relaxed mb-10 space-y-4">
                    <p>
                        PixMind es actualmente una prueba de concepto tecnológica de alto nivel.
                        Nuestra arquitectura, interfaces y sistema de gestión de microservicios están 100% operativos.
                    </p>
                    <p className="font-medium">
                        Sin embargo, debido a los altos costos de infraestructura GPU requeridos para la inferencia de modelos en tiempo real,
                        los modelos de IA no están desplegados de forma permanente en este MVP.
                    </p>
                </div>

                <div className="grid md:grid-cols-2 gap-6 mb-12">
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-[#4DE1E1]/20 text-left hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#4DE1E1]/20 rounded-lg flex items-center justify-center mb-4 text-[#4DE1E1]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M19 11H5m14 0a2 2 0 012 2v6a2 2 0 01-2 2H5a2 2 0 01-2-2v-6a2 2 0 012-2m14 0V9a2 2 0 00-2-2M5 11V9a2 2 0 012-2m0 0V5a2 2 0 012-2h6a2 2 0 012 2v2M7 7h10" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">Arquitectura Lista</h3>
                        <p className="text-gray-600">
                            API unificada, autenticación por tokens y dashboard de gestión listos para integración comercial.
                        </p>
                    </div>
                    <div className="bg-white/80 backdrop-blur-sm p-8 rounded-2xl shadow-sm border border-[#FF96DC]/20 text-left hover:shadow-md transition-shadow">
                        <div className="w-12 h-12 bg-[#FF96DC]/20 rounded-lg flex items-center justify-center mb-4 text-[#FF96DC]">
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-6 w-6" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M9.663 17h4.673M12 3v1m6.364 1.636l-.707.707M21 12h-1M4 12H3m3.343-5.657l-.707-.707m2.828 9.9a5 5 0 117.072 0l-.548.547A3.374 3.374 0 0012 18.75c-1.03 0-1.94-.401-2.592-1.053l-.548-.547z" />
                            </svg>
                        </div>
                        <h3 className="font-bold text-xl text-gray-900 mb-2">Modelos Validados</h3>
                        <p className="text-gray-600">
                            Detección de vehículos, segmentación y OCR probados y listos para ser escalados a producción.
                        </p>
                    </div>
                </div>

                <div className="bg-gray-900 rounded-[2.5rem] p-10 md:p-14 text-white relative overflow-hidden ring-1 ring-white/10 shadow-2xl">
                    <div className="absolute top-0 right-0 w-64 h-64 bg-[#4DE1E1]/20 rounded-full -mr-32 -mt-32 blur-[80px]"></div>
                    <div className="absolute bottom-0 left-0 w-64 h-64 bg-[#FF96DC]/20 rounded-full -ml-32 -mb-32 blur-[80px]"></div>

                    <h3 className="text-3xl font-bold mb-6 relative z-10">
                        ¡Es tu oportunidad!
                    </h3>
                    <p className="text-gray-400 text-lg mb-6 max-w-2xl mx-auto relative z-10">
                        Estamos buscando socios estratégicos e inversión para escalar nuestra infraestructura de GPU y lanzar oficialmente PixMind. Todo aporte cuenta, sea una pequeña donación o un capital semilla.
                    </p>
                    <p className="text-gray-300 font-bold text-lg mb-6 max-w-2xl mx-auto relative z-10">
                        ¡Tú puedes ser parte del nacimiento de PixMind!
                    </p>

                    <div className="mb-10 relative z-10 flex flex-col items-center">
                        <span className="text-xs text-gray-500 uppercase tracking-widest mb-2 font-semibold">Contacto Directo</span>
                        <div
                            className="bg-white/5 border border-white/10 rounded-xl px-4 py-2 cursor-pointer hover:bg-white/10 transition-colors group flex items-center gap-3"
                            onClick={() => {
                                navigator.clipboard.writeText("museortiz@gmail.com");
                                alert("Email copiado al portapapeles");
                            }}
                        >
                            <span className="text-[#4DE1E1] font-mono">museortiz@gmail.com</span>
                            <svg xmlns="http://www.w3.org/2000/svg" className="h-4 w-4 text-gray-500 group-hover:text-white" fill="none" viewBox="0 0 24 24" stroke="currentColor">
                                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M8 7v8a2 2 0 002 2h6M8 7V5a2 2 0 012-2h4.586a1 1 0 01.707.293l4.414 4.414a1 1 0 01.293.707V15a2 2 0 01-2 2h-2M8 7H6a2 2 0 00-2 2v10a2 2 0 002 2h8a2 2 0 002-2v-2" />
                            </svg>
                        </div>
                    </div>

                    <div className="flex flex-col sm:flex-row justify-center gap-4 relative z-10">
                        <CommonButton
                            as="a"
                            href="https://wa.me/573197293775"
                            target="_blank"
                            variant="primary"
                            size="lg"
                            className="font-bold px-10"
                        >
                            Chatea conmigo por WhatsApp
                        </CommonButton>
                        <CommonButton
                            as="a"
                            href="mailto:museortiz@gmail.com"
                            variant="contrastA"
                            size="lg"
                            className="font-bold px-10 border border-white/20 bg-slate-800 text-white hover:bg-white hover:text-gray-900"
                        >
                            Enviar un email
                        </CommonButton>
                    </div>
                </div>
            </div>
        </section>
    );
}
