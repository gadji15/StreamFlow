"""
Script MovieBox ultra-robuste : extraction Titre + URL vidéo depuis le JSON NUXT côté client.

- Parcourt la page liste des films MovieBox (https://moviebox.ng/fr/web/film)
- Ouvre chaque fiche film (avec Playwright, headless)
- Extrait le script JSON "__NUXT_DATA__" de la fiche
- Recherche récursive dans la structure imbriquée : "title" et "videoAddress" (ou "url" .mp4)
- Génère un import_films.json minimal pour l'import admin

Dépendances :
    pip install playwright beautifulsoup4
    python -m playwright install
"""

# EXECUTER : cd scripts
#    python fetch_moviebox_nuxt.py

import json
import time
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

MOVIEBOX_LIST_URL = "https://moviebox.ng/fr/web/film"
MOVIEBOX_PREFIX = "https://moviebox.ng"

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def find_value(obj, key):
    """
    Recherche récursive d'une clé dans un JSON imbriqué (listes/dicos)
    Renvoie la première valeur trouvée.
    """
    if isinstance(obj, dict):
        for k, v in obj.items():
            if k == key and v:
                return v
            res = find_value(v, key)
            if res:
                return res
    elif isinstance(obj, list):
        for item in obj:
            res = find_value(item, key)
            if res:
                return res
    return None

def get_film_links(p):
    """
    Récupère tous les liens vers les fiches films à partir de la page liste MovieBox.
    Adapte ici le sélecteur si besoin !
    """
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(MOVIEBOX_LIST_URL, wait_until="networkidle")
    time.sleep(2)
    # Cherche tous les liens vers des fiches films
    # Adapte le sélecteur si besoin (ex : 'a[href*="/fr/movies/"]')
    links = []
    for a in page.query_selector_all('a'):
        href = a.get_attribute('href')
        if href and '/fr/movies/' in href:
            # Pour éviter les doublons
            full_url = href if href.startswith('http') else MOVIEBOX_PREFIX + href
            if full_url not in links:
                links.append(full_url)
    browser.close()
    log(f"{len(links)} fiches films trouvées.")
    return links

def extract_film_title_video(page):
    """
    Sur une fiche film ouverte avec Playwright, extrait le script NUXT et parse le couple (titre, vidéo).
    """
    # Récupère le script type="application/json" id="__NUXT_DATA__"
    script = page.query_selector('script#__NUXT_DATA__')
    if not script:
        return None, None
    try:
        nuxt_data = json.loads(script.inner_text())
    except Exception as e:
        log(f"Erreur parsing JSON NUXT: {e}")
        return None, None
    title = find_value(nuxt_data, "title")
    video = find_value(nuxt_data, "videoAddress")
    # fallback si pas de clé "videoAddress"
    if not video:
        video = find_value(nuxt_data, "url")
        # Optionnel : ne garder que les .mp4
        if video and not video.endswith('.mp4'):
            video = None
    return title, video

def main():
    with sync_playwright() as p:
        # 1. Récupère tous les liens fiches films
        links = get_film_links(p)
        if not links:
            print("Aucun film trouvé.")
            return
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        results = []
        for i, url in enumerate(links):
            log(f"[{i+1}/{len(links)}] Ouverture de {url}")
            try:
                page.goto(url, wait_until="domcontentloaded")
                time.sleep(1.5)
                title, video_url = extract_film_title_video(page)
                if title and video_url:
                    log(f"OK: {title} | {video_url}")
                    results.append({"title": title, "video_url": video_url})
                else:
                    log("Aucune vidéo trouvée sur cette fiche.")
            except PWTimeout:
                log("Timeout sur la fiche, on passe à la suivante.")
            except Exception as e:
                log(f"Erreur inattendue: {e}")
            # Délai pour ne pas spammer
            time.sleep(1.3)
        browser.close()
        log(f"{len(results)} films exploitables.")
        with open("import_films.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        log("Fichier import_films.json généré !")

if __name__ == "__main__":
    main()