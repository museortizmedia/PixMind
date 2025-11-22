from flask import Flask, request, jsonify
from PIL import Image
import numpy as np
import onnxruntime as ort
import io
import os

# -----------------------------
# Cargar modelo ONNX YOLOv8n
# -----------------------------
MODEL_PATH = "yolov8n.onnx"

session = ort.InferenceSession(
    MODEL_PATH,
    providers=["CPUExecutionProvider"]
)

input_name = session.get_inputs()[0].name

# Clases de YOLOv8 (COCO)
COCO_CLASSES = [
    "person","bicycle","car","motorcycle","airplane","bus","train","truck","boat",
    "traffic light","fire hydrant","stop sign","parking meter","bench",
    "bird","cat","dog","horse","sheep","cow","elephant","bear","zebra","giraffe",
    "backpack","umbrella","handbag","tie","suitcase","frisbee","skis","snowboard",
    "sports ball","kite","baseball bat","baseball glove","skateboard","surfboard",
    "tennis racket","bottle","wine glass","cup","fork","knife","spoon","bowl",
    "banana","apple","sandwich","orange","broccoli","carrot","hot dog","pizza",
    "donut","cake","chair","couch","potted plant","bed","dining table","toilet",
    "tv","laptop","mouse","remote","keyboard","cell phone","microwave","oven",
    "toaster","sink","refrigerator","book","clock","vase","scissors","teddy bear",
    "hair drier","toothbrush"
]

VEHICLE_CLASSES = {"car", "truck", "bus", "motorcycle", "bicycle"}


def preprocess(img: Image.Image):
    img = img.resize((640, 640))
    img = img.convert("RGB")
    arr = np.array(img).astype(np.float32)
    arr = arr / 255.0
    arr = np.transpose(arr, (2, 0, 1))  # HWC → CHW
    arr = np.expand_dims(arr, 0)
    return arr


def postprocess(outputs, orig_w, orig_h, conf_th=0.25):
    preds = outputs[0]  # (1, N, 84)
    preds = preds[0]    # (N, 84)

    detections = []

    for det in preds:
        cls_conf = det[4:]
        cls_id = np.argmax(cls_conf)
        score = cls_conf[cls_id]

        if score < conf_th:
            continue

        cls_name = COCO_CLASSES[cls_id]

        if cls_name not in VEHICLE_CLASSES:
            continue

        x, y, w, h = det[0], det[1], det[2], det[3]
        x1 = int((x - w/2) * orig_w / 640)
        y1 = int((y - h/2) * orig_h / 640)
        x2 = int((x + w/2) * orig_w / 640)
        y2 = int((y + h/2) * orig_h / 640)

        detections.append({
            "class": cls_name,
            "confidence": float(score),
            "bbox": {
                "x1": x1,
                "y1": y1,
                "x2": x2,
                "y2": y2
            }
        })

    return detections


app = Flask(__name__)


@app.route("/detect", methods=["POST"])
def detect():
    if "file" not in request.files:
        return jsonify({"error": "Missing file"}), 400

    file = request.files["file"]

    try:
        img = Image.open(io.BytesIO(file.read()))
    except Exception as e:
        return jsonify({"error": f"Invalid image: {str(e)}"}), 400

    w, h = img.size

    inp = preprocess(img)
    outputs = session.run(None, {input_name: inp})

    detections = postprocess(outputs, w, h)

    return jsonify({
        "detections_count": len(detections),
        "detections": detections
    })


if __name__ == "__main__":
    port = int(os.environ.get("PORT", 5000))
    app.run(host="0.0.0.0", port=port)