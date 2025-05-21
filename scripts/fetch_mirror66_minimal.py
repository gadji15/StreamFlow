"""
Script minimal pour Mirror66.lol
- Récupère tous les liens de films sur https://mirror66.lol/films/
- Extrait le titre (attribut alt) et le lien (href)
- Va sur chaque fiche, trouve le lecteur vidéo (iframe, video...) et extrait l'URL vidéo
- Génère import_films.json avec {title, video_url}
"""

import json
import time
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

MIRROR66_LIST_URL = "https://mirror66.lol/films/"
MIRROR66_PREFIX = "https://mirror66.lol"

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def get_film_links(p):
    browser = p.chromium.launch(headless=True)
    page = browser.new_page()
    page.goto(MIRROR66_LIST_URL, wait_until="networkidle")
    time.sleep(2)
    links = []
    for a in page.query_selector_all('a.short-poster.img-box.with-mask'):
        href = a.get_attribute('href')
        title = a.get_attribute('alt') or a.inner_text().strip()
        if href and title:
            full_url = href if href.startswith('http') else MIRROR66_PREFIX + href
            links.append({"title": title, "url": full_url})
    browser.close()
    log(f"{len(links)} fiches films trouvées.")
    return links

def extract_video_url(page):
    # Essaie d'abord iframe, puis video
    iframe = page.query_selector('iframe')
    if iframe:
        src = iframe.get_attribute('src')
        if src and src.startswith('http'):
            return src
    video = page.query_selector('video')
    if video:
        src = video.get_attribute('src')
        if src and src.startswith('http'):
            return src
    # Fallback: cherche un lien .mp4 dans tout le HTML
    html = page.content()
    for part in html.split('"'):
        if part.endswith('.mp4') and part.startswith('http'):
            return part
    return None

def main():
    with sync_playwright() as p:
        links = get_film_links(p)
        if not links:
            print("Aucun film trouvé.")
            return
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        results = []
        for i, film in enumerate(links):
            log(f"[{i+1}/{len(links)}] {film['title']}")
            try:
                page.goto(film['url'], wait_until="domcontentloaded")
                time.sleep(1.5)
                video_url = extract_video_url(page)
                if video_url:
                    log(f"OK: {film['title']} | {video_url}")
                    results.append({"title": film['title'], "video_url": video_url})
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