// microservice.service.js
import axios from "axios";
import FormData from "form-data";
import { SERVICE_REGISTRY } from "../../shared/MICROSERVICES.js";

/**
 * VALIDACIÓN DE PAYLOAD ANTES DE LLAMAR AL WORKER
 */
export function validateServicePayload(serviceName, file, body) {
  const definition = SERVICE_REGISTRY[serviceName];
  if (!definition) throw new Error(`Service '${serviceName}' is not supported.`);

  const fields = definition.fields;

  // buscar el campo file definido en SERVICE_REGISTRY
  const fileField = Object.entries(fields).find(
    ([key, rule]) => rule.type === "file"
  );

  if (!fileField) {
    throw new Error(`Service '${serviceName}' has no file field defined.`);
  }

  const [fileKey, fileRule] = fileField;

  if (fileRule.required && !file) {
    throw new Error(`File field '${fileKey}' is required.`);
  }

  // Validación del body
  for (const [key, rule] of Object.entries(fields)) {
    if (rule.type === "file") continue;

    const value = body[key];

    if (rule.required && (value === undefined || value === "")) {
      throw new Error(`Field '${key}' is required.`);
    }

    if (value !== undefined) {
      if (rule.type === "number" && isNaN(Number(value)))
        throw new Error(`Field '${key}' must be a number.`);
      if (rule.type === "string" && typeof value !== "string")
        throw new Error(`Field '${key}' must be a string.`);
    }
  }
}

/**
 * LLAMADA REAL AL MICROSERVICIO
 */
export async function callMicroservice(serviceName, mainFile, extraFiles = [], body = {}) {
  const service = SERVICE_REGISTRY[serviceName];
  if (!service) throw new Error("Service not configured");

  const form = new FormData();

  // Recorrer todos los campos tipo file definidos en fields
  const fileFields = Object.entries(service.fields).filter(([_, rule]) => rule.type === "file");

  fileFields.forEach(([key], index) => {
    if (index === 0) {
      // Primer archivo → mainFile
      form.append(key, mainFile.buffer, mainFile.originalname);
    } else if (extraFiles[index - 1]) {
      // Archivos extra → extraFiles
      form.append(key, extraFiles[index - 1].buffer, extraFiles[index - 1].originalname);
    }
  });

  // Agregar campos de body
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, value);
  });

  const resp = await axios.post(service.endpoint, form, {
    headers: form.getHeaders(),
    responseType: 'arraybuffer',
    timeout: 60000
  });

  return { data: resp.data, contentType: resp.headers['content-type'] };
}
