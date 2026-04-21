from fastapi import FastAPI
from fastapi.middleware.cors import CORSMiddleware

app = FastAPI()

# Без этого браузер заблокирует запросы от Vite к Python-серверу
app.add_middleware(
    CORSMiddleware,
    allow_origins=["http://localhost:5173"], # Стандартный порт Vite
    allow_credentials=True,
    allow_methods=["*"],
    allow_headers=["*"],
)

@app.get("/hello")
def get_hello():
    return {"message": "Hello World from FastAPI"}