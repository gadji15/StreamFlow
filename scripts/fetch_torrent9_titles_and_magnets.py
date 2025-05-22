"""
Script minimal : scrape Torrent9 pour récupérer {title, video_url (magnet)} pour chaque film.
À utiliser si tu as l'autorisation Torrent9.
Dépendances : pip install requests beautifulsoup4
"""

import requests
from bs4 import BeautifulSoup
import json

BASE_URL = "https://www.torrent9.to"
FILM_LIST_URL = BASE_URL + "/films"

def log(msg):
    print(msg)

def get_film_links():
    res = requests.get(FILM_LIST_URL)
    soup = BeautifulSoup(res.text, "html.parser")
    links = []
    for a in soup.select("a[href^='/film/']"):
        href = a["href"]
        if href.startswith("/film/"):
            links.append(BASE_URL + href)
    return list(set(links))  # supprime les doublons

def get_title_and_magnet(detail_url):
    detail_res = requests.get(detail_url)
    soup = BeautifulSoup(detail_res.text, "html.parser")
    title = soup.select_one("h1").text.strip() if soup.select_one("h1") else ""
    magnet = soup.find("a", href=lambda x: x and x.startswith("magnet:"))
    video_url = magnet["href"] if magnet else ""
    return title, video_url

def main():
    links = get_film_links()
    log(f"{len(links)} films trouvés.")
    results = []
    for i, url in enumerate(links):
        log(f"[{i+1}/{len(links)}] {url}")
        try:
            title, video_url = get_title_and_magnet(url)
            if title and video_url:
                log(f"  -> OK: {title}")
                results.append({"title": title, "video_url": video_url})
            else:
                log("  -> Pas de magnet ou de titre trouvé.")
        except Exception as e:
            log(f"  -> Erreur: {e}")
    with open("import_films.json", "w", encoding="utf-8") as f:
        json.dump(results, f, ensure_ascii=False, indent=2)
    log("import_films.json généré.")

if __name__ == "__main__":
    main()