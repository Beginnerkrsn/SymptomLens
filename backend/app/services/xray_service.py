from functools import lru_cache
from pathlib import Path

import torch
from PIL import Image
from torch import nn
from torchvision import transforms


MODEL_FILE = (
    Path(__file__).resolve().parents[2]
    / "training"
    / "artifacts"
    / "pneumoniamnist_cnn.pt"
)


class PneumoniaClassifier(nn.Module):
    def __init__(self):
        super().__init__()
        self.features = nn.Sequential(
            nn.Conv2d(1, 16, 3, padding=1),
            nn.ReLU(),
            nn.MaxPool2d(2),
            nn.Conv2d(16, 32, 3, padding=1),
            nn.ReLU(),
            nn.AdaptiveAvgPool2d((1, 1)),
        )
        self.classifier = nn.Linear(32, 2)

    def forward(self, images):
        return self.classifier(self.features(images).flatten(1))


@lru_cache(maxsize=1)
def get_model():
    if not MODEL_FILE.exists():
        raise RuntimeError("The X-ray model artifact is not configured.")

    checkpoint = torch.load(MODEL_FILE, map_location="cpu", weights_only=True)
    model = PneumoniaClassifier()
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()
    return model


def analyze_xray(contents: bytes) -> dict:
    try:
        image = Image.open(__import__("io").BytesIO(contents)).convert("L")
        image.load()
    except Exception as exc:
        raise ValueError("The uploaded image could not be read.") from exc

    transform = transforms.Compose([
        transforms.Resize((28, 28)),
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5]),
    ])

    try:
        with torch.inference_mode():
            scores = torch.softmax(get_model()(transform(image).unsqueeze(0)), dim=1)[0]
    except RuntimeError as exc:
        raise RuntimeError("The X-ray model is unavailable.") from exc

    pneumonia_score = float(scores[1])
    finding = "pneumonia-related pattern" if pneumonia_score >= 0.5 else "no pneumonia-related pattern"
    return {
        "finding": finding,
        "score": round(pneumonia_score, 4),
        "model_name": "PneumoniaMNIST binary classifier",
        "model_finding": True,
        "disclaimer": "This is a model-generated finding, not a medical diagnosis. Clinical review is recommended.",
    }