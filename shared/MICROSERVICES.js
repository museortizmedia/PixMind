/**
 * SERVICIOS PERMITIDOS + ENDPOINTS
 * --------------------------------
 * Esta tabla será usada tanto para validaciones
 * como para generar documentación en docs.jsx.
 */
export const SERVICE_REGISTRY = {
  pixmindVehicle: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindVehicle",
    description: "Se usa para mostrar detalles de vehículos. Lee placas, muestra el color aproximado, soporte multivehículo.",
    fields: {
      imagen: { type: "file", required: true },
    },
    docs: {
      worker: "pixmindVehicle",
      headers: [
        { key: "x-api-key", value: "your_api_key", required: true }
      ],
      fields: [
        { label: "image", desc: "Una imagen que contiene algún vehículo", required: true }
      ],
      response: {
        "detalles": {
          color_hex: "string (#A3C4F1)",
          confianza_vehiculo: "number (0–1)",
          placa: {
            "null | object ": {
              confianza: "number (0–1)",
              texto: "string"
            }
          },
          posicion: "[x1, y1, x2, y2]",
          tipo: "string (Bicycle | Car | Motorcycle | Bus | Truck)"
        },
        "meta": { "alto": "number", "ancho": "number" },
        "total_vehiculos": "number",
        "vehiculos_con_placa_leida": "number"
      }
    }
  },
  pixmindNoBG: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindNoBG",
    description: "Remueve fondos usando AI",
    fields: {
      imagen: { type: "file", required: true }
    },
    docs: {
      worker: "pixmindNoBG",
      headers: [
        { key: "x-api-key", value: "your_api_key", required: true }
      ],
      fields: [
        { label: "image", desc: "Una imagen que contiene un fondo para quitar", required: true }
      ],
      response: {
        "ok": "true",
        "service": "pixmindNoBG",
        "result": "(imagen base64)",
        "mimeType": "image/png"
      }
    }
  },
  pixmindArt: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindArt",
    description: "Transforma una foto en una obra de un artista famoso",
    fields: {
      contenido: { type: "file", required: true },
      estilo: { type: "file", required: true }
    },
    docs: {
      worker: "pixmindArt",
      headers: [
        { key: "x-api-key", value: "your_api_key", required: true }
      ],
      fields: [
        { label: "image", desc: "La imagen que será transformada", required: true },
        { label: "extraImages", desc: "La imagen para copiar el estilo", required: true }
      ],
      response: {
        "ok": "true",
        "service": "pixmindArt",
        "result": "(imagen base64)",
        "mimeType": "image/png"
      }
    }
  },
  pixmindRoads: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindRoads",
    description: "Detecta y clasifica baches en la vía",
    fields: {
      imagen: { type: "file", required: true }
    },
    docs: {
      worker: "pixmindRoads",
      headers: [
        { key: "x-api-key", value: "your_api_key", required: true }
      ],
      fields: [
        { label: "image", desc: "Imagen con huecos para analizar", required: true },
      ],
      response: {
        "detalles": [
          {
            "confianza": 0.9,
            "coordenadas_imagen": [28.0, 213.0, 401.7, 493.5],
            "gravedad": "ALTA",
            "tipo": "bache"
          }
        ],
        "estado_via": "NORMAL",
        "total_incidentes": 1
      }
    }
  },
  pixmindNoParking: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindNoParking",
    description: "Detecta si hay un vehículo en una zona prohibida",
    fields: {
      imagen: { type: "file", required: true },
      zona: { type: "string", required: true },
    },
    docs: {
      worker: "pixmindNoParking",
      headers: [
        { key: "x-api-key", value: "your_api_key", required: true }
      ],
      fields: [
        { label: "image", desc: "Imagen a analizar" },
        { label: "zona", desc: "[x1,y1,x2,y2] coordenadas prohibidas", required: true },
      ],
      response: {
        "detalles": [
          {
            "alerta": "VEHICULO EN ZONA PROHIBIDA",
            "confianza": 0.74,
            "vehiculo": "bicycle"
          }
        ],
        "hay_infraccion": true,
        "success": true
      }
    }
  }
};