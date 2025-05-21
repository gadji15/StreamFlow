import requests
from bs4 import BeautifulSoup
import json
import time
import logging
from playwright.sync_api import sync_playwright

logging.basicConfig(
    level=logging.INFO,
    format='%(asctime)s - %(levelname)s: %(message)s',
    handlers=[logging.FileHandler("fetch_videos.log"), logging.StreamHandler()]
)

def safe_get(url, **kwargs):
    try:
        r = requests.get(url, timeout=15, **kwargs)
        r.raise_for_status()
        return r
    except Exception as e:
        logging.error(f"Erreur GET {url}: {e}")
        return None

def scrap_moviebox():
    base_url = "https://moviebox.ng/fr/movies"
    films = []
    r = safe_get(base_url)
    if not r:
        return films
    soup = BeautifulSoup(r.content, "html.parser")
    for card in soup.select("a[href*='/movies/']"):
        href = card.get("href")
        title = card.get("title") or card.text.strip()
        if not href: continue
        if not href.startswith("http"):
            href = "https://moviebox.ng" + href
        r2 = safe_get(href)
        if not r2: continue
        soup2 = BeautifulSoup(r2.content, "html.parser")
        video = soup2.select_one("iframe, video")
        video_url = video["src"] if video else None
        if video_url:
            films.append({
                "title": title,
                "video_url": video_url,
                "image": soup2.select_one("img")["src"] if soup2.select_one("img") else "",
                "description": soup2.title.string if soup2.title else "",
                "source": "MovieBox"
            })
        time.sleep(0.5)
    logging.info(f"[MovieBox] {len(films)} films trouvés.")
    return films

def scrap_xalaflix():
    base_url = "https://xalaflix.io/movies"
    films = []
    r = safe_get(base_url)
    if not r:
        return films
    soup = BeautifulSoup(r.content, "html.parser")
    for card in soup.select("a[href*='/movie/']"):
        href = card.get("href")
        title = card.get("title") or card.text.strip()
        if not href: continue
        if not href.startswith("http"):
            href = "https://xalaflix.io" + href
        r2 = safe_get(href)
        if not r2: continue
        soup2 = BeautifulSoup(r2.content, "html.parser")
        video = soup2.select_one("iframe, video")
        video_url = video["src"] if video else None
        if video_url:
            films.append({
                "title": title,
                "video_url": video_url,
                "image": soup2.select_one("img")["src"] if soup2.select_one("img") else "",
                "description": soup2.title.string if soup2.title else "",
                "source": "Xalaflix"
            })
        time.sleep(0.5)
    logging.info(f"[Xalaflix] {len(films)} films trouvés.")
    return films

def scrap_playwright(base_url, card_selector, detail_prefix, source_name):
    results = []
    with sync_playwright() as p:
        browser = p.chromium.launch(headless=True)
        page = browser.new_page()
        page.goto(base_url, timeout=40000)
        cards = page.query_selector_all(card_selector)
        for card in cards:
            href = card.get_attribute("href")
            title = card.inner_text().strip()
            if not href: continue
            if not href.startswith("http"):
                detail_url = detail_prefix + href
            else:
                detail_url = href
            try:
                detail = browser.new_page()
                detail.goto(detail_url, timeout=40000)
                detail.wait_for_selector("iframe, video", timeout=10000)
                video = detail.query_selector("iframe, video")
                video_url = video.get_attribute("src") if video else None
                img = detail.query_selector("img")
                image_url = img.get_attribute("src") if img else ""
                description = detail.title()
                if video_url:
                    results.append({
                        "title": title,
                        "video_url": video_url,
                        "image": image_url,
                        "description": description,
                        "source": source_name
                    })
                detail.close()
            except Exception as e:
                logging.warning(f"[{source_name}] Erreur page: {detail_url} - {e}")
            time.sleep(0.5)
        browser.close()
    logging.info(f"[{source_name}] {len(results)} films trouvés.")
    return results

def scrap_mirror66():
    return scrap_playwright(
        base_url="https://mirror66.lol/", 
        card_selector="a[href*='/watch/']", 
        detail_prefix="https://mirror66.lol", 
        source_name="Mirror66"
    )

def scrap_coflix():
    return scrap_playwright(
        base_url="https://coflix.mov/", 
        card_selector="a[href*='/film/'], a[href*='/movie/']", 
        detail_prefix="https://coflix.mov", 
        source_name="Coflix"
    )

def deduplicate(films):
    seen = set()
    unique = []
    for f in films:
        key = f["video_url"]
        if key not in seen:
            unique.append(f)
            seen.add(key)
    return unique

def main():
    all_films = []
    all_films += scrap_moviebox()
    all_films += scrap_xalaflix()
    all_films += scrap_mirror66()
    all_films += scrap_coflix()
    films = deduplicate(all_films)
    with open("import_films.json", "w", encoding="utf-8") as f:
        json.dump(films, f, ensure_ascii=False, indent=2)
    logging.info(f"{len(films)} films uniques sauvegardés dans import_films.json.")

if __name__ == "__main__":
    main()