"""
Script ultra-robuste : extraction automatique des liens de téléchargement MovieBox
- Va sur la page catalogue des films
- Récupère tous les liens de fiches
- Ouvre chaque fiche, attend <video class="art-video">
- Extrait le titre + video_url (src de la balise <video>)
- Gère timeouts, anti-bot, user-agent aléatoire, logs
- Génère import_films.json {"title", "video_url"}
Dépendances : pip install playwright beautifulsoup4
"""

import json
import time
import random
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

MOVIEBOX_LIST_URL = "https://moviebox.ng/fr/web/film"
MOVIEBOX_PREFIX = "https://moviebox.ng"
HEADLESS = False

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/117.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]

def log(msg):
    print(f"[{time.strftime('%H:%M:%S')}] {msg}")

def get_film_links(p):
    """
    Va sur la page catalogue et récupère tous les liens vers les fiches films + titres.
    """
    browser = p.chromium.launch(headless=HEADLESS)
    page = browser.new_page()
    ua = random.choice(USER_AGENTS)
    page.set_extra_http_headers({"User-Agent": ua})
    page.goto(MOVIEBOX_LIST_URL, wait_until="networkidle")
    time.sleep(3)
    links = []
    # Cherche tous les liens fiche films (adapte si MovieBox change son HTML !)
    for a in page.query_selector_all('a[href*="/fr/movies/"]'):
        href = a.get_attribute('href')
        title = a.get_attribute('title') or a.inner_text().strip()
        if href and title:
            full_url = href if href.startswith('http') else MOVIEBOX_PREFIX + href
            links.append({"title": title, "url": full_url})
    browser.close()
    log(f"{len(links)} fiches films trouvées.")
    return links

def extract_video_download_url(page):
    """
    Attend et extrait le src de <video class="art-video"> (lien de téléchargement direct)
    """
    try:
        video = page.wait_for_selector('video.art-video', timeout=9000)
        src = video.get_attribute('src')
        if src and src.startswith('http'):
            return src
    except Exception as e:
        log(f"  ! Pas de balise <video> trouvée : {e}")
    return None

def main():
    with sync_playwright() as p:
        links = get_film_links(p)
        if not links:
            print("Aucun film trouvé.")
            return
        browser = p.chromium.launch(headless=HEADLESS)
        page = browser.new_page()
        results = []
        for i, film in enumerate(links):
            log(f"[{i+1}/{len(links)}] {film['title']}")
            try:
                ua = random.choice(USER_AGENTS)
                page.set_extra_http_headers({"User-Agent": ua})
                page.goto(film['url'], wait_until="domcontentloaded")
                time.sleep(random.uniform(2.5, 4))
                video_url = extract_video_download_url(page)
                if video_url:
                    log(f"OK: {film['title']} | {video_url}")
                    results.append({
                        "title": film['title'],
                        "video_url": video_url
                    })
                else:
                    log("Aucun lien vidéo téléchargeable trouvé.")
            except PWTimeout:
                log("Timeout sur la fiche, on passe à la suivante.")
            except Exception as e:
                log(f"Erreur inattendue: {e}")
            time.sleep(random.uniform(6, 11))
        browser.close()
        log(f"{len(results)} films exploitables.")
        with open("import_films.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        log("Fichier import_films.json généré !")

if __name__ == "__main__":
    main()