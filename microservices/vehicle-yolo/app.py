from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
import io
import os

from ultralytics import YOLO

app = Flask(__name__)

# Cargar modelo YOLOv8 nano (ultraliviano)
# Railway permite descargar durante el build, NO en runtime.
MODEL_PATH = "yolov8n.pt"
model = YOLO(MODEL_PATH)

# Clases que consideramos vehículos
VEHICLE_CLASSES = {"car", "truck", "bus", "motorcycle", "bicycle"}


@app.route("/detect", methods=["POST"])
def detect():
    if "file" not in request.files:
        return jsonify({"error": "Missing 'file' in form-data"}), 400

    file = request.files["file"]

    try:
        img = Image.open(io.BytesIO(file.read())).convert("RGB")
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400

    results = model.predict(img, imgsz=640, conf=0.25, verbose=False)

    detections = []

    for r in results:
        for box in r.boxes:
            cls_id = int(box.cls.cpu().numpy()[0])
            cls_name = model.names[cls_id]

            if cls_name not in VEHICLE_CLASSES:
                continue

            xyxy = box.xyxy[0].cpu().numpy().tolist()
            conf = float(box.conf.cpu().numpy()[0])

            detections.append({
                "class": cls_name,
                "confidence": round(conf, 4),
                "bbox": {
                    "x1": int(xyxy[0]),
                    "y1": int(xyxy[1]),
                    "x2": int(xyxy[2]),
                    "y2": int(xyxy[3]),
                }
            })

    return jsonify({
        "detections_count": len(detections),
        "detections": detections
    })


if __name__ == "__main__":
    # Puerto dinámico para Railway
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)