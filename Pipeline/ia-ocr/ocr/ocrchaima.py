import os
import json
import pytesseract
from pdf2image import convert_from_path

import pytesseract
import os
pytesseract.pytesseract.tesseract_cmd = r'C:\Program Files\Tesseract-OCR\tesseract.exe'

# TON CHEMIN POPPLER ICI :
PATH_POPPLER = r'C:\Program Files\Release-25.12.0-0\poppler-25.12.0\Library\bin'


# --- CONFIGURATION ---
PATH_DATASET = "pdfs"  # Ton dossier parent
PATH_RESULTAT = "resultat"

# Crée le dossier de destination s'il n'existe pas
if not os.path.exists(PATH_RESULTAT):
    os.makedirs(PATH_RESULTAT)

def extract_text_from_pdf(pdf_path):
    """Convertit le PDF en images et extrait le texte avec Tesseract."""
    try:
        # Conversion des pages du PDF en images
        images = convert_from_path(pdf_path, poppler_path=PATH_POPPLER)
        full_text = ""
        
        for i, image in enumerate(images):
            # Extraction du texte pour chaque page
            text = pytesseract.image_to_string(image, lang='fra') # 'fra' pour le français
            clean_text = " ".join(text.split())
            full_text += clean_text + " "
            
        return full_text.strip()
    except Exception as e:
        print(f"Erreur sur le fichier {pdf_path}: {e}")
        return ""

def process_all_folders():
    # Liste des sous-dossiers (rib, kbis, facture, devis, etc.)
    categories = [d for d in os.listdir(PATH_DATASET) if os.path.isdir(os.path.join(PATH_DATASET, d))]

    for category in categories:
        print(f"Traitement de la catégorie : {category}...")
        category_path = os.path.join(PATH_DATASET, category)
        results = []

        # Parcourir chaque PDF dans le sous-dossier
        for filename in os.listdir(category_path):
            if filename.lower().endswith(".pdf"):
                file_path = os.path.join(category_path, filename)
                
                print(f"  - Lecture de : {filename}")
                extracted_text = extract_text_from_pdf(file_path)
                
                # On stocke le nom du fichier et son contenu
                results.append({
                    "nom_fichier": filename,
                    "categorie": category,
                    "contenu": extracted_text
                })

        # Sauvegarde en fichier JSON (un par catégorie)
        output_file = os.path.join(PATH_RESULTAT, f"{category}.json")
        with open(output_file, 'w', encoding='utf-8') as f:
            json.dump(results, f, ensure_ascii=False, indent=4)
        
        print(f"Finie ! Résultat stocké dans {output_file}\n")

if __name__ == "__main__":
    process_all_folders()