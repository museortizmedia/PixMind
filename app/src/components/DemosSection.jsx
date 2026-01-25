import React, { useState, useRef } from "react";
import CommonButton from "./CommonButton";
// --- IMPORTAR LOS COMPONENTES DE DEMO ---
import RegistroVehicular from "./examples/RegistroVehicular";
import { useAuth } from "../Contexts/AuthContext";
import StickerRemoverPage from "./examples/StickerRemoverPage";
// import StickerizerDemo from "./demos/StickerizerDemo"; // Ejemplo de otro demo

// --- Definición de las Demos para el carrusel ---
const DEMOS_LIST = [
    {
        id: 'vehicular',
        title: 'Registro Vehicular COL 🚗',
        description: 'Simula un formulario que rellena datos (Placa, Color) automáticamente al subir la foto de un vehículo.',
        service: 'pixmindVehicle',
        component: RegistroVehicular,
        icon: 'i-car',
        color: 'bg-yellow-100',
        borderColor: 'border-yellow-500'
    },
    {
        id: 'stickerify',
        title: 'Stickerify ✨',
        description: 'Quita fondos con AI para crear stikers rápidos',
        service: 'pixmindNoBG',
        component: StickerRemoverPage,
        icon: 'i-cut',
        color: 'bg-green-100',
        borderColor: 'border-green-500'
    },
    /*{
        id: 'infra',
        title: '🚧 Reporte de Baches',
        description: 'Visualiza y reporta defectos viales detectados por el modelo especializado.',
        service: 'pixmindRoads',
        component: () => <div className="p-8 text-center text-gray-500 italic">Demo de Baches aquí...</div>,
        icon: 'i-cone',
        color: 'bg-red-100',
        borderColor: 'border-red-500'
    },*/
];

export default function DemosSection() {
    const { user } = useAuth();
    const [activeDemoId, setActiveDemoId] = useState(null);
    const demosContainerRef = useRef(null);

    // Encuentra la demo activa para renderizar en el modal
    const ActiveDemoComponent = DEMOS_LIST.find(d => d.id === activeDemoId)?.component;

    // Función para desplazamiento suave del carrusel
    const scrollDemos = (direction) => {
        if (demosContainerRef.current) {
            const scrollAmount = demosContainerRef.current.clientWidth / 2;
            demosContainerRef.current.scrollBy({
                left: direction === 'right' ? scrollAmount : -scrollAmount,
                behavior: 'smooth',
            });
        }
    };

    return (
        <section className="px-8 py-10 max-w-6xl w-full mx-auto">
            <h2 className="text-3xl font-bold text-gray-900 mb-6">Demos</h2>
            <p className="mb-8 text-gray-600">Explora cómo las empresas integran los microservicios de PixMind para crear soluciones de usuario final.</p>

            <div className="relative">
                {/* Botones de Desplazamiento */}
                <button
                    onClick={() => scrollDemos('left')}
                    className="absolute left-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hidden md:block"
                    aria-label="Desplazar izquierda"
                >
                    {'<'}
                </button>

                {/* Contenedor del Carrusel/Scroll */}
                <div
                    ref={demosContainerRef}
                    className="flex overflow-x-scroll snap-x snap-mandatory space-x-6 p-4 -m-4 pl-28 hide-scrollbar"
                >
                    {DEMOS_LIST.map((demo) => (
                        <div key={demo.id} className="min-w-[280px] max-w-xs snap-center">
                            <div className={`h-full border-4 ${demo.borderColor} ${demo.color} rounded-xl shadow-lg p-6 flex flex-col justify-between transition-transform hover:scale-[1.02]`}>
                                <div>
                                    <div className="text-3xl mb-3">{demo.title.split(' ')[0]}</div>
                                    <h3 className="text-xl font-semibold text-gray-800 mb-2">{demo.title}</h3>
                                    <p className="text-sm text-gray-600">
                                        {demo.description}
                                    </p>
                                </div>
                                <div className="mt-4 pt-4 border-t border-gray-300">
                                    <span className="text-xs font-mono text-gray-500 block mb-2">Endpoint: **{demo.service}**</span>
                                    <CommonButton
                                        onClick={() => setActiveDemoId(demo.id)}
                                        variant="primary"
                                        size="sm"
                                        className="w-full"
                                    >
                                        Ver Demo
                                    </CommonButton>
                                </div>
                            </div>
                        </div>
                    ))}

                </div>

                <button
                    onClick={() => scrollDemos('right')}
                    className="absolute right-0 top-1/2 transform -translate-y-1/2 z-10 bg-white p-3 rounded-full shadow-lg hover:shadow-xl transition-all hidden md:block"
                    aria-label="Desplazar derecha"
                >
                    {'>'}
                </button>

                {/* Estilo para ocultar la barra de desplazamiento en el carrusel */}
                <style jsx global>{`
                    .hide-scrollbar::-webkit-scrollbar {
                        display: none;
                    }
                    .hide-scrollbar {
                        -ms-overflow-style: none; /* IE and Edge */
                        scrollbar-width: none; /* Firefox */
                    }
                `}</style>
            </div>

            {/* Modal para la Demo Activa */}
            {activeDemoId && (
                <div className="fixed inset-0 z-50 bg-black bg-opacity-75 flex items-center justify-center p-4">
                    <div className="bg-white rounded-lg shadow-2xl w-full max-w-6xl h-[95vh] overflow-hidden flex flex-col">

                        <header className="p-4 border-b border-gray-200 flex justify-between items-center bg-white relative z-10">
                            <h3 className="text-xl font-bold text-gray-800">
                                {DEMOS_LIST.find(d => d.id === activeDemoId)?.title}
                            </h3>
                            <button
                                onClick={() => setActiveDemoId(null)}
                                className="text-gray-500 hover:text-gray-900 text-3xl font-light"
                                aria-label="Cerrar Demo"
                            >
                                &times;
                            </button>
                        </header>

                        <div className="bg-amber-50 border-b border-amber-200 py-2 px-4 text-center">
                            <p className="text-xs text-amber-800 font-medium italic">
                                💡 Nota: Los microservicios de IA están actualmente inactivos por mantenimiento de costos. Si deseas una demostración funcional, por favor contacta a soporte.
                            </p>
                        </div>

                        <div className="flex-1 overflow-y-auto">
                            {ActiveDemoComponent && <ActiveDemoComponent userApiKey={user.user.apiKey} />}
                        </div>
                    </div>
                </div>
            )}
        </section>
    );
}