import requests
from bs4 import BeautifulSoup
import json
import time

def scrap_moviebox():
    base_url = "https://moviebox.ng/fr/movies"
    films = []
    r = requests.get(base_url)
    soup = BeautifulSoup(r.content, "html.parser")
    for card in soup.select("a[href*='/movies/']"):
        href = card.get("href")
        title = card.get("title") or card.text.strip()
        if not href.startswith("http"):
            href = "https://moviebox.ng" + href
        r2 = requests.get(href)
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
        time.sleep(1)
    return films

def scrap_xalaflix():
    base_url = "https://xalaflix.io/movies"
    films = []
    r = requests.get(base_url)
    soup = BeautifulSoup(r.content, "html.parser")
    for card in soup.select("a[href*='/movie/']"):
        href = card.get("href")
        title = card.get("title") or card.text.strip()
        if not href.startswith("http"):
            href = "https://xalaflix.io" + href
        r2 = requests.get(href)
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
        time.sleep(1)
    return films

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
    print("Scraping MovieBox...")
    all_films += scrap_moviebox()
    print("Scraping Xalaflix...")
    all_films += scrap_xalaflix()
    # Ajoute ici scrap_mirror66 et scrap_coflix si besoin (avec Playwright si dynamique)
    films = deduplicate(all_films)
    with open("import_films.json", "w", encoding="utf-8") as f:
        json.dump(films, f, ensure_ascii=False, indent=2)
    print(f"{len(films)} films trouvés, sauvegardés dans import_films.json.")

if __name__ == "__main__":
    main()