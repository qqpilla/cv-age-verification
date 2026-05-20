from fastapi import FastAPI, UploadFile, File
from fastapi.middleware.cors import CORSMiddleware
from fastapi.responses import StreamingResponse
from face_detector import FaceDetector
from age_estimator import AgeEstimator
import io
import base64

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
age_estimator = AgeEstimator("weights/age_estimation.pth")

@app.post("/estimate-age")
async def estimate_age(file: UploadFile = File(...)):
    image_bytes = await file.read()
    
    face_pil_img = face_detector.crop_face(image_bytes)
    age_info = age_estimator.predict_age(face_pil_img)

    # Упаковываем картинку в Base64 для передачи в JSON
    img_io = io.BytesIO()
    face_pil_img.save(img_io, format='JPEG', quality=95)
    img_encoded = base64.b64encode(img_io.getvalue()).decode("utf-8")
    
    img_data_url = f"data:image/jpeg;base64,{img_encoded}"
    
    return {
        "face_image": img_data_url,
        "age_mean": round(age_info["expected_age"], 2),
        "age_std": round(age_info["std"], 2),
        "confidence_adult": round(age_info["confidence_adult"], 2),
        "purchase_allowed": age_info["is_adult"]
    }