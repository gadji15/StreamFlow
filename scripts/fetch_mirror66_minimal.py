"""
Script minimal pour Mirror66.lol
- Récupère tous les liens de films sur https://mirror66.lol/films/
- Extrait le titre (attribut alt) et le lien (href)
- Va sur chaque fiche, trouve le lecteur vidéo (iframe, video...) et extrait l'URL vidéo
- Génère import_films.json avec {title, video_url}
"""

import json
import time
import random
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

MIRROR66_LIST_URL = "https://mirror66.lol/films/"
MIRROR66_PREFIX = "https://mirror66.lol"

# Mode headful par défaut pour voir ce qui bloque (change en True pour invisible)
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
    browser = p.chromium.launch(headless=HEADLESS)
    page = browser.new_page()
    ua = random.choice(USER_AGENTS)
    page.set_extra_http_headers({"User-Agent": ua})
    page.goto(MIRROR66_LIST_URL, wait_until="networkidle")
    time.sleep(3)
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

def extract_video_url_multi(page):
    """
    Clique chaque onglet de lecteur, extrait l'URL de l'iframe pour chaque source.
    Retourne un dict {nom_source: url}
    """
    video_links = {}
    tab_names = ["VIDZY", "DOOD", "FILMOON", "VOE", "UQLOAD"]
    for tab in tab_names:
        try:
            tab_elem = page.query_selector(f'text="{tab}"')
            if tab_elem:
                tab_elem.click()
                log(f"  - Onglet {tab} sélectionné")
                time.sleep(2.5)
                iframe = page.query_selector('iframe')
                if iframe:
                    src = iframe.get_attribute('src')
                    if src and src.startswith('http'):
                        video_links[tab] = src
                        log(f"    > Lien trouvé pour {tab}: {src}")
        except Exception as e:
            log(f"    ! Erreur onglet {tab}: {e}")
    return video_links

def scrape_film(page, url, retries=2):
    for attempt in range(retries):
        try:
            ua = random.choice(USER_AGENTS)
            page.set_extra_http_headers({"User-Agent": ua})
            page.goto(url, wait_until="domcontentloaded")
            time.sleep(random.uniform(2.5, 4))
            video_urls = extract_video_url_multi(page)
            if video_urls:
                # Prend VIDZY par défaut, sinon le premier trouvé
                preferred = video_urls.get("VIDZY") or next(iter(video_urls.values()))
                return preferred, video_urls
            else:
                log(f"Tentative {attempt+1}: pas de vidéo trouvée.")
        except PWTimeout:
            log(f"Tentative {attempt+1}: Timeout sur la fiche.")
        except Exception as e:
            log(f"Tentative {attempt+1}: Erreur inattendue: {e}")
        time.sleep(random.uniform(3, 6))
    return None, {}

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
            video_url, all_sources = scrape_film(page, film['url'])
            if video_url:
                log(f"OK: {film['title']} | {video_url}")
                results.append({
                    "title": film['title'],
                    "video_url": video_url,
                    "all_sources": all_sources
                })
            else:
                log("Aucune vidéo trouvée après retries.")
            # Délai anti-bot fort
            time.sleep(random.uniform(5, 9))
        browser.close()
        log(f"{len(results)} films exploitables.")
        with open("import_films.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        log("Fichier import_films.json généré !")

if __name__ == "__main__":
    main()