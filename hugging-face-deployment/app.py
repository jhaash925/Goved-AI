import os, io
import torch
import torch.nn as nn
import torchvision.models as models
import torchvision.transforms as transforms
from PIL import Image
import matplotlib.pyplot as plt
import pandas as pd
import gradio as gr

# ----------------------------
# Device
# ----------------------------
device = "cuda" if torch.cuda.is_available() else "cpu"

# ----------------------------
# Labels
# ----------------------------
breeds = [
    "Alambadi", "Amritmahal", "Ayrshire", "Banni", "Bargur", "Bhadawari", "Brown_Swiss",
    "Dangi", "Deoni", "Gir", "Guernsey", "Hallikar", "Hariana", "Holstein_Friesian",
    "Jaffrabadi", "Jersey", "Kangayam", "Kankrej", "Kasargod", "Kenkatha", "Kherigarh",
    "Khillari", "Krishna_Valley", "Malnad_gidda", "Mehsana", "Murrah", "Nagori", "Nagpuri",
    "Nili_Ravi", "Nimari", "Ongole", "Pulikulam", "Rathi", "Red_Dane", "Red_Sindhi",
    "Sahiwal", "Surti", "Tharparkar", "Toda", "Umblachery", "Vechur"
]
num_classes = len(breeds)

# ----------------------------
# Model
# ----------------------------
model = models.efficientnet_b0(weights=None)
model.classifier[1] = nn.Linear(model.classifier[1].in_features, num_classes)
state = torch.load("bovine_model.pth", map_location=device)
model.load_state_dict(state)
model.to(device).eval()

# ----------------------------
# Preprocessing
# ----------------------------
val_transform = transforms.Compose([
    transforms.Resize((224, 224)),
    transforms.ToTensor(),
    transforms.Normalize([0.485, 0.456, 0.406],
                         [0.229, 0.224, 0.225])
])

# ----------------------------
# Predict
# ----------------------------
def predict_image(img_path: str):
    # Keep original filename for outputs
    base_name = os.path.basename(img_path)
    stem, _ = os.path.splitext(base_name)

    img = Image.open(img_path).convert("RGB")
    input_tensor = val_transform(img).unsqueeze(0).to(device)

    with torch.no_grad():
        outputs = model(input_tensor)
        probs = torch.nn.functional.softmax(outputs, dim=1)[0]

    top_prob, top_idx = torch.max(probs, dim=0)
    conf = float(top_prob.item()) * 100.0
    predicted_breed = breeds[int(top_idx.item())]

    # Annotate image (title overlay)
    fig, ax = plt.subplots()
    ax.imshow(img)
    ax.set_title(f"{predicted_breed} ({conf:.2f}%)")
    ax.axis("off")
    annotated_name = f"{predicted_breed}_{conf:.2f}pct_{stem}.png"
    plt.savefig(annotated_name, format="png", bbox_inches="tight", pad_inches=0.1, dpi=150)
    plt.close(fig)

    # CSV output
    df = pd.DataFrame([{
        "breed": predicted_breed,
        "confidence_percent": f"{conf:.2f}%",
        "filename": base_name
    }])
    csv_name = f"{stem}_prediction.csv"
    df.to_csv(csv_name, index=False)

    # Return:
    # 1) text (breed)
    # 2) file (CSV)
    # 3) file (annotated image with breed+confidence in filename)
    return predicted_breed, csv_name, annotated_name

# ----------------------------
# UI
# ----------------------------
demo = gr.Interface(
    fn=predict_image,
    inputs=gr.Image(type="filepath", label="Upload Cattle/Buffalo Image"),
    outputs=[
        gr.Textbox(label="Predicted Breed"),
        gr.File(label="Download CSV"),
        gr.File(label="Download Annotated Image")
    ],
    title="Indian Cattle/Buffalo Breed Detection",
    description="Upload an image → get predicted breed (text), CSV (breed, confidence, filename), and an annotated image file named with the predicted breed and confidence."
)

if __name__ == "__main__":
    demo.launch()
