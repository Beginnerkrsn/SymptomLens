from pathlib import Path

import medmnist
import torch
from medmnist import INFO
from sklearn.metrics import accuracy_score, f1_score, precision_score, recall_score
from torch.utils.data import DataLoader
from torchvision import transforms

from train_pneumoniamnist import PneumoniaClassifier, ARTIFACT_FILE


def main():
    info = INFO["pneumoniamnist"]
    dataset_class = getattr(medmnist, info["python_class"])
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5]),
    ])
    test_data = dataset_class(split="test", transform=transform, download=True)
    test_loader = DataLoader(test_data, batch_size=256, shuffle=False)

    checkpoint = torch.load(ARTIFACT_FILE, map_location="cpu", weights_only=True)
    model = PneumoniaClassifier()
    model.load_state_dict(checkpoint["state_dict"])
    model.eval()

    actual = []
    predicted = []
    with torch.inference_mode():
        for images, labels in test_loader:
            predictions = model(images).argmax(dim=1)
            actual.extend(labels.squeeze().tolist())
            predicted.extend(predictions.tolist())

    print({
        "accuracy": round(accuracy_score(actual, predicted), 4),
        "precision": round(precision_score(actual, predicted, zero_division=0), 4),
        "recall": round(recall_score(actual, predicted, zero_division=0), 4),
        "f1": round(f1_score(actual, predicted, zero_division=0), 4),
        "test_samples": len(actual),
    })


if __name__ == "__main__":
    main()