import torch
import torch.nn as nn
from torchvision import models, transforms
from PIL import Image
import io

IMG_SIZE = 320
DEVICE = torch.device("cuda" if torch.cuda.is_available() else "cpu")

class FaceDetector:
    def __init__(self, model_path):
        self.model = models.resnet18(weights=None)
        num_ftrs = self.model.fc.in_features
        self.model.fc = nn.Sequential(
            nn.Dropout(0.2),
            nn.Linear(num_ftrs, 4),
            nn.Sigmoid()
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

    def crop_face(self, image_bytes, make_square=True):
        img = Image.open(io.BytesIO(image_bytes)).convert('RGB')
        orig_w, orig_h = img.size

        # Подготовка для нейронки
        input_tensor = self.transform(img).unsqueeze(0).to(DEVICE)

        with torch.no_grad():
            # Получаем 4 нормализованные координаты [x1, y1, x2, y2]
            output = self.model(input_tensor)
            coords = output[0].cpu().numpy()

        # Перевод в пиксели
        x1, y1, x2, y2 = coords
        x_min = x1 * orig_w
        x_max = x2 * orig_w
        y_min = y1 * orig_h
        y_max = y2 * orig_h

        # Делаем рамку квадратной
        if (make_square):
            detected_w = x_max - x_min
            detected_h = y_max - y_min

            center_x = x_min + detected_w / 2
            center_y = y_min + detected_h / 2

            # Выбираем большую сторону
            side = max(detected_w, detected_h)

            x_min = center_x - side / 2
            x_max = center_x + side / 2
            y_min = center_y - side / 2
            y_max = center_y + side / 2

        face_img = img.crop((x_min, y_min, x_max, y_max))        
        return face_img