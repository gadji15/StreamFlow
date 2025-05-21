"""
Script avancé Playwright Mirror66 : 
- Va sur chaque fiche film
- Clique sur l'onglet désiré (PREMIUM, VIDZY, ...)
- Clique sur le bouton "play"
- Attend le chargement du player (iframe)
- Extrait le lien vidéo
- Génère import_films.json avec {title, video_url, source}
"""

import json
import time
import random
from playwright.sync_api import sync_playwright, TimeoutError as PWTimeout

MIRROR66_LIST_URL = "https://mirror66.lol/films/"
MIRROR66_PREFIX = "https://mirror66.lol"
HEADLESS = False

USER_AGENTS = [
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (Macintosh; Intel Mac OS X 10_15_7) AppleWebKit/537.36 (KHTML, like Gecko) Chrome/124.0.0.0 Safari/537.36",
    "Mozilla/5.0 (X11; Ubuntu; Linux x86_64; rv:109.0) Gecko/20100101 Firefox/117.0",
    "Mozilla/5.0 (Windows NT 10.0; Win64; x64; rv:124.0) Gecko/20100101 Firefox/124.0",
]

SOURCE_PRIORITY = ["PREMIUM", "VIDZY", "DOOD", "FILMOON", "VOE", "UQLOAD"]

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

def extract_video_url_with_play(page, source_tabs=SOURCE_PRIORITY):
    """
    Pour chaque source possible :
    - Clique sur l'onglet (ex: "VIDZY")
    - Clique sur le bouton play (triangle orange)
    - Attend l'apparition de l'iframe
    - Extrait le src de l'iframe
    Retourne le premier lien trouvé (par priorité), et la source correspondante
    """
    for tab in source_tabs:
        try:
            tab_elem = page.query_selector(f'text="{tab}"')
            if tab_elem:
                tab_elem.click()
                log(f"  - Onglet {tab} sélectionné")
                time.sleep(1.5)
                # Clique sur le bouton play si présent (triangle orange)
                play_btn = page.query_selector('button, .vjs-big-play-button, .fa-play-circle3, .vjs-icon-play')
                if not play_btn:
                    # Icone SVG ou div clickable ?
                    play_btn = page.query_selector('svg, div[onclick*="play"], div:has(.fa-play-circle3)')
                if play_btn:
                    try:
                        play_btn.click()
                        log("    > Bouton play cliqué")
                        time.sleep(2.5)
                    except Exception as e:
                        log(f"    ! Erreur clic play: {e}")
                # Attend l'apparition de l'iframe (player)
                try:
                    iframe = page.wait_for_selector('iframe', timeout=7000)
                    src = iframe.get_attribute('src')
                    if src and src.startswith('http'):
                        log(f"    > Lien trouvé pour {tab}: {src}")
                        return src, tab
                except Exception as e:
                    log(f"    ! Aucun iframe trouvé après play pour {tab} : {e}")
        except Exception as e:
            log(f"    ! Erreur onglet {tab}: {e}")
    return None, None

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
                video_url, source = extract_video_url_with_play(page)
                if video_url:
                    log(f"OK: {film['title']} | {video_url} | {source}")
                    results.append({
                        "title": film['title'],
                        "video_url": video_url,
                        "source": source
                    })
                else:
                    log("Aucune vidéo trouvée après essais sur tous les onglets.")
            except PWTimeout:
                log("Timeout sur la fiche, on passe à la suivante.")
            except Exception as e:
                log(f"Erreur inattendue: {e}")
            time.sleep(random.uniform(6, 12))
        browser.close()
        log(f"{len(results)} films exploitables.")
        with open("import_films.json", "w", encoding="utf-8") as f:
            json.dump(results, f, ensure_ascii=False, indent=2)
        log("Fichier import_films.json généré !")

if __name__ == "__main__":
    main()