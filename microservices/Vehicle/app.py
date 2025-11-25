from flask import Flask, request, jsonify
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import easyocr
import numpy as np
import io
import base64

# Load models
print("Cargando YOLOv8 Nano (CPU)...")
model = YOLO('yolov8n.pt')
VEHICLE_CLASSES = [1, 2, 3, 5, 7]

print("Cargando EasyOCR...")
reader = easyocr.Reader(['en'], gpu=False)

app = Flask(__name__)

try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
except:
    font = ImageFont.load_default()


def obtener_color_hex(img_recorte):
    try:
        img_small = img_recorte.resize((1, 1))
        color = img_small.getpixel((0, 0))
        return '#{:02x}{:02x}{:02x}'.format(*color)
    except:
        return "#000000"


def leer_placa_vehiculo(img_recorte):
    img_np = np.array(img_recorte)
    result = reader.readtext(img_np, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

    best_conf = 0
    texto = None

    for res in result:
        text_read, conf = res[1], res[2]
        if len(text_read) > 3 and conf > best_conf:
            best_conf = conf
            texto = text_read

    if texto:
        return {"texto": texto.upper(), "confianza": round(best_conf, 2)}
    return None


@app.route("/pixmindVehicle", methods=["POST"])
def pixmind_worker_vehicle():
    if "imagen" not in request.files:
        return jsonify({"error": "falta el archivo 'imagen'"}), 400

    try:
        archivo = request.files['imagen']
        img = Image.open(archivo.stream).convert("RGB")
        width, height = img.size

        img_annotated = img.copy()
        draw = ImageDraw.Draw(img_annotated)

        results = model(img, conf=0.4, verbose=False)

        detecciones = []
        vehiculos_con_placa = 0
        vehiculo_index = 1

        for result in results:
            for box in result.boxes:
                cls_id = int(box.cls[0])
                if cls_id in VEHICLE_CLASSES:
                    nombre_clase = model.names[cls_id]
                    conf_vehiculo = float(box.conf[0])
                    coords = list(map(int, box.xyxy[0]))
                    x1, y1, x2, y2 = coords

                    recorte_vehiculo = img.crop((x1, y1, x2, y2))
                    color_hex = obtener_color_hex(recorte_vehiculo)

                    datos_placa = None
                    if recorte_vehiculo.width > 50 and recorte_vehiculo.height > 30:
                        datos_placa = leer_placa_vehiculo(recorte_vehiculo)

                    if datos_placa:
                        vehiculos_con_placa += 1

                    draw.rectangle(coords, outline="lime", width=2)
                    placa_texto = datos_placa["texto"] if datos_placa else "Sin Placa"
                    texto_display = f"#{vehiculo_index} {nombre_clase} | {placa_texto}"
                    text_bbox = draw.textbbox((x1, y1), texto_display, font=font)

                    draw.rectangle([x1, text_bbox[1], text_bbox[2] + 5, text_bbox[3] + 5], fill="lime")
                    draw.text((x1 + 2, y1 + 2), texto_display, fill="black", font=font)

                    detecciones.append({
                        "id_vehiculo": vehiculo_index,
                        "tipo": nombre_clase,
                        "confianza_vehiculo": round(conf_vehiculo, 2),
                        "color_hex": color_hex,
                        "placa": datos_placa,
                        "posicion": coords
                    })

                    vehiculo_index += 1

        buffer = io.BytesIO()
        img_annotated.save(buffer, format="JPEG")
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

        return jsonify({
            "meta": {"ancho": width, "alto": height},
            "total_vehiculos": len(detecciones),
            "vehiculos_con_placa_leida": vehiculos_con_placa,
            "detalles": detecciones,
            "imagen_analizada_base64": imagen_base64,
            "mimeType": "image/jpeg"
        })

    except Exception as e:
        print(f"Error: {e}")
        return jsonify({"error": str(e)}), 500


if __name__ == "__main__":
    import os
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
