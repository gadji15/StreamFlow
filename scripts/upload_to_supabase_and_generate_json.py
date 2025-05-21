"""
Script : upload automatique de vidéos locales sur Supabase Storage + génération du import_films.json

- Upload chaque .mp4 d'un dossier local sur un bucket Supabase Storage
- Génère pour chaque vidéo l'URL publique
- Crée un import_films.json prêt à l'import admin

Dépendances :
    pip install supabase
"""

import os
import json
from supabase import create_client, Client

# --------- À PERSONNALISER -----------
SUPABASE_URL = "https://xxx.supabase.co"  # Ton URL Supabase
SUPABASE_KEY = "xxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxxx"  # Clé service role (pas la clé anonyme !)
BUCKET = "videos"  # Nom du bucket storage
LOCAL_DIR = "mes_videos"  # Dossier local où sont les vidéos
# --------------------------------------

def log(msg):
    print(msg)

def get_public_url(filename):
    return f"{SUPABASE_URL}/storage/v1/object/public/{BUCKET}/{filename}"

def main():
    supabase: Client = create_client(SUPABASE_URL, SUPABASE_KEY)
    files = [f for f in os.listdir(LOCAL_DIR) if f.endswith(".mp4")]
    films = []
    for filename in files:
        local_path = os.path.join(LOCAL_DIR, filename)
        log(f"Upload de {filename} ...")
        with open(local_path, "rb") as filedata:
            # Upload la vidéo dans le bucket Supabase
            res = supabase.storage().from_(BUCKET).upload(filename, filedata, {"content-type": "video/mp4"}, upsert=True)
            if "Key" in res:
                url = get_public_url(filename)
                log(f"  -> OK : {url}")
                films.append({
                    "title": os.path.splitext(filename)[0],
                    "video_url": url
                })
            else:
                log(f"  -> Erreur upload : {res}")
    # Génère le JSON d'import
    with open("import_films.json", "w", encoding="utf-8") as f:
        json.dump(films, f, ensure_ascii=False, indent=2)
    log("import_films.json généré.")

if __name__ == "__main__":
    main()