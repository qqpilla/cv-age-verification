from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from face_detector import FaceDetector
import io

app = FastAPI()
# Без этого браузер заблокирует запросы от Vite к Python-серверу
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Стандартный порт Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

face_detector = FaceDetector("weights/face_detection.pth")
@app.post("/detect-face")
async def detect_face(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    face_img = face_detector.crop_face(image_bytes)
    
    # Сохраняем вырезанное лицо в буфер, чтобы отправить обратно как файл
    img_io = io.BytesIO()
    face_img.save(img_io, 'JPEG', quality=95)
    img_io.seek(0)
    
    return StreamingResponse(img_io, media_type="image/jpeg")

@app.get("/hello")
def get_hello():
    return {"message": "Hello World from FastAPI"}