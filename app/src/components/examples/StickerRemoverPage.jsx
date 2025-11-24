import React, { useState } from "react";

export default function StickerRemoverPage({userApiKey}) {
  const [imagenSeleccionada, setImagenSeleccionada] = useState(null);
  const [resultado, setResultado] = useState(null);
  const [cargando, setCargando] = useState(false);
  const [error, setError] = useState(null);

  const manejarSeleccionArchivo = (e) => {
    setImagenSeleccionada(e.target.files[0]);
    setResultado(null);
    setError(null);
  };

  const manejarProcesar = async () => {
    if (!imagenSeleccionada) return;

    setCargando(true);
    setError(null);

    const formData = new FormData();
    formData.append("image", imagenSeleccionada);

    try {
      const response = await fetch("https://pixmind.onrender.com/model/pixmindNoBG", {
        method: "POST",
        headers: {
          "x-api-key": userApiKey,
        },
        body: formData,
      });

      const data = await response.json();

      if (!data.ok) {
        throw new Error("Error al procesar imagen");
      }

      setResultado(data.result);
    } catch (err) {
      setError(err.message);
    } finally {
      setCargando(false);
    }
  };

  return (
    <div className="min-h-screen bg-green-50 flex flex-col items-center p-6 text-green-900">
      <h1 className="text-4xl font-bold text-green-700 mb-4">Stickerify ✨</h1>
      <p className="text-lg mb-8 text-green-800">Convierte tus fotos en stickers removiendo el fondo automáticamente</p>

      <div className="bg-white shadow-lg rounded-2xl p-6 w-full max-w-xl border border-green-200">
        <label className="block mb-4 text-green-700 font-semibold">Sube tu imagen:</label>
        <input
          type="file"
          accept="image/*"
          onChange={manejarSeleccionArchivo}
          className="mb-6 w-full border border-green-300 p-2 rounded-lg bg-green-50 text-green-900"
        />

        <button
          onClick={manejarProcesar}
          disabled={cargando || !imagenSeleccionada}
          className="w-full bg-green-600 hover:bg-green-700 text-white font-bold py-3 rounded-xl transition duration-200 disabled:bg-green-300"
        >
          {cargando ? "Procesando..." : "Quitar Fondo"}
        </button>

        {error && (
          <p className="text-red-600 font-semibold mt-4">{error}</p>
        )}

        {resultado && (
          <div className="mt-6 text-center">
            <h2 className="text-xl font-semibold mb-3 text-green-700">Sticker generado</h2>
            <img
              src={`data:image/png;base64,${resultado}`}
              alt="Imagen procesada"
              className="mx-auto rounded-xl shadow-md bg-white"
            />

            <a
              href={`data:image/png;base64,${resultado}`}
              download="sticker.png"
              className="inline-block mt-4 bg-green-700 text-white px-5 py-2 rounded-xl hover:bg-green-800 transition"
            >
              Descargar Sticker
            </a>
          </div>
        )}
      </div>
    </div>
  );
}