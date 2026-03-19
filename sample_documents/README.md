# Exemples Bronze (upload front)

Ces fichiers servent à tester **Silver** et **Gold** sans OCR réel.

## Fichiers

| Fichier | Rôle |
|--------|------|
| `demo-facture.pdf` | PDF minimal (généré par le script ci-dessous). |
| `demo-facture.json` | Résultat « extraction » pour le même document logique (`nom_fichier`: `demo-facture.pdf`). |
| `demo-facture-alt.json` | Même idée, format `{ "documents": [ ... ] }`. |

## Générer / régénérer le PDF

```bash
cd sample_documents
node generate-demo-pdf.js demo-facture.pdf
```

## Comment uploader

1. Ouvre l’UI d’upload du site.
2. Envoie **les deux** : `demo-facture.pdf` **et** `demo-facture.json` (multi-fichiers).
3. Idéalement garde le **même préfixe** de nom (`demo-facture`) : le worker PDF seul ne remplace pas un JSON du même « stem ».

Après quelques secondes (poll workers), tu dois voir des lignes en **Silver** puis **Gold**.

## Seulement le JSON

Tu peux uploader **uniquement** `demo-facture.json` : le Silver sera rempli à partir du JSON (le `nom_fichier` peut pointer vers un PDF que tu uploades séparément).

## Seulement le PDF

Avec la dernière version du worker, un **PDF seul** crée quand même un Silver « placeholder » puis du Gold (données vides / score faible). Pour des champs SIRET/TVA remplis, il faut le **JSON** d’extraction.
