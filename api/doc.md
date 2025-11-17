📌 POST /auth/register
Body (JSON)
{
  "email": "museortiz@gmail.com",
  "password": "12345"
}

Respuesta:
{
  "message": "User registered successfully",
  "userId": "clx12345"
}

📌 POST /auth/login
Body (JSON)
{
  "email": "museortiz@gmail.com",
  "password": "12345"
}

Respuesta:
{
  "token": "eyJhbGciOiJIUzI1...",
  "user": {
    "id": "clx12345",
    "email": "museortiz@gmail.com",
    "usage": 0,
    "usageLimit": 1000,
    "apiKey": "c1a8d8d9-fb9f-4fd0-b312-40f79..."
  }
}


📌 GET /auth/me
Headers:
Authorization: Bearer TU_JWT_AQUI

Respuesta:
{
  "id": "clx12345",
  "email": "museortiz@gmail.com",
  "usage": 0,
  "usageLimit": 1000,
  "apiKey": "c1a8d8d9-fb9f-4fd0-b312-40f79..."
}


📌 GET /auth/token
Headers:
Authorization: Bearer TU_JWT_AQUI

Respuesta:
{
  "apiToken": "c1a8d8d9-fb9f-4fd0-b312-40f79..."
}


📌GET /auth/credits
Headers:
Authorization: Bearer TU_JWT_AQUI

Respuesta:
{
  "usage": 0,
  "usageLimit": 1000,
  "remaining": 1000
}

📌 POST /model/use

Este es el endpoint que consumirá tu frontend.

Headers obligatorios:
Authorization: Bearer TU_JWT_AQUI
x-api-key: TU_APIKEY_DEL_USUARIO

Body (form-data):
Key	              Type	    Value
modelKey	      text	    la API Key del modelo IA (OpenAI, Replicate, etc.)
image	          file	    una imagen

Headers:
Authorization: Bearer eyJhbGciOiJIUzI1...
x-api-key: c1a8d8d9-fb9f-4fd0-b312-40f79...


Body (form-data):
modelKey : sk-openai-test-123
image : archivo.png

Respuesta:
{
  "result": "Descripción generada o datos procesados por la IA",
  "creditsUsed": 1,
  "remainingCredits": 999
}


❌ Errores típicos por si quieres capturarlos
Error	                 Motivo
401 Unauthorized	     No mandaste JWT
403 Forbidden	         API Key incorrecta o no pertenece al usuario
400 Bad Request	         Falta modelKey o image
402 Payment Required	 No tienes créditos
500	                     Error interno (modelo, archivo, servidor)


🎉 RESUMEN
Acción	                 Endpoint	         Método	  Necesita JWT	 Necesita APIKey
Registrar usuario	     /auth/register	     POST	  No	         No
Login	                 /auth/login	     POST	  No	         No
Información usuario	     /auth/me	         GET	  Sí	         No
Obtener apiKey	         /auth/token	     GET	  Sí	         No
Ver créditos	         /auth/credits	     GET	  Sí	         No
Procesar imagen (IA)     /model/use	         POST	  Sí	         Sí