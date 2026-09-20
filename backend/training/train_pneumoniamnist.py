from pathlib import Path

import medmnist
import torch
from medmnist import INFO
from torch import nn
from torch.utils.data import DataLoader
from torchvision import transforms


BASE_DIR = Path(__file__).resolve().parent
ARTIFACT_DIR = BASE_DIR / "artifacts"
ARTIFACT_FILE = ARTIFACT_DIR / "pneumoniamnist_cnn.pt"


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
        features = self.features(images).flatten(1)
        return self.classifier(features)


def main():
    torch.manual_seed(42)
    info = INFO["pneumoniamnist"]
    dataset_class = getattr(medmnist, info["python_class"])
    transform = transforms.Compose([
        transforms.ToTensor(),
        transforms.Normalize(mean=[0.5], std=[0.5]),
    ])
    train_data = dataset_class(split="train", transform=transform, download=True)
    train_loader = DataLoader(train_data, batch_size=128, shuffle=True)

    model = PneumoniaClassifier()
    optimizer = torch.optim.Adam(model.parameters(), lr=0.001)
    loss_function = nn.CrossEntropyLoss()
    model.train()

    for images, labels in train_loader:
        labels = labels.squeeze().long()
        optimizer.zero_grad()
        loss = loss_function(model(images), labels)
        loss.backward()
        optimizer.step()

    ARTIFACT_DIR.mkdir(parents=True, exist_ok=True)
    torch.save({"state_dict": model.state_dict(), "classes": ["normal", "pneumonia"]}, ARTIFACT_FILE)
    print(f"saved {ARTIFACT_FILE}")


if __name__ == "__main__":
    main()