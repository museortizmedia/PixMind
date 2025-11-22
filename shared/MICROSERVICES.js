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
      confidence: { type: "number", required: false }
    }
  },
  pixmindNoBG: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindNoBG",
    description: "remueve fondos usando AI",
    fields: {
      imagen: { type: "file", required: true }
    }
  },
  pixmindArt: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindArt",
    description: "Transforma una foto en una obra de un artista famoso",
    fields: {
      contenido: { type: "file", required: true },
      estilo: { type: "file", required: true }
    }
  },
  pixmindRoads: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindRoads",
    description: "Detecta y clasifica baches en la via",
    fields: {
      imagen: { type: "file", required: true }
    }
  },
  pixmindNoParking: {
    endpoint: "https://pixmindworkers.loca.lt/pixmindNoParking",
    description: "Detecta en un espacio de la iamgen si hay presencia de un vehículo",
    fields: {
      imagen: { type: "file", required: true },
      zona: {type: "string", required: true},
      threshold: { type: "number", required: false }
    }
  }
};