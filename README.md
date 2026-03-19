# HKT - AutoDoc avec Hadoop

Ce workspace contient :
- `Website/` : le front/back **actuel**
- `HKT-2026-G20-AutoDoc-fullstack_old/` : ancien fullstack (archive)
- `bigdata-project/` : Hadoop (HDFS/YARN)
- `HKT-2026-G20-AutoDoc-ia-*` : projets IA à conserver

## Lancement complet (recommandé)

```bash
cd /home/guillaume/HKT
docker-compose up -d
```

Services :
- Frontend : http://localhost:3000
- Backend : http://localhost:5000
- HDFS UI : http://localhost:9870
- YARN : http://localhost:8088

## Lancement Website seul

```bash
cd /home/guillaume/HKT/Website
docker-compose up -d
```

## Flux data visé

- Upload backend vers `bronze`
- Script IA OCR : `bronze -> silver`
- Script IA scoring fiabilité : `silver -> gold`

Les projets IA ne sont pas modifiés ici ; l'orchestration Docker est alignée pour consommer/produire sur les chemins HDFS standards de l'app.
