import io
import os
import time
from typing import List, Dict, Tuple

from flask import Flask, request, jsonify
from PIL import Image
import numpy as np

app = Flask(__name__)

# Cargar modelo YOLOv8 (descargará el .pt la primera vez si no está)
# Puedes cambiar a 'yolov8n.pt' | 'yolov8s.pt' | 'yolov8m.pt' según necesidad
MODEL_PATH = "yolov8n.pt"
model = YOLO(MODEL_PATH)

# Clases de COCO que consideramos vehículos
VEHICLE_CLASSES = {
    "car",
    "truck",
    "bus",
    "motorbike",
    "bicycle",
    "train"  # opcional, depende de si lo quieres considerar
}

# Mapa de índices de COCO -> nombres (ultralytics usa nombres incorporados, pero por si acaso:)
# NOTA: model.names normalmente ya contiene la lista de nombres de clases.
MODEL_NAMES = model.names if hasattr(model, "names") else {}

# Paleta básica para aproximar color (nombre -> RGB)
BASIC_COLORS = {
    "black": (0, 0, 0),
    "white": (255, 255, 255),
    "red": (220, 20, 60),
    "blue": (30, 144, 255),
    "green": (34, 139, 34),
    "yellow": (255, 215, 0),
    "gray": (128, 128, 128),
    "brown": (139, 69, 19),
    "orange": (255, 140, 0),
    "purple": (128, 0, 128),
    "silver": (192, 192, 192)
}


def rgb_to_basic_color(rgb: Tuple[int, int, int]) -> str:
    """Devuelve el nombre de color más cercano de BASIC_COLORS por distancia euclidiana."""
    r, g, b = rgb
    min_dist = float("inf")
    best = "unknown"
    for name, (cr, cg, cb) in BASIC_COLORS.items():
        d = (r - cr) ** 2 + (g - cg) ** 2 + (b - cb) ** 2
        if d < min_dist:
            min_dist = d
            best = name
    return best


def estimate_dominant_color(pil_crop: Image.Image) -> Tuple[str, Tuple[int, int, int]]:
    """Estimación simple del color dominante: redimensiona y promedia píxeles."""
    # Convertir a RGB y reducir tamaño para suavizar
    crop = pil_crop.convert("RGB").resize((50, 50))
    arr = np.array(crop).reshape(-1, 3)
    # Promedio
    avg = tuple(int(x) for x in arr.mean(axis=0))
    name = rgb_to_basic_color(avg)
    return name, avg


def bbox_area_pct(bbox: Tuple[float, float, float, float], image_size: Tuple[int, int]) -> float:
    """Calcula el porcentaje del área de la imagen que cubre el bbox."""
    x1, y1, x2, y2 = bbox
    w = max(0, x2 - x1)
    h = max(0, y2 - y1)
    bbox_area = w * h
    total = image_size[0] * image_size[1]
    return float(bbox_area / total) * 100.0


@app.route("/detect", methods=["POST"])
def detect():
    start_time = time.time()

    if "file" not in request.files:
        return jsonify({"error": "Campo 'file' no encontrado en el form-data"}), 400

    file = request.files["file"]
    if file.filename == "":
        return jsonify({"error": "No se ha enviado ningún archivo"}), 400

    try:
        img_stream = io.BytesIO(file.read())
        pil_img = Image.open(img_stream).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Imagen inválida: {str(e)}"}), 400

    img_w, img_h = pil_img.size

    # Inference con ultralytics YOLO
    # Ajusta conf si quieres más/menos detecciones: model.predict(..., conf=0.25)
    results = model.predict(source=pil_img, imgsz=640, conf=0.25, verbose=False)

    detections = []
    # results es una lista, normalmente con 1 elemento (porque pasamos una imagen)
    for r in results:
        boxes = r.boxes  # boxes tensor / objeto
        if boxes is None:
            continue

        # iterar sobre detecciones
        for box in boxes:
            # ultralytics: box.xyxy[0] -> tensor[x1,y1,x2,y2] ; box.conf ; box.cls
            xyxy = box.xyxy[0].cpu().numpy().tolist()
            conf = float(box.conf.cpu().numpy()[0]) if hasattr(box, "conf") else float(box.conf)
            cls_id = int(box.cls.cpu().numpy()[0]) if hasattr(box, "cls") else int(box.cls)
            cls_name = MODEL_NAMES.get(cls_id, str(cls_id))

            # Solo interesan vehículos
            if cls_name not in VEHICLE_CLASSES:
                continue

            x1, y1, x2, y2 = xyxy
            # Limpiar (garantizar dentro de la imagen)
            x1 = max(0, min(x1, img_w))
            y1 = max(0, min(y1, img_h))
            x2 = max(0, min(x2, img_w))
            y2 = max(0, min(y2, img_h))

            # Crop para estimar color
            try:
                crop = pil_img.crop((int(x1), int(y1), int(x2), int(y2)))
                color_name, color_rgb = estimate_dominant_color(crop)
            except Exception:
                color_name, color_rgb = "unknown", (0, 0, 0)

            area_pct = bbox_area_pct((x1, y1, x2, y2), (img_w, img_h))

            det = {
                "type": cls_name,
                "confidence": round(conf, 4),
                "bbox": {
                    "x1": int(x1),
                    "y1": int(y1),
                    "x2": int(x2),
                    "y2": int(y2)
                },
                "bbox_relative": {
                    "x": round(x1 / img_w, 4),
                    "y": round(y1 / img_h, 4),
                    "w": round((x2 - x1) / img_w, 4),
                    "h": round((y2 - y1) / img_h, 4)
                },
                "area_percentage": round(area_pct, 3),
                "estimated_color": {
                    "name": color_name,
                    "rgb": color_rgb
                }
            }
            detections.append(det)

    total_time = time.time() - start_time
    response = {
        "image_width": img_w,
        "image_height": img_h,
        "detections_count": len(detections),
        "detections": detections,
        "processing_time_s": round(total_time, 3)
    }
    return jsonify(response), 200


if __name__ == "__main__":
    # Para desarrollo. En producción usa gunicorn/uvicorn detrás de un reverse-proxy.
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)
