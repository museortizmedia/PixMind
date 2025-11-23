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
      fields: [
        { label: "image", desc: "Una imagen que contiene algún vehículo" }
      ],
      response: {
        "detalles": {
          color_hex: "string (hexadecimal del color detectado, ej: #A3C4F1)",
          confianza_vehiculo: "number (0–1, confianza del modelo)",
          placa: {
            "null (si no encuentra placa) | object ": {
              confianza: "number (0–1, confianza del modelo)",
              texto: "string A..Z-0..9 (caracteres de A a la Z y 0 al 9)"
            }
          },
          posicion: "[x1: number, y1: number, x2: number, y2: number]",
          tipo: "string (uno de: Bicycle | Car | Motorcycle | Bus | Truck)"
        },
        "meta": {
          "alto": "number",
          "ancho": "number"
        },
        "total_vehiculos": "number",
        "vehiculos_con_placa_leida": "number"
      }
    }
  },
  pixmindNoBG: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindNoBG",
    description: "remueve fondos usando AI",
    fields: {
      imagen: { type: "file", required: true }
    },
    docs: {
      worker: "pixmindNoBG",
      fields: [
        { label: "image", desc: "Una imagen que contiene un fondo para quitar" }
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
      fields: [
        { label: "image", desc: "La imagen que será transformada" },
        { label: "extraImages", desc: "La imagen para copiar el estilo" }
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
    description: "Detecta y clasifica baches en la via",
    fields: {
      imagen: { type: "file", required: true }
    },
    docs: {
      worker: "pixmindRoads",
      fields: [
        { label: "image", desc: "Imagen con huecos para analizar" },
      ],
      response: {
        "detalles": [
          {
            "confianza": 0.9,
            "coordenadas_imagen": [
              28.088836669921875,
              213.06495666503906,
              401.7003173828125,
              493.57794189453125
            ],
            "gravedad": "ALTA",
            "tipo": "bache"
          }
        ],
        "estado_via": "NORMAL",
        "imagen_anotada_base64": "",
        "total_incidentes": 1
      }
    }
  },
  pixmindNoParking: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindNoParking",
    description: "Detecta en un espacio de la iamgen si hay presencia de un vehículo",
    fields: {
      imagen: { type: "file", required: true },
      zona: { type: "string", required: true },
    },
    docs: {
      worker: "pixmindNoParking",
      fields: [
        { label: "image", desc: "La imagen del espacio a analizar" },
        { label: "zona", desc: "Coordenadas [x1,y1,x2,y2] del espacio de la imagen a analizar si hay vehiculos presentes" },
      ],
      response: {
    "detalles": [
        {
            "alerta": "VEHICULO EN ZONA PROHIBIDA",
            "bounding_box": [
                1230,
                496,
                1545,
                702
            ],
            "confianza": 0.74,
            "posicion_centro_detectado": [
                1387,
                599
            ],
            "vehiculo": "bicycle"
        }
    ],
    "hay_infraccion": true,
    "imagen_analizada_base64": "",
    "success": true,
    "total_infracciones": 1,
    "zona_monitorizada": [
        300.0,
        580.0,
        1550.0,
        1050.0
    ]
}
    }
  }
};