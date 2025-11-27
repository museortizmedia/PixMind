from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont
import easyocr
import numpy as np
import base64
import io

app = FastAPI()

# Cargar modelo YOLO (descarga automática si no está presente)
model = YOLO("yolov8n.pt")

# EasyOCR sin GPU
reader = easyocr.Reader(["en"], gpu=False)

# Clases de vehículos en COCO
VEHICLE_CLASSES = [1, 2, 3, 5, 7]

# Fuente segura
try:
    font = ImageFont.truetype("/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf", 20)
except:
    font = ImageFont.load_default()


def obtener_color_hex(img):
    try:
        img_small = img.resize((1, 1))
        color = img_small.getpixel((0, 0))
        return '#{:02x}{:02x}{:02x}'.format(*color)
    except:
        return "#000000"


def leer_placa(img):
    np_img = np.array(img)
    result = reader.readtext(np_img, allowlist="ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789")
    best = None
    best_conf = 0

    for bbox, text, conf in result:
        if len(text) > 3 and conf > best_conf:
            best = text
            best_conf = conf

    if best:
        return {"texto": best.upper(), "confianza": round(best_conf, 2)}
    return None


@app.post("/run")
async def process_vehicle(imagen: UploadFile = File(...)):

    pil_img = Image.open(imagen.file).convert("RGB")
    width, height = pil_img.size

    annotated = pil_img.copy()
    draw = ImageDraw.Draw(annotated)

    results = model(pil_img, conf=0.4, verbose=False)

    detecciones = []
    vehiculos_con_placa = 0
    index = 1

    for r in results:
        for box in r.boxes:
            cls = int(box.cls[0])
            if cls in VEHICLE_CLASSES:

                name = model.names[cls]
                conf = float(box.conf[0])
                x1, y1, x2, y2 = map(int, box.xyxy[0])

                crop = pil_img.crop((x1, y1, x2, y2))
                color_hex = obtener_color_hex(crop)
                placa = leer_placa(crop)

                if placa:
                    vehiculos_con_placa += 1

                txt = f"#{index} {name} | {placa['texto'] if placa else 'Sin Placa'}"
                draw.rectangle([x1, y1, x2, y2], outline="lime", width=2)

                tbox = draw.textbbox((x1, y1), txt, font=font)
                draw.rectangle([tbox[0], tbox[1], tbox[2], tbox[3]], fill="lime")
                draw.text((tbox[0], tbox[1]), txt, fill="black", font=font)

                detecciones.append({
                    "id": index,
                    "tipo": name,
                    "confianza": round(conf, 2),
                    "color_hex": color_hex,
                    "placa": placa,
                    "posicion": [x1, y1, x2, y2]
                })

                index += 1

    buffer = io.BytesIO()
    annotated.save(buffer, format="JPEG")
    img_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8")

    return JSONResponse({
        "meta": {"ancho": width, "alto": height},
        "total_vehiculos": len(detecciones),
        "vehiculos_con_placa_leida": vehiculos_con_placa,
        "detalles": detecciones,
        "imagen_analizada_base64": img_base64,
        "mimeType": "image/jpeg"
    })