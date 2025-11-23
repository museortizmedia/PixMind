import React, { useEffect, useState, useRef } from "react";
import { useAuth } from "../../Contexts/AuthContext";
import CommonButton from "../../components/CommonButton";
import EndpointTester from "../EndpointTester/EndpointTester";

export default function Dashboard() {
  const { user } = useAuth();
  const [copied, setCopied] = useState(false);
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

  useEffect(() => {
    document.title = "Inicio";
  }, []);

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
      
      <section>
        <EndpointTester/>
      </section>
    </div>
  );
}