import React from 'react';

const MVPNotice = ({ className = "" }) => {
    return (
        <div className={`bg-amber-50 border border-amber-200 rounded-2xl p-6 text-amber-900 shadow-sm ${className}`}>
            <div className="flex items-start gap-4">
                <div className="text-2xl flex-shrink-0">⚠️</div>
                <div>
                    <h4 className="font-bold mb-1 text-lg">Estado del Servicio (MVP)</h4>
                    <p className="text-sm leading-relaxed opacity-90">
                        Actualmente PixMind se encuentra en fase de Minimal Viable Product. Los microservicios de IA requieren infraestructura GPU de alto rendimiento que se activa exclusivamente bajo demanda para demostraciones controladas.
                    </p>
                    <div className="mt-4 flex flex-wrap items-center gap-4">
                        <div className="flex items-center gap-2">
                            <span className="text-xs font-bold uppercase tracking-wider bg-amber-200/50 px-2 py-0.5 rounded text-amber-800">Inversión:</span>
                            <div
                                className="text-sm font-mono cursor-pointer hover:text-amber-700 underline"
                                onClick={() => {
                                    navigator.clipboard.writeText("museortiz@gmail.com");
                                    alert("Email copiado");
                                }}
                            >
                                museortiz@gmail.com
                            </div>
                        </div>
                        <a href="https://wa.me/573197293775" target="_blank" className="text-sm underline font-bold hover:text-amber-700 transition-colors">
                            WhatsApp Directo
                        </a>
                    </div>
                </div>
            </div>
        </div>
    );
};

export default MVPNotice;
