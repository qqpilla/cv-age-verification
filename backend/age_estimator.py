import torch
import torch.nn as nn
import torch.nn.functional as F
from torchvision import models, transforms
import math

MIN_AGE = 5
MAX_AGE = 90
NUM_CLASSES = MAX_AGE - MIN_AGE + 1

AGE_THRESHOLD = 18
CONFIDENCE_THRESHOLD = 0.95

IMG_SIZE = 200
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class AgeEstimator:
    def __init__(self, model_path):
        self.model = models.resnet18(weights=None)
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Sequential(
            nn.Dropout(0.5),
            nn.Linear(num_ftrs, NUM_CLASSES)
        )
        
        state_dict = torch.load(model_path, map_location=DEVICE)
        self.model.load_state_dict(state_dict)
        self.model.to(DEVICE)
        self.model.eval()

        self.transform = transforms.Compose([
            transforms.Resize((IMG_SIZE, IMG_SIZE)),
            transforms.ToTensor(),
            transforms.Normalize(mean=[0.485, 0.456, 0.406], std=[0.229, 0.224, 0.225])
        ])

        self.ages = torch.arange(MIN_AGE, MAX_AGE + 1, dtype=torch.float32).to(DEVICE)

    def predict_age(self, face_pil_img):
        # face_pil_img - это уже вырезанное лицо от первой нейросети
        input_tensor = self.transform(face_pil_img).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            logits = self.model(input_tensor)            
            probs = F.softmax(logits, dim=1).squeeze(0)

            # Вычисляем математическое ожидание
            expected_age = torch.sum(probs * self.ages).item()
            # Вычисляем дисперсию
            variance = torch.sum(probs * (self.ages - expected_age)**2).item()
            # Вычисляем среднеквадратичное отклонение
            std = math.sqrt(variance)

            # Вычисляем уверенность модели в том, что человеку >= AGE_THRESHOLD лет
            adult_mask = self.ages >= AGE_THRESHOLD
            confidence_adult = torch.sum(probs[adult_mask]).item()
            
            purchase_allowed = confidence_adult >= CONFIDENCE_THRESHOLD

        return {
            "expected_age": expected_age, 
            "std": std, 
            "confidence_adult": confidence_adult,
            "purchase_allowed": purchase_allowed
        }
    
def print_debug_probs(probs):
    probs_list = probs.cpu().tolist()
    
    print("\n[DEBUG: AGE PROBABILITIES]")
    for idx, p in enumerate(probs_list):
        age = idx + MIN_AGE
        # Рисуем полоску из символов #
        bar = "#" * int(p * 100)
        print(f"Age {age:3}: {p*100:5.2f}% | {bar}")
    print("-" * 40)
