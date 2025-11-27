from fastapi import FastAPI, UploadFile, File
from fastapi.responses import JSONResponse

app = FastAPI(title="Pixmind AI Microservice")

@app.get("/")
def root():
    return {"status": "ok", "message": "Pixmind Microservice online"}

@app.post("/run")
async def run_model(file: UploadFile = File(...)):
    # Aquí procesas tu imagen/audio/texto
    # Para empezar solo devolvemos un eco del nombre del archivo
    return JSONResponse({
        "filename": file.filename,
        "message": "El microservicio está funcionando correctamente"
    })