# 📁 Branche : `feature/medallion-pipeline-logic`

## Objectif

Cette branche implémente le **squelette de l'architecture Medallion** pour le pipeline de traitement des factures automatisées par l'IA.

## Structure des dossiers `data/`

```
data/
├── 1_bronze/     → PDF originaux + JSON bruts extraits par l'IA       [⏳ EN ATTENTE]
├── 2_silver/     → Fichiers Parquet nettoyés et typés                  [⏳ EN ATTENTE]
└── 3_gold/       → Agrégations finales et KPI métier                   [⏳ EN ATTENTE]
```

> ⚠️ **Les dossiers `data/` sont actuellement vides.**
> Ils attendent les exports de l'équipe IA (fichiers JSON issus de l'extraction des factures PDF).
> Ne pas committer de fichiers de données — ils sont exclus par le `.gitignore`.

## Comment déposer vos données

1. **Équipe IA / Extraction** → Déposer les JSON bruts dans `data/1_bronze/`
   - Nommage suggéré : `facture_<id>_<date>.json`
2. **Équipe Data** → Lancer `pipeline_bronze_to_silver.py` pour nettoyer et typer
3. **Équipe Analytics** → Lancer `pipeline_silver_to_gold.py` pour générer les KPI

## Scripts disponibles

| Fichier | Rôle | Statut |
|---|---|---|
| `pipeline_bronze_to_silver.py` | Nettoyage + typage via DuckDB | 🟡 Squelette |
| `pipeline_silver_to_gold.py` | Création des KPI métier | 🟡 Squelette |

## Technologies prévues

- **DuckDB** : moteur SQL pour la transformation des données
- **Parquet** : format de stockage colonnaire pour Silver et Gold
- **Python** : orchestration des pipelines

---
*Aucune donnée réelle ne doit être commitée dans ce dépôt. Voir `.gitignore`.*
