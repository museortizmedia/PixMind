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
export async function callMicroservice(serviceName, fileBuffer, filename, body = {}) {
  const service = SERVICE_REGISTRY[serviceName];
  if (!service) throw new Error("Service not configured");

  const fields = service.fields;

  // obtener el nombre DEL CAMPO que es un archivo
  const fileFieldName = Object.keys(fields).find(
    key => fields[key].type === "file"
  );

  if (!fileFieldName)
    throw new Error(`No file field defined for service '${serviceName}'`);

  const form = new FormData();

  // enviar el archivo con el nombre que pide el worker
  form.append(fileFieldName, fileBuffer, filename);

  // enviar parámetros extra del body
  Object.entries(body).forEach(([key, value]) => {
    if (value !== undefined) form.append(key, value);
  });

  const resp = await axios.post(service.endpoint, form, {
    headers: form.getHeaders(),
    timeout: 60000
  });

  return resp.data;
}