# Chest X-ray Model

SymptomLens uses a small PneumoniaMNIST binary classifier for the chest X-ray workflow.

## Supported output

The model reports one of two model findings:

- pneumonia-related pattern
- no pneumonia-related pattern

These are model-generated findings, not medical diagnoses. Clinical review is recommended.

## Artifact

The generated artifact is `training/artifacts/pneumoniamnist_cnn.pt`.

The one-time training utility is `training/train_pneumoniamnist.py`.

The evaluation utility is `training/evaluate_pneumoniamnist.py`. The current artifact was evaluated on 624 held-out samples with accuracy 0.6250, precision 0.6250, recall 1.0000, and F1 0.7692.

## Input handling

The API accepts JPG and PNG images up to 10 MB. Images are converted to grayscale and resized to 28x28 pixels before inference. The model runs on CPU and is cached after the first request.

## Limitations

This model is trained for the PneumoniaMNIST task and does not support comprehensive radiology interpretation or arbitrary lung disease detection. It has not been clinically validated by this project. No medical probability should be inferred from the returned score.
