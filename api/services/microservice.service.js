import axios from "axios";
import FormData from "form-data";

export async function callMicroservice(serviceName, fileBuffer, filename = "image.jpg") {
  // For now map service names to environment URLs
  /*const map = {
    "vehicle-plate": process.env.MICROSERVICE_VEHICLE_PLATE, // set in env
    // add other services here
  };

  const url = map[serviceName];
  if (!url) throw new Error("Service not configured");

  const form = new FormData();
  form.append("image", fileBuffer, filename);

  const headers = form.getHeaders();

  const resp = await axios.post(url, form, { headers, timeout: 60000 });
  return resp.data;*/

  // Prototipo: devuelve info básica para probar el endpoint
  return {
    message: "Microservice call simulated",
    service: serviceName,
    filename,
    size: fileBuffer.length
  };
}