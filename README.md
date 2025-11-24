# PixMind

**PixMind** es un **hub unificado de servicios de visión por computadora**, diseñado para que desarrolladores y empresas integren capacidades avanzadas de procesamiento de imágenes sin necesidad de desplegar ni mantener modelos por separado.

A través de una única API, PixMind ofrece acceso a múltiples modelos especializados —como clasificación de vehículos, segmentación, detección de objetos, mejora de calidad y más— todos desplegados como microservicios independientes y optimizados.

PixMind simplifica la adopción de la visión por computadora:

- Centraliza la gestión y acceso a modelos.
- Ofrece tokens personales para controlar el consumo.
- Proporciona una interfaz web intuitiva con ejemplos y guías.
- Escala cada microservicio de forma independiente según la demanda.

Con PixMind puedes incorporar inteligencia visual en tus proyectos de manera **rápida, modular y eficiente**, sin preocuparte por la infraestructura.

---


# Arquitectura del Proyecto

El proyecto sigue una **arquitectura de Microservicios Desacoplada**.

| Componente | Tecnología | Despliegue | Rol Principal |
|-----------|------------|------------|----------------|
| **Frontend (App)** | React.js | Render | Interfaz de usuario, Portal de cuentas (API Key), Documentación, Tester de Servicios |
| **Backend (Api gateway)** | Node.js | Render | Manejo de autenticación (API Key), manejo de cuentas para administrador y sistema de créditos, estandarización de la consulta y respuesta a Workers |
| **Workers (Microservicios)** | Python (Flask) / YOLOv8n / EasyOCR | Google Colab + Localtunnel | Ejecución de modelos de Deep Learning (CV/DL) que consumen CPU |

---

# A. Configuración y Despliegue de Workers (Servicios)

Debido a que este es un proyecto académico sin recursos dedicados, los Workers se ejecutan en un entorno externo (Google Colab) y se exponen al API Gateway mediante un túnel (Localtunnel).

## 1. Preparación del Entorno (Colab)

Cree un nuevo notebook en Google Colab.
Agrege estas 2 celdas:
 ```
 # ENV
ENVlocaltunnel = "lt --port 5000 --subdomain pixmindworkers"
```

> **Importante:** El API Gateway está configurado para apuntar a la URL pública generada por Localtunnel:  
> `https://pixmindworkers.loca.lt`

Luego puede ejecutar la celda con su worker:
 ```
 # 1. INSTALAMOS DEPENDENCIAS (Agregamos easyocr)
!pip install flask ultralytics pillow easyocr --quiet
!npm install -g localtunnel

from flask import Flask, request, jsonify
from ultralytics import YOLO
from PIL import Image, ImageDraw, ImageFont # Se importa ImageDraw y ImageFont para dibujar
import easyocr
import numpy as np
import subprocess
import threading
import io
import base64 # Se importa base64 para codificar la imagen de salida

""" 1. CARGAMOS LOS MODELOS """

# Modelo YOLO (Detección de objetos)
print("Cargando YOLOv8 Nano...")
model = YOLO('yolov8n.pt')
VEHICLE_CLASSES = [1, 2, 3, 5, 7] #Bicycle, Car, Motorcycle, Bus, Truck

# Modelo OCR (Lectura de texto)
# 'en' sirve bien para placas porque son alfanuméricas.
print("Cargando EasyOCR...")
# gpu=True si estás en Colab con T4 (se puede usar torch con torch.cuda.is_available() para detectar automaticamente)
reader = easyocr.Reader(['en'], gpu=False) 

""" 2. FUNCIONES AUXILIARES """

def obtener_color_hex(img_recorte):
    """Calcula el color promedio en Hexadecimal"""
    try:
        img_small = img_recorte.resize((1, 1)) #reduce la imagen a 1 pixel
        color = img_small.getpixel((0, 0)) # Devuelve rrggbb del pixel
        return '#{:02x}{:02x}{:02x}'.format(*color) #retorna en formato hexadecial
    except:
        return "#000000" #si falla retorna negro

def leer_placa_vehiculo(img_recorte):
    """
    Recibe la imagen RECORTADA del vehículo y busca texto.
    Devuelve el texto con mayor confianza.
    """
    # Convertimos imagen PIL (formato pillow) a Array de Numpy para EasyOCR y hacerlo trabajable
    img_np = np.array(img_recorte)

    # EasyOCR devuelve una lista: [ (caja, texto, confianza), ... ]
    # allowlist: Filtramos para que solo busque letras y números estándar de placas
    result = reader.readtext(img_np, allowlist='ABCDEFGHIJKLMNOPQRSTUVWXYZ0123456789')

    detectado = False
    texto = ""
    confianza = 0.0

    # Buscamos el texto con mayor confianza que tenga al menos 4 caracteres
    best_conf = 0
    for res in result:
        text_read = res[1]
        conf = res[2]
        # Filtro simple: las placas suelen tener más de 3 o 4 caracteres
        if len(text_read) > 3 and conf > best_conf:
            best_conf = conf
            texto = text_read
            detectado = True

    if detectado:
        return {"texto": texto.upper(), "confianza": round(best_conf, 2)}
    else:
        return None

""" 3. SERVICIO WEB FLASK """

app = Flask(__name__) # se crea app Flask

# Intentamos cargar una fuente simple, si falla, se usará la fuente por defecto.
try:
    # Usamos una fuente conocida o una genérica
    font_path = "/usr/share/fonts/truetype/dejavu/DejaVuSans-Bold.ttf"
    try:
        font = ImageFont.truetype(font_path, 20)
    except IOError:
        font = ImageFont.load_default()
except:
    font = ImageFont.load_default()


@app.route("/pixmindVehicle", methods=["POST"]) # Se crea la ruta /pixmindVehicle de tipo POST
def pixmind_worker_vehicle():
    if "imagen" not in request.files:
        return jsonify({"error": "falta el archivo 'imagen'"}), 400 # En los request files debe existir una llamada 'imagen'

    try:
        # Lee el archvio enviado FileStorage y se abre con PIL desde stream
        archivo = request.files['imagen']
        img = Image.open(archivo.stream).convert("RGB")
        width, height = img.size # se guardan alto ya ncho para metadata

        # Creamos una copia de la imagen para dibujar las anotaciones
        img_annotated = img.copy()
        draw = ImageDraw.Draw(img_annotated)
        
        # Detección de Vehículos
        results = model(img, conf=0.4, verbose=False) # Inferencia YOLO sobre la imagen

        detecciones = []
        vehiculos_con_placa = 0
        vehiculo_index = 1 # Contador para identificar los vehículos en la imagen

        # Recorre los resultados de YOLO
        for result in results:
            boxes = result.boxes # Lista de boxes detectadas
            # Se recorren los boxes detectados
            for box in boxes:
                cls_id = int(box.cls[0]) # indice 0: Clase detectada en formato indice (0-9000)
                # filtrado solo para clases vehiculo
                if cls_id in VEHICLE_CLASSES:
                    # Datos básicos
                    nombre_clase = model.names[cls_id] # Etiqueta textual
                    conf_vehiculo = float(box.conf[0]) # Confianza de la caja
                    coords = list(map(int, box.xyxy[0])) # coordenadas de la caja [x1, y1, x2, y2]
                    x1, y1, x2, y2 = coords

                    # Recortamos el vehículo de la imagen original (region PIL)
                    recorte_vehiculo = img.crop((x1, y1, x2, y2))

                    # Color promedio del vehiculo
                    color_hex = obtener_color_hex(recorte_vehiculo)

                    # Lectura de Placa (OCR)
                    datos_placa = None
                    if recorte_vehiculo.width > 50 and recorte_vehiculo.height > 30:
                        datos_placa = leer_placa_vehiculo(recorte_vehiculo)

                    if datos_placa:
                        vehiculos_con_placa += 1

                    # Creacion de Bounding Boxes vehiculo a vehiculo
                    draw.rectangle(coords, outline="lime", width=2) # 1. Dibujar el Bounding Box (línea verde)
                    placa_texto = datos_placa["texto"] if datos_placa else "Sin Placa" # 2. Texto a mostrar en la caja
                    texto_display = f"#{vehiculo_index} {nombre_clase} | {placa_texto}" # Se usa el índice del vehículo para referenciarlo en el JSON
                    text_bbox = draw.textbbox((x1, y1), texto_display, font=font) # 3. Dibujar fondo para el texto (para mejor legibilidad)
                    draw.rectangle([x1, text_bbox[1], text_bbox[2] + 5, text_bbox[3] + 5], fill="lime") # 4. Dibujar el texto (color negro)
                    draw.text((x1 + 2, y1 + 2), texto_display, fill="black", font=font)


                    # Armamos el objeto de entrega
                    detecciones.append({
                        "id_vehiculo": vehiculo_index, 
                        "tipo": nombre_clase,
                        "confianza_vehiculo": round(conf_vehiculo, 2),
                        "color_hex": color_hex,
                        "placa": datos_placa,
                        "posicion": coords
                    })
                    
                    vehiculo_index += 1
        
        # PREPARAR IMAGEN BASE64
        buffer = io.BytesIO() # Guardamos la imagen con los Bounding Boxes propios en un buffer de memoria
        img_annotated.save(buffer, format="JPEG")
        imagen_base64 = base64.b64encode(buffer.getvalue()).decode("utf-8") # Codificamos el buffer a base64 (string) Así se reciben las imágenes en el API
        
        # Devuelve un JSON con la información detectada y la imagen anotada
        return jsonify({
            "meta": {"ancho": width, "alto": height},
            "total_vehiculos": len(detecciones),
            "vehiculos_con_placa_leida": vehiculos_con_placa,
            "detalles": detecciones,
            "imagen_analizada_base64": imagen_base64,
            "mimeType": "image/jpeg"
        })

# si algo falla maneja las excepciones con mensaje 500 (web, problema de servidor)
    except Exception as e:
        # Se imprime el error en la consola del servidor para depuración
        print(f"Error en pixmind_worker_vehicle: {e}") 
        return jsonify({"error": str(e)}), 500

# Función LocalTunnel y Arranque
def run_localtunnel():
    cmd = ENVlocaltunnel # Se ejecuta con el nombre del subdominio definido en env.
    subprocess.call(cmd, shell=True)

# Ejecutar el localtunnel en un hilo aparte
threading.Thread(target=run_localtunnel).start()
print("Servidor iniciando en puerto 5000...")
app.run(port=5000) # Bloquea el servicio en el puerto 5000
 ```
Visite microservices/PixMindWorkers.ipynb para ver más modelos funcionales.

## 3. Conexión del Túnel (Localtunnel)

El script del Colab debe generar un túnel público para que el API Gateway pueda acceder al puerto **5000** del Worker.

# B. Servicio `pixmindVehicle`
Este servicio hace parte del api y recibe una petición POST con una imagen (`multipart/form-data`) y la API-Key del usuario.

### Respuesta Estándar (JSON + Imagen)

```json
{
    "meta": { "ancho": 1280, "alto": 720 },
    "total_vehiculos": 2,
    "vehiculos_con_placa_leida": 1,
    "detalles": [
        {
            "id_vehiculo": 1,
            "tipo": "car",
            "confianza_vehiculo": 0.95,
            "color_hex": "#1A1A1A",
            "placa": { "texto": "ABC123", "confianza": 0.89 },
            "posicion": [100, 200, 450, 600]
        },
        {
            "id_vehiculo": 2,
            "tipo": "bicycle",
            "confianza_vehiculo": 0.98,
            "color_hex": "#F0F0F0",
            "placa": null,
            "posicion": [700, 350, 850, 650]
        }
    ],
    "imagen_analizada_base64": "...",
    "mimeType": "image/jpeg"
}
```

---

# Autenticación y API Key

Los usuarios deben registrarse en el Frontend para obtener una API Key única.  
Esta clave se usa para todas las peticiones al API Gateway.

### Ejemplo de petición:

```bash
curl -X POST "https://pixmind.onrender.com/model/pixmindVehicle" \
  -H "x-api-key: [API_KEY_DEL_USUARIO]" \
  -F "image=@/path/to/image.jpg"
```
---

# C. Página web: `PixMind`
* Puede crear cuenta o inciar sesión en el front
* Puede ver los créditos de uso del api
* Puede ver su api-key secreto
* Puede probar todos los modelos con una imagen de prueba o subir la suya propia.
* Puede leer la documentación de cada modelo cargado en el hub de servicios.